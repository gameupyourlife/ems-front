"use client"

import type React from "react"

import { X } from "lucide-react"
import { format } from "date-fns"

interface ActiveFiltersProps {
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
  setSelectedFilters: React.Dispatch<
    React.SetStateAction<{
      category: string[]
      dateType: "single" | "range"
      singleDate: Date | null
      dateRange: {
        start: Date | null
        end: Date | null
      }
      location: string
    }>
  >
  setSingleDateInput: React.Dispatch<React.SetStateAction<string>>
  setStartDateInput: React.Dispatch<React.SetStateAction<string>>
  setEndDateInput: React.Dispatch<React.SetStateAction<string>>
  setLocationInput: React.Dispatch<React.SetStateAction<string>>
}

export default function ActiveFilters({
  selectedFilters,
  setSelectedFilters,
  setSingleDateInput,
  setStartDateInput,
  setEndDateInput,
  setLocationInput,
}: ActiveFiltersProps) {
  // Wenn keine Filter aktiv sind, wird nichts angezeigt
  if (
    selectedFilters.category.length === 0 &&
    !selectedFilters.singleDate &&
    !selectedFilters.dateRange.start &&
    !selectedFilters.dateRange.end &&
    !selectedFilters.location
  ) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {/* Aktive Kategorien anzeigen */}
      {selectedFilters.category.map((cat) => (
        <div key={cat} className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <span>Kategorie: {cat}</span>
          <button
            className="ml-1 hover:text-destructive"
            onClick={() =>
              // Entfernt die ausgewählte Kategorie aus den Filtern
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

      {/* Aktives einzelnes Datum anzeigen */}
      {selectedFilters.dateType === "single" && selectedFilters.singleDate && (
        <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <span>Datum: {format(selectedFilters.singleDate, "dd.MM.yyyy")}</span>
          <button
            className="ml-1 hover:text-destructive"
            onClick={() => {
              // Entfernt das einzelne Datum aus den Filtern
              setSelectedFilters((prev) => ({ ...prev, singleDate: null }))
              setSingleDateInput("")
            }}
          >
            <X className="h-2 w-2" />
          </button>
        </div>
      )}

      {/* Aktiven Datumsbereich anzeigen */}
      {selectedFilters.dateType === "range" && (selectedFilters.dateRange.start || selectedFilters.dateRange.end) && (
        <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <span>
            Zeitraum:
            {selectedFilters.dateRange.start ? format(selectedFilters.dateRange.start, " dd.MM.yyyy") : " Beliebig"}
            {" - "}
            {selectedFilters.dateRange.end ? format(selectedFilters.dateRange.end, "dd.MM.yyyy") : "Beliebig"}
          </span>
          <button
            className="ml-1 hover:text-destructive"
            onClick={() => {
              // Entfernt den Datumsbereich aus den Filtern
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

      {/* Aktiven Ort anzeigen */}
      {selectedFilters.location && (
        <div className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
          <span>Ort: {selectedFilters.location}</span>
          <button
            className="ml-1 hover:text-destructive"
            onClick={() => {
              // Entfernt den Ort aus den Filtern
              setSelectedFilters((prev) => ({ ...prev, location: "" }))
              setLocationInput("")
            }}
          >
            <X className="h-2 w-2" />
          </button>
        </div>
      )}
    </div>
  )
}

