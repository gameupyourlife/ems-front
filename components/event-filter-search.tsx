"use client"

import type React from "react"

import { useState } from "react"
import { Search, SlidersHorizontal, Grid, List } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface EventNavbarProps {
  onSearch?: (query: string) => void
  onViewChange?: (view: "grid" | "list") => void
  onFilterChange?: (filters: any) => void
}

export default function EventNavbar({ onSearch, onViewChange, onFilterChange }: EventNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleViewChange = (value: string) => {
    if (value && (value === "grid" || value === "list")) {
      setCurrentView(value)
      if (onViewChange) {
        onViewChange(value)
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full mb-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex items-center gap-">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Category</p>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="art">Art & Culture</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="food">Food & Drink</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Date Range</p>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Date Range</SelectLabel>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Location</p>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Location</SelectLabel>
                        <SelectItem value="nearby">Nearby</SelectItem>
                        <SelectItem value="city">In City</SelectItem>
                        <SelectItem value="region">In Region</SelectItem>
                        <SelectItem value="online">Online Events</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button variant="default" className="w-full justify-center">
                  Apply Filters
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToggleGroup type="single" value={currentView} onValueChange={handleViewChange}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

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
    </div>
  )
}

