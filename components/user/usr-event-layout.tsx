"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Grid, List, Search, SlidersHorizontal, CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import EventCard from "@/components/event-card"
import type { EventInfo } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the EventLayoutProps interface to include a searchable property
interface EventLayoutProps {
  events: EventInfo[]
  title?: string
  onSearch?: (query: string) => void
  onViewChange?: (view: "grid" | "list") => void
  onFilterChange?: (filters: any) => void
  initialView?: "grid" | "list"
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
  searchable?: boolean // Add this property
}

// Update the function parameters to include searchable with a default value of true
export default function EventLayout({
  events,
  title = "Events",
  onSearch,
  onViewChange,
  onFilterChange,
  initialView = "grid",
  initialFilters,
  searchable = true,
}: EventLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"grid" | "list">(initialView)
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[]
    dateType: "single" | "range"
    singleDate: Date | null
    dateRange: {
      start: Date | null
      end: Date | null
    }
    location: string
  }>(
    initialFilters || {
      category: [],
      dateType: "single",
      singleDate: null,
      dateRange: {
        start: null,
        end: null,
      },
      location: "",
    },
  )
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

  // Add a new state for filtered events
  const [filteredEvents, setFilteredEvents] = useState<EventInfo[]>(events)

  // Update the handleSearch function to filter events
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter events based on search query
    if (searchable) {
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organization.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredEvents(filtered)
    }

    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  // Add a useEffect to reset filtered events when the events prop changes
  useEffect(() => {
    setFilteredEvents(events)
  }, [events])

  // Add a useEffect to handle search as user types (optional)
  useEffect(() => {
    if (searchable && searchQuery) {
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organization.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchQuery, events, searchable])

  const handleViewChange = (value: string) => {
    if (value && (value === "grid" || value === "list")) {
      setCurrentView(value)
      if (onViewChange) {
        onViewChange(value)
      }
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedFilters((prev) => {
      if (prev.category.includes(category)) {
        return {
          ...prev,
          category: prev.category.filter((c) => c !== category),
        }
      } else {
        return {
          ...prev,
          category: [...prev.category, category],
        }
      }
    })
  }

  const validateDate = (dateString: string): Date | null => {
    // Check if the format matches dd.mm.yyyy
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      return null
    }

    // Parse the date parts
    const [day, month, year] = dateString.split(".").map(Number)

    // Check if the date is valid
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
      setSingleDateError("Invalid date format")
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
      setStartDateError("Invalid date format")
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
      setEndDateError("Invalid date format")
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

  const handleSingleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only digits and dots
    if (/^[\d.]*$/.test(value)) {
      setSingleDateInput(value)

      // Auto-format as user types
      if (value.length === 2 && !value.includes(".") && singleDateInput.length < 2) {
        setSingleDateInput(value + ".")
      } else if (
        value.length === 5 &&
        value.charAt(2) === "." &&
        !value.includes(".", 3) &&
        singleDateInput.length < 5
      ) {
        setSingleDateInput(value + ".")
      }

      // Validate complete dates
      if (value.length === 10) {
        validateAndSetSingleDate(value)
      } else if (value.length < 10) {
        setSingleDateError(null)
      }
    }
  }

  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only digits and dots
    if (/^[\d.]*$/.test(value)) {
      setStartDateInput(value)

      // Auto-format as user types
      if (value.length === 2 && !value.includes(".") && startDateInput.length < 2) {
        setStartDateInput(value + ".")
      } else if (
        value.length === 5 &&
        value.charAt(2) === "." &&
        !value.includes(".", 3) &&
        startDateInput.length < 5
      ) {
        setStartDateInput(value + ".")
      }

      // Validate complete dates
      if (value.length === 10) {
        validateAndSetStartDate(value)
      } else if (value.length < 10) {
        setStartDateError(null)
      }
    }
  }

  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only digits and dots
    if (/^[\d.]*$/.test(value)) {
      setEndDateInput(value)

      // Auto-format as user types
      if (value.length === 2 && !value.includes(".") && endDateInput.length < 2) {
        setEndDateInput(value + ".")
      } else if (value.length === 5 && value.charAt(2) === "." && !value.includes(".", 3) && endDateInput.length < 5) {
        setEndDateInput(value + ".")
      }

      // Validate complete dates
      if (value.length === 10) {
        validateAndSetEndDate(value)
      } else if (value.length < 10) {
        setEndDateError(null)
      }
    }
  }

  const validateDateRange = () => {
    if (selectedFilters.dateRange.start && selectedFilters.dateRange.end) {
      if (selectedFilters.dateRange.start > selectedFilters.dateRange.end) {
        setEndDateError("End date must be after start date")
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
        dateType: value as "single" | "range",
      }))
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full mb-6 px-4">
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      <form onSubmit={handleSearch} className="flex w-full max-w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" sideOffset={5}>
              <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Category</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {selectedFilters.category.length > 0
                          ? `${selectedFilters.category.length} selected`
                          : "Select categories"}
                        <SlidersHorizontal className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      <div className="p-2 space-y-2">
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedFilters.category.includes("music")}
                            onCheckedChange={() => toggleCategory("music")}
                          />
                          Music
                        </Label>
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedFilters.category.includes("art")}
                            onCheckedChange={() => toggleCategory("art")}
                          />
                          Art & Culture
                        </Label>
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedFilters.category.includes("tech")}
                            onCheckedChange={() => toggleCategory("tech")}
                          />
                          Technology
                        </Label>
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedFilters.category.includes("food")}
                            onCheckedChange={() => toggleCategory("food")}
                          />
                          Food & Drink
                        </Label>
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedFilters.category.includes("sports")}
                            onCheckedChange={() => toggleCategory("sports")}
                          />
                          Sports
                        </Label>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Date</p>
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="single">Specific Date</TabsTrigger>
                      <TabsTrigger value="range">Date Range</TabsTrigger>
                    </TabsList>
                    <TabsContent value="single" className="mt-0">
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            placeholder="DD.MM.YYYY"
                            value={singleDateInput}
                            onChange={handleSingleDateInputChange}
                            className={singleDateError ? "border-destructive" : ""}
                            maxLength={10}
                            onBlur={() => {
                              if (singleDateInput && singleDateInput.length === 10) {
                                validateAndSetSingleDate(singleDateInput)
                              }
                            }}
                          />
                          <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                        {singleDateError && <p className="text-xs text-destructive">{singleDateError}</p>}
                      </div>
                    </TabsContent>
                    <TabsContent value="range" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="start-date" className="text-xs mb-1 block">
                            From
                          </Label>
                          <div className="relative">
                            <Input
                              id="start-date"
                              placeholder="DD.MM.YYYY"
                              value={startDateInput}
                              onChange={handleStartDateInputChange}
                              className={startDateError ? "border-destructive" : ""}
                              maxLength={10}
                              onBlur={() => {
                                if (startDateInput && startDateInput.length === 10) {
                                  validateAndSetStartDate(startDateInput)
                                  validateDateRange()
                                }
                              }}
                            />
                            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                          {startDateError && <p className="text-xs text-destructive mt-1">{startDateError}</p>}
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-xs mb-1 mt-4 block">
                            To
                          </Label>
                          <div className="relative">
                            <Input
                              id="end-date"
                              placeholder="DD.MM.YYYY"
                              value={endDateInput}
                              onChange={handleEndDateInputChange}
                              className={endDateError ? "border-destructive" : ""}
                              maxLength={10}
                              onBlur={() => {
                                if (endDateInput && endDateInput.length === 10) {
                                  validateAndSetEndDate(endDateInput)
                                  validateDateRange()
                                }
                              }}
                            />
                            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                          {endDateError && <p className="text-xs text-destructive mt-1">{endDateError}</p>}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Location</p>
                  <Input
                    placeholder="Enter location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setSelectedFilters((prev) => ({
                          ...prev,
                          location: locationInput,
                        }))
                      }
                    }}
                  />
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button
                  variant="default"
                  className="w-full justify-center"
                  onClick={() => {
                    let isValid = true

                    // Validate based on active tab
                    if (activeTab === "single") {
                      if (singleDateInput && singleDateInput.length === 10) {
                        isValid = validateAndSetSingleDate(singleDateInput)
                      }
                    } else {
                      // Validate dates if present
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
                      // Apply the current location input value to the filters
                      setSelectedFilters((prev) => ({
                        ...prev,
                        location: locationInput,
                      }))

                      if (onFilterChange) {
                        onFilterChange({
                          ...selectedFilters,
                          location: locationInput,
                        })
                      }
                    }
                  }}
                >
                  Apply Filters
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToggleGroup
            type="single"
            value={currentView}
            onValueChange={handleViewChange}
            className="flex border rounded-md h-9"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="px-4 flex items-center justify-center rounded-md"
            >
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="px-4 flex items-center justify-center rounded-md"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      {(selectedFilters.category.length > 0 ||
        selectedFilters.singleDate ||
        selectedFilters.dateRange.start ||
        selectedFilters.dateRange.end ||
        selectedFilters.location) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFilters.category.map((cat) => (
            <div key={cat} className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span>Category: {cat}</span>
              <button
                className="ml-1 hover:text-destructive"
                onClick={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    category: prev.category.filter((c) => c !== cat),
                  }))
                }
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          ))}
          {selectedFilters.dateType === "single" && selectedFilters.singleDate && (
            <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span>Date: {format(selectedFilters.singleDate, "dd.MM.yyyy")}</span>
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => {
                  setSelectedFilters((prev) => ({ ...prev, singleDate: null }))
                  setSingleDateInput("")
                }}
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          )}
          {selectedFilters.dateType === "range" &&
            (selectedFilters.dateRange.start || selectedFilters.dateRange.end) && (
              <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <span>
                  Date Range:
                  {selectedFilters.dateRange.start ? format(selectedFilters.dateRange.start, " dd.MM.yyyy") : " Any"}
                  {" - "}
                  {selectedFilters.dateRange.end ? format(selectedFilters.dateRange.end, "dd.MM.yyyy") : "Any"}
                </span>
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      dateRange: { start: null, end: null },
                    }))
                    setStartDateInput("")
                    setEndDateInput("")
                  }}
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
          {selectedFilters.location && (
            <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <span>Location: {selectedFilters.location}</span>
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => {
                  setSelectedFilters((prev) => ({ ...prev, location: "" }))
                  setLocationInput("")
                }}
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          )}
        </div>
      )}
      <div
        className={`${currentView === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-4"} mt-4`}
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No events found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

