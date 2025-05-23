"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import type { EventInfo } from "@/lib/types-old"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronsUpDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

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

interface FilterDropdownProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  selectedFilters: {
    category: string[]
    dateType: "single" | "range"
    singleDate: Date | null
    dateRange: {
      start: Date | null
      end: Date | null
    }
    location: string
  }
  toggleCategory: (category: string) => void
  locationInput: string
  setLocationInput: (value: string) => void
  singleDateInput: string
  setSingleDateInput: (value: string) => void
  startDateInput: string
  setStartDateInput: (value: string) => void
  endDateInput: string
  setEndDateInput: (value: string) => void
  singleDateError: string | null
  startDateError: string | null
  endDateError: string | null
  activeTab: "single" | "range"
  handleTabChange: (value: string) => void
  validateAndSetSingleDate: (dateString: string) => boolean
  validateAndSetStartDate: (dateString: string) => boolean
  validateAndSetEndDate: (dateString: string) => boolean
  validateDateRange: () => boolean
  handleApplyFilters: () => void
  clearAllFilters: () => void
  availableCategories?: string[]
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

    // Suche nach Text im Titel, Beschreibung oder organization
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
        selectedFilters.category.some((cat) => event.category.toString().toLowerCase().includes(cat.toLowerCase())),
      )
    }

    // Datumsfilter
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
        filtered = filtered.filter((event) => new Date(event.start) >= selectedFilters.dateRange.start!)
      }
      if (selectedFilters.dateRange.end) {
        filtered = filtered.filter((event) => new Date(event.end) <= selectedFilters.dateRange.end!)
      }
    }

    // Standort-Filter
    if (selectedFilters.location.trim()) {
      const normalizedLocation = selectedFilters.location.trim().toLowerCase()
      filtered = filtered.filter((event) => event.location.toLowerCase().includes(normalizedLocation))
    }

    setFilteredEvents(filtered)
  }, [events, searchQuery, selectedFilters])

  // Add this after the applyFilters function
  const getAvailableCategories = useCallback(() => {
    const categories = new Set<string>()

    events.forEach((event) => {
      if (typeof event.category === "string") {
        categories.add(event.category.toLowerCase())
      } else if (Array.isArray(event.category)) {
        (event.category as string[]).forEach((cat) => {
          if (typeof cat === "string") {
            categories.add(cat.toLowerCase())
          }
        })
      }
    })

    return Array.from(categories)
  }, [events])

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
    availableCategories: getAvailableCategories(),
  }
}

export default function FilterDropdown({
  isOpen,
  setIsOpen,
  selectedFilters,
  toggleCategory,
  locationInput,
  setLocationInput,
  singleDateInput,
  setSingleDateInput,
  startDateInput,
  setStartDateInput,
  endDateInput,
  setEndDateInput,
  singleDateError,
  startDateError,
  endDateError,
  activeTab,
  handleTabChange,
  validateAndSetSingleDate,
  validateAndSetStartDate,
  validateAndSetEndDate,
  validateDateRange,
  handleApplyFilters,
  clearAllFilters,
  availableCategories = [],
}: FilterDropdownProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto" onClick={() => setIsOpen(!isOpen)}>
          Filter
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sm:w-[600px] lg:w-[700px] p-0">
        <div className="p-6 flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Filter</h3>

          {/* Kategorie Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                Kategorie auswählen
                <ChevronsUpDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 p-3">
              <h4 className="font-medium mb-3 text-sm">Kategorien auswählen</h4>
              <div className="flex flex-col gap-3">
                {availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <div
                      key={category}
                      className={`p-3 rounded-lg border shadow-sm transition-colors ${
                        selectedFilters.category.includes(category)
                          ? "bg-primary/10 border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                        <Checkbox
                          checked={selectedFilters.category.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Keine Kategorien verfügbar</div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Datumsfilter */}
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-3 text-sm">Datum</h4>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-center rounded-md px-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground",
                  activeTab === "single" ? "bg-secondary text-secondary-foreground" : "bg-background text-foreground",
                )}
                onClick={() => handleTabChange("single")}
              >
                Einzelnes Datum
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-center rounded-md px-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground",
                  activeTab === "range" ? "bg-secondary text-secondary-foreground" : "bg-background text-foreground",
                )}
                onClick={() => handleTabChange("range")}
              >
                Datumsbereich
              </Button>
            </div>

            {activeTab === "single" ? (
              <div className="grid gap-2 mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !singleDateInput && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {singleDateInput ? (
                        format(new Date(singleDateInput.split(".").reverse().join("-")), "PPP")
                      ) : (
                        <span>Datum auswählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      defaultMonth={selectedFilters.singleDate ? selectedFilters.singleDate : new Date()}
                      selected={selectedFilters.singleDate ?? undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = format(date, "dd.MM.yyyy")
                          setSingleDateInput(formattedDate)
                          validateAndSetSingleDate(formattedDate)
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                {singleDateError && <p className="text-red-500 text-sm">{singleDateError}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !startDateInput && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDateInput ? (
                          format(new Date(startDateInput.split(".").reverse().join("-")), "PPP")
                        ) : (
                          <span>Startdatum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        defaultMonth={selectedFilters.dateRange.start ? selectedFilters.dateRange.start : new Date()}
                        selected={selectedFilters.dateRange.start ?? undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "dd.MM.yyyy")
                            setStartDateInput(formattedDate)
                            validateAndSetStartDate(formattedDate)
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  {startDateError && <p className="text-red-500 text-sm">{startDateError}</p>}
                </div>

                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !endDateInput && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDateInput ? (
                          format(new Date(endDateInput.split(".").reverse().join("-")), "PPP")
                        ) : (
                          <span>Enddatum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        defaultMonth={selectedFilters.dateRange.end ? selectedFilters.dateRange.end : new Date()}
                        selected={selectedFilters.dateRange.end ?? undefined}
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "dd.MM.yyyy")
                            setEndDateInput(formattedDate)
                            validateAndSetEndDate(formattedDate)
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  {endDateError && <p className="text-red-500 text-sm">{endDateError}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Ort</h4>
            <input
              type="text"
              placeholder="Ort eingeben"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6">
          <Button variant="ghost" onClick={clearAllFilters}>
            Filter zurücksetzen
          </Button>
          <Button onClick={handleApplyFilters}>Filter anwenden</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
