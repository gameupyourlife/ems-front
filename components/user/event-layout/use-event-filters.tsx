"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import type { EventInfo } from "@/lib/types-old"

interface UseEventFiltersProps {
  events: EventInfo[]
  searchQuery: string
  initialFilters?: {
    category: string[]
    dateType: "single" | "range"
    singleDate: Date | null
    dateRange: {
      start: Date | null
      end: Date | null
    }
    location: string
  }
  onFilterChange?: (filters: any) => void
}

export function useEventFilters({ events, searchQuery, initialFilters, onFilterChange }: UseEventFiltersProps) {
  // Lokale Zustände für Filter, Ansicht und Eingabefelder
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[]
    dateType: "single" | "range"
    singleDate: Date | null
    dateRange: {
      start: Date | null
      end: Date | null
    }
    location: string
  }>({
    category: [],
    dateType: "single",
    singleDate: null,
    dateRange: { start: null, end: null },
    location: "",
  })
  const uniqueCategories = Array.from(new Set(events.map((e) => e.category).filter(Boolean))).map((cat) =>
    typeof cat === "string" ? cat : String(cat),
  )
  const getAvailableCategories = () => {
    return uniqueCategories
  }
  const [locationInput, setLocationInput] = useState(initialFilters?.location || "")
  const [singleDateInput, setSingleDateInput] = useState(
    initialFilters?.singleDate ? format(initialFilters.singleDate, "dd.MM.yyyy") : "",
  )
  const [startDateInput, setStartDateInput] = useState(
    initialFilters?.dateRange.start ? format(initialFilters.dateRange.start, "dd.MM.yyyy") : "",
  )
  const [endDateInput, setEndDateInput] = useState(
    initialFilters?.dateRange.end ? format(initialFilters.dateRange.end, "dd.MM.yyyy") : "",
  )

  const [singleDateError, setSingleDateError] = useState<string | null>(null)
  const [startDateError, setStartDateError] = useState<string | null>(null)
  const [endDateError, setEndDateError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"single" | "range">(initialFilters?.dateType || "single")
  const [filteredEvents, setFilteredEvents] = useState<EventInfo[]>(events)

  // Filter anwenden: Suche, Kategorie, Datum, Ort
  const applyFilters = useCallback(() => {
    let filtered = [...events]

    // Suche nach Text in Titel, Beschreibung oder Organisation
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(
        (event) =>
          (event.title?.toLowerCase() || "").includes(normalizedQuery) ||
          (event.description?.toLowerCase() || "").includes(normalizedQuery) ||
          (event.organization?.toLowerCase() || "").includes(normalizedQuery),
      )
    }

    // Kategorie-Filter
    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter((event) => {
        const eventCategory = typeof event.category === "string" ? event.category : String(event.category)
        return selectedFilters.category.some((selectedCat) => eventCategory.toLowerCase() === selectedCat.toLowerCase())
      })
    }

    // Datums-Filter
    if (selectedFilters.dateType === "single" && selectedFilters.singleDate) {
      const filterDate = selectedFilters.singleDate
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.start)
        return (
          eventDate.getFullYear() === filterDate.getFullYear() &&
          eventDate.getMonth() === filterDate.getMonth() &&
          eventDate.getDate() === filterDate.getDate()
        )
      })
    } else if (selectedFilters.dateType === "range") {
      if (selectedFilters.dateRange.start) {
        const startDate = new Date(selectedFilters.dateRange.start)
        // Zeit auf Tagesbeginn setzen
        startDate.setHours(0, 0, 0, 0)
        filtered = filtered.filter((event) => {
          const eventEndDate = new Date(event.end || event.start)
          return eventEndDate >= startDate
        })
      }
      if (selectedFilters.dateRange.end) {
        const endDate = new Date(selectedFilters.dateRange.end)
        // Zeit auf Tagesende setzen
        endDate.setHours(23, 59, 59, 999)
        filtered = filtered.filter((event) => {
          const eventStartDate = new Date(event.start)
          return eventStartDate <= endDate
        })
      }
    }

    // Standort-Filter
    if (selectedFilters.location.trim()) {
      const normalizedLocation = selectedFilters.location.trim().toLowerCase()
      filtered = filtered.filter((event) => event.location.toLowerCase().includes(normalizedLocation))
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, selectedFilters])

  // Kategorie auswählen oder abwählen
  const toggleCategory = (category: string) => {
    setSelectedFilters((prev) => {
      const newCategories = prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category]

      return {
        ...prev,
        category: newCategories,
      }
    })
  }

  // Datum im Format TT.MM.JJJJ validieren
  const validateDate = (dateString: string): Date | null => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return null
    }

    const [tag, monat, jahr] = dateString.split(".").map(Number)
    const date = new Date(jahr, monat - 1, tag)
    if (date.getFullYear() !== jahr || date.getMonth() !== monat - 1 || date.getDate() !== tag) {
      return null
    }

    return date
  }

  // Einzelnes Datum validieren und setzen
  const validateAndSetSingleDate = (dateString: string) => {
    setSingleDateError(null)

    if (!dateString) {
      return true
    }

    const date = validateDate(dateString)
    if (!date) {
      setSingleDateError("Ungültiges Datumsformat")
      return false
    }

    setSelectedFilters((prev) => ({
      ...prev,
      singleDate: date,
      dateType: "single",
    }))
    return true
  }

  // Startdatum validieren und setzen
  const validateAndSetStartDate = (dateString: string) => {
    setStartDateError(null)

    if (!dateString) {
      return true
    }

    const date = validateDate(dateString)
    if (!date) {
      setStartDateError("Ungültiges Datumsformat")
      return false
    }

    setSelectedFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        start: date,
      },
      dateType: "range",
    }))
    return true
  }

  // Enddatum validieren und setzen
  const validateAndSetEndDate = (dateString: string) => {
    setEndDateError(null)

    if (!dateString) {
      return true
    }

    const date = validateDate(dateString)
    if (!date) {
      setEndDateError("Ungültiges Datumsformat")
      return false
    }

    setSelectedFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        end: date,
      },
      dateType: "range",
    }))
    return true
  }

  // Prüfen, ob das Startdatum vor dem Enddatum liegt
  const validateDateRange = () => {
    if (selectedFilters.dateRange.start && selectedFilters.dateRange.end) {
      if (selectedFilters.dateRange.start > selectedFilters.dateRange.end) {
        setEndDateError("Enddatum muss nach dem Startdatum liegen")
        return false
      }
    }
    return true
  }

  // Tab für Einzel- oder Zeitraum-Auswahl wechseln
  const handleTabChange = (value: string) => {
    if (value === "single" || value === "range") {
      setActiveTab(value)
      setSelectedFilters((prev) => ({
        ...prev,
        dateType: value,
      }))
    }
  }

  // Standort-Filter anwenden
  const applyLocationFilter = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      location: locationInput,
    }))
  }

  // Alle Filter zurücksetzen
  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      dateType: "single",
      singleDate: null,
      dateRange: {
        start: null,
        end: null,
      },
      location: "",
    })
    setLocationInput("")
    setSingleDateInput("")
    setStartDateInput("")
    setEndDateInput("")
    setSingleDateError(null)
    setStartDateError(null)
    setEndDateError(null)
  }

  // Filter anwenden und ggf. Callback auslösen
  const handleApplyFilters = () => {
    let isValid = true

    if (activeTab === "single") {
      if (singleDateInput && singleDateInput.length === 10) {
        isValid = validateAndSetSingleDate(singleDateInput)
      }
    } else {
      if (startDateInput && startDateInput.length === 10) {
        isValid = validateAndSetStartDate(startDateInput) && isValid
      }
      if (endDateInput && endDateInput.length === 10) {
        isValid = validateAndSetEndDate(endDateInput) && isValid
      }
      if (isValid && startDateInput && endDateInput) {
        isValid = validateDateRange() && isValid
      }
    }

    if (isValid) {
      applyLocationFilter()

      if (onFilterChange) {
        onFilterChange({
          ...selectedFilters,
          location: locationInput,
        })
      }
    }
  }

  return {
    selectedFilters,
    setSelectedFilters,
    locationInput,
    setLocationInput,
    singleDateInput,
    setSingleDateInput,
    startDateInput,
    setStartDateInput,
    endDateInput,
    setEndDateInput,
    singleDateError,
    setSingleDateError,
    startDateError,
    setStartDateError,
    endDateError,
    setEndDateError,
    activeTab,
    setActiveTab,
    filteredEvents,
    setFilteredEvents,
    toggleCategory,
    validateAndSetSingleDate,
    validateAndSetStartDate,
    validateAndSetEndDate,
    validateDateRange,
    handleTabChange,
    applyLocationFilter,
    clearAllFilters,
    handleApplyFilters,
    applyFilters,
    getAvailableCategories,
  }
}
