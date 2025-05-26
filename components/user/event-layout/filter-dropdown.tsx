"use client"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronsUpDown } from "lucide-react"

interface FilterDropdownProps {
  className?: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedFilters: any
  toggleCategory: (category: string) => void
  locationInput: string
  setLocationInput: (location: string) => void
  singleDateInput: string
  setSingleDateInput: (date: string) => void
  startDateInput: string
  setStartDateInput: (date: string) => void
  endDateInput: string
  setEndDateInput: (date: string) => void
  singleDateError: string
  startDateError: string
  endDateError: string
  activeTab: string
  handleTabChange: (tab: string) => void
  validateAndSetSingleDate: (date: string) => void
  validateAndSetStartDate: (date: string) => void
  validateAndSetEndDate: (date: string) => void
  validateDateRange: () => void
  handleApplyFilters: () => void
  clearAllFilters: () => void
  availableCategories: string[]
}

export default function FilterDropdown({
  className,
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
  availableCategories,
}: FilterDropdownProps) {
  const activeFilterCount =
    selectedFilters.category.length +
    (selectedFilters.location ? 1 : 0) +
    (selectedFilters.singleDate ? 1 : 0) +
    (selectedFilters.dateRange.start || selectedFilters.dateRange.end ? 1 : 0)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("flex items-center gap-2", className)}>
          <Filter className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter</h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-1 text-xs">
                Alle löschen
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Kategorien */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategorien</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedFilters.category.length > 0
                    ? `${selectedFilters.category.length} Kategorie${selectedFilters.category.length !== 1 ? "n" : ""} ausgewählt`
                    : "Kategorien auswählen"}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Kategorien auswählen</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedFilters.category.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={category} className="text-sm font-normal cursor-pointer flex-1">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedFilters.category.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          selectedFilters.category.forEach((cat: string) => toggleCategory(cat))
                        }}
                        className="w-full text-xs"
                      >
                        Alle abwählen
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedFilters.category.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedFilters.category.map((category: string) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Ort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ort</label>
            <Input
              placeholder="Ort eingeben..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
          </div>

          {/* Datum */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum</label>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Einzeldatum</TabsTrigger>
                <TabsTrigger value="range">Zeitraum</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="space-y-2">
                <Input
                  type="date"
                  value={singleDateInput}
                  onChange={(e) => {
                    setSingleDateInput(e.target.value)
                    validateAndSetSingleDate(e.target.value)
                  }}
                />
                {singleDateError && <p className="text-sm text-red-500">{singleDateError}</p>}
              </TabsContent>
              <TabsContent value="range" className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="date"
                      placeholder="Von"
                      value={startDateInput}
                      onChange={(e) => {
                        setStartDateInput(e.target.value)
                        validateAndSetStartDate(e.target.value)
                      }}
                    />
                    {startDateError && <p className="text-xs text-red-500 mt-1">{startDateError}</p>}
                  </div>
                  <div>
                    <Input
                      type="date"
                      placeholder="Bis"
                      value={endDateInput}
                      onChange={(e) => {
                        setEndDateInput(e.target.value)
                        validateAndSetEndDate(e.target.value)
                      }}
                    />
                    {endDateError && <p className="text-xs text-red-500 mt-1">{endDateError}</p>}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Aktionen */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => {
                handleApplyFilters();
                setIsOpen(false);
              }}
            >
              Filter anwenden
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
