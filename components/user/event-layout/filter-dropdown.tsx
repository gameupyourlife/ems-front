"use client"

import type React from "react"

import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import DateInput from "./date-input"

// Props für die FilterDropdown-Komponente
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
}: FilterDropdownProps) {
  // Handler für die Eingabe eines einzelnen Datums
  const handleSingleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Nur Zahlen und Punkte erlauben
    if (/^[\d.]*$/.test(value)) {
      setSingleDateInput(value)

      // Automatisch Punkt hinzufügen beim Tippen
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
    }
  }

  // Handler für die Eingabe des Startdatums
  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[\d.]*$/.test(value)) {
      setStartDateInput(value)

      // Automatisch Punkt hinzufügen beim Tippen
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
    }
  }

  // Handler für die Eingabe des Enddatums
  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Nur Zahlen und Punkte erlauben
    if (/^[\d.]*$/.test(value)) {
      setEndDateInput(value)

      // Automatisch Punkt hinzufügen beim Tippen
      if (value.length === 2 && !value.includes(".") && endDateInput.length < 2) {
        setEndDateInput(value + ".")
      } else if (value.length === 5 && value.charAt(2) === "." && !value.includes(".", 3) && endDateInput.length < 5) {
        setEndDateInput(value + ".")
      }
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger-Button für das Dropdown-Menü */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" sideOffset={5}>
        {/* Überschrift des Dropdown-Menüs */}
        <DropdownMenuLabel>Veranstaltungen filtern</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Kategorie-Filter */}
          <div className="p-2">
            <p className="text-sm font-medium mb-2">Kategorie</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedFilters.category.length > 0
                    ? `${selectedFilters.category.length} ausgewählt`
                    : "Kategorien auswählen"}
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-3">
                <h4 className="font-medium mb-3 text-sm">Kategorien auswählen</h4>
                <div className="flex flex-col gap-3">
                  <div
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      selectedFilters.category.includes("tech")
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleCategory("tech")}
                  >
                    <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                      <Checkbox
                        checked={selectedFilters.category.includes("tech")}
                        onCheckedChange={() => toggleCategory("tech")}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Technologie</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      selectedFilters.category.includes("design")
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleCategory("design")}
                  >
                    <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                      <Checkbox
                        checked={selectedFilters.category.includes("design")}
                        onCheckedChange={() => toggleCategory("design")}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Design</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      selectedFilters.category.includes("business")
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleCategory("business")}
                  >
                    <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                      <Checkbox
                        checked={selectedFilters.category.includes("business")}
                        onCheckedChange={() => toggleCategory("business")}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Business</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      selectedFilters.category.includes("finanzen")
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleCategory("finanzen")}
                  >
                    <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                      <Checkbox
                        checked={selectedFilters.category.includes("finanzen")}
                        onCheckedChange={() => toggleCategory("finanzen")}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Finanzen</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`p-3 rounded-lg border shadow-sm transition-colors ${
                      selectedFilters.category.includes("sports")
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleCategory("sport")}
                  >
                    <Label className="flex items-center gap-2 font-normal cursor-pointer w-full">
                      <Checkbox
                        checked={selectedFilters.category.includes("sport")}
                        onCheckedChange={() => toggleCategory("sport")}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Sport</span>
                      </div>
                    </Label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DropdownMenuSeparator />
          {/* Datum-Filter */}
          <div className="p-2">
            <p className="text-sm font-medium mb-2">Datum</p>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="single">Datum</TabsTrigger>
                <TabsTrigger value="range">Zeitraum</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="mt-0">
                <div className="space-y-4">
                  {/* Eingabe für ein einzelnes Datum */}
                  <DateInput
                    value={singleDateInput}
                    onChange={handleSingleDateInputChange}
                    error={singleDateError}
                    onBlur={() => {
                      if (singleDateInput && singleDateInput.length === 10) {
                        validateAndSetSingleDate(singleDateInput)
                      }
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="range" className="mt-0">
                <div className="space-y-4">
                  {/* Eingabe für Start- und Enddatum */}
                  <DateInput
                    id="start-date"
                    label="Von"
                    value={startDateInput}
                    onChange={handleStartDateInputChange}
                    error={startDateError}
                    onBlur={() => {
                      if (startDateInput && startDateInput.length === 10) {
                        validateAndSetStartDate(startDateInput)
                        validateDateRange()
                      }
                    }}
                  />
                  <DateInput
                    id="end-date"
                    label="Bis"
                    value={endDateInput}
                    onChange={handleEndDateInputChange}
                    error={endDateError}
                    onBlur={() => {
                      if (endDateInput && endDateInput.length === 10) {
                        validateAndSetEndDate(endDateInput)
                        validateDateRange()
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DropdownMenuSeparator />
          {/* Ort-Filter */}
          <div className="p-2">
            <p className="text-sm font-medium mb-2">Ort</p>
            <Input
              placeholder="Ort eingeben"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleApplyFilters()
                }
              }}
            />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Aktionen: Filter anwenden oder löschen */}
        <div className="p-2 flex flex-col gap-2">
          <Button
            variant="default"
            className="w-full justify-center"
            onClick={() => {
              handleApplyFilters()
              setIsOpen(false)
            }}
          >
            Filter anwenden
          </Button>
          <Button variant="outline" className="w-full justify-center" onClick={clearAllFilters}>
            Alle Filter löschen
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

