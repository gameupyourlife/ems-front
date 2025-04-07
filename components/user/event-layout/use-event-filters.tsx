"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import type { EventInfo } from "@/lib/types"

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

  // Filter anwenden (Suche, Kategorie, Datum, Ort)
  const applyFilters = useCallback(() => {
    let filtered = [...events]

    // Suche nach Text im Titel, Beschreibung oder Organisation
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(normalizedQuery) ||
          event.description.toLowerCase().includes(normalizedQuery) ||
          event.organization.toLowerCase().includes(normalizedQuery),
      )
    }

    // Kategorie-Filter
    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter((event) =>
        selectedFilters.category.some((cat) => event.category.toLowerCase().includes(cat.toLowerCase())),
      )
    }

    // Datumsfilter
    if (selectedFilters.dateType === "single" && selectedFilters.singleDate) {
      const filterDate = selectedFilters.singleDate
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getFullYear() === filterDate.getFullYear() &&
          eventDate.getMonth() === filterDate.getMonth() &&
          eventDate.getDate() === filterDate.getDate()
        )
      })
    } else if (selectedFilters.dateType === "range") {
      if (selectedFilters.dateRange.start) {
        filtered = filtered.filter((event) => new Date(event.date) >= selectedFilters.dateRange.start!)
      }
      if (selectedFilters.dateRange.end) {
        filtered = filtered.filter((event) => new Date(event.date) <= selectedFilters.dateRange.end!)
      }
    }

    // Standort-Filter
    if (selectedFilters.location.trim()) {
      const normalizedLocation = selectedFilters.location.trim().toLowerCase()
      filtered = filtered.filter((event) => event.location.toLowerCase().includes(normalizedLocation))
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, selectedFilters])

  // Kategorie auswählen/abwählen
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

  // Datum validieren im Format TT.MM.JJJJ
  const validateDate = (dateString: string): Date | null => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return null
    }

    const [day, month, year] = dateString.split(".").map(Number)
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null
    }

    return date
  }

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

  const validateDateRange = () => {
    if (selectedFilters.dateRange.start && selectedFilters.dateRange.end) {
      if (selectedFilters.dateRange.start > selectedFilters.dateRange.end) {
        setEndDateError("Enddatum muss nach dem Startdatum liegen")
        return false
      }
    }
    return true
  }

  const handleTabChange = (value: string) => {
    if (value === "single" || value === "range") {
      setActiveTab(value)
      setSelectedFilters((prev) => ({
        ...prev,
        dateType: value,
      }))
    }
  }

  const applyLocationFilter = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      location: locationInput,
    }))
  }

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
  }
}

