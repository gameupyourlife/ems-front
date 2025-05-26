"use client"
import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EventCard from "@/components/event-card"
import type { EventInfo } from "@/lib/types-old"
import ActiveFilters from "./active-filters"
import { useEventFilters } from "./use-event-filters"
import LoadingSpinner from "@/components/loading-spinner"
import FilterDropdown from "./filter-dropdown"

interface EventLayoutProps {
  events: EventInfo[] | undefined
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
  searchable?: boolean
  isLoading?: boolean
  error?: Error | null
}

export default function EventLayout({
  events,
  title = "Veranstaltungen",
  onSearch,
  onViewChange,
  onFilterChange,
  initialView = "grid",
  initialFilters,
  searchable = true,
  isLoading = false,
  error = null,
}: EventLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"grid" | "list">(initialView)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showPastEvents, setShowPastEvents] = useState(false)

  const {
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
    handleTabChange: handleTabChangeFromHook,
    applyLocationFilter,
    clearAllFilters,
    handleApplyFilters,
    applyFilters,
  } = useEventFilters({
    events: events || [],
    searchQuery,
    initialFilters,
    onFilterChange,
  })

  // Filter neu anwenden bei Änderungen an Events oder Filtereinstellungen
  useEffect(() => {
    applyFilters()
  }, [events, searchQuery, selectedFilters, applyFilters])

  // Suche ausführen
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  // Ansicht wechseln zwischen Gitter und Liste
  const handleViewChange = (value: string) => {
    if (value && (value === "grid" || value === "list")) {
      setCurrentView(value)
      if (onViewChange) {
        onViewChange(value)
      }
    }
  }

  const isEventPast = (event: EventInfo) => {
    if (!event || !event.start) return false
    return new Date(event.end || event.start) < new Date()
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

  // Sichere Filterung der Events
  const safeFilteredEvents = filteredEvents.filter((event) => event && typeof event === "object")

  return (
    <div className="flex flex-col gap-4 w-full mb-6 px-4">
      <form onSubmit={handleSearch} className="flex w-full max-w-full items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Veranstaltungen suchen..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Suchen</Button>
      </form>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 ">
          <FilterDropdown
            isOpen={isDropdownOpen}
            setIsOpen={setIsDropdownOpen}
            selectedFilters={selectedFilters}
            toggleCategory={toggleCategory}
            locationInput={locationInput}
            setLocationInput={setLocationInput}
            singleDateInput={singleDateInput}
            setSingleDateInput={setSingleDateInput}
            startDateInput={startDateInput}
            setStartDateInput={setStartDateInput}
            endDateInput={endDateInput}
            setEndDateInput={setEndDateInput}
            singleDateError={singleDateError ?? ""}
            startDateError={startDateError ?? ""}
            endDateError={endDateError ?? ""}
            activeTab={activeTab}
            handleTabChange={handleTabChangeFromHook}
            validateAndSetSingleDate={validateAndSetSingleDate}
            validateAndSetStartDate={validateAndSetStartDate}
            validateAndSetEndDate={validateAndSetEndDate}
            validateDateRange={validateDateRange}
            handleApplyFilters={handleApplyFilters}
            clearAllFilters={clearAllFilters}
            availableCategories={
              events && events.length > 0
                ? Array.from(new Set(events.map((e) => e.category).filter(Boolean))).map((cat) =>
                    typeof cat === "string" ? cat : String(cat),
                  )
                : []
            }
          />

          <Button
            variant={showPastEvents ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="flex items-center gap-2"
          >
            {showPastEvents ? "Vergangene ausblenden" : "Vergangene anzeigen"}
            {(() => {
              const pastEventsCount = safeFilteredEvents.filter((event) => isEventPast(event)).length
              return (
                pastEventsCount > 0 && (
                  <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-xs">
                    {pastEventsCount}
                  </span>
                )
              )
            })()}
          </Button>
        </div>

        {/* Aktive Filteranzahl anzeigen, falls Filter aktiv sind */}
        {(selectedFilters.category.length > 0 ||
          selectedFilters.singleDate ||
          selectedFilters.dateRange.start ||
          selectedFilters.dateRange.end ||
          selectedFilters.location) && (
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm text-muted-foreground">
              Alle Filter löschen
              <X className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Anzeige der aktiven Filter */}
      <ActiveFilters
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        setSingleDateInput={setSingleDateInput}
        setStartDateInput={setStartDateInput}
        setEndDateInput={setEndDateInput}
        setLocationInput={setLocationInput}
      />

      {/* Anzahl der Ergebnisse */}
      <div className="text-sm text-muted-foreground mt-2">
        {(() => {
          const upcomingCount = safeFilteredEvents.filter((event) => !isEventPast(event)).length
          const pastCount = safeFilteredEvents.filter((event) => isEventPast(event)).length

          if (showPastEvents) {
            return `${upcomingCount} anstehende und ${pastCount} vergangene Events`
          } else {
            return `${upcomingCount} ${upcomingCount === 1 ? "anstehendes Event" : "anstehende Events"}`
          }
        })()}
      </div>

      {/* Event Raster-/Listenansicht */}
      <div
        className={`${
          currentView === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "flex flex-col gap-4"
        } mt-4`}
      >
        {(() => {
          const upcomingEvents = safeFilteredEvents.filter((event) => !isEventPast(event))
          const pastEvents = safeFilteredEvents.filter((event) => isEventPast(event))
          const eventsToShow = showPastEvents ? [...upcomingEvents, ...pastEvents] : upcomingEvents

          return eventsToShow.length > 0 ? (
            eventsToShow
              .map((event, idx) => {
                // Zusätzliche Sicherheitsüberprüfung vor dem Rendern
                if (!event || typeof event !== "object") {
                  console.warn("Invalid event object:", event)
                  return null
                }
                return <EventCard key={event.id || idx} event={event} isPast={isEventPast(event)} />
              })
              .filter(Boolean) // Entfernt null-Werte
          ) : isLoading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-red-500">Fehler beim Laden der Events: {error.message}</p>
            </div>
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Keine Events gefunden, die den Kriterien entsprechen.</p>
              <Button variant="link" onClick={clearAllFilters} className="mt-2">
                Alle Filter zurücksetzen
              </Button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
