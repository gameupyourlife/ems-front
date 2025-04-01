"use client"

import type React from "react"

import { useState } from "react"
import { Grid, List, Search, SlidersHorizontal } from "lucide-react"
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
import EventCard from "@/components/event-card";
import { EventInfo } from "@/lib/types";
import { randomImage } from "@/lib/utils"

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
  const events: EventInfo[] = [
    {
      id: "1",
      title: "Music Festival",
      description: "A great music festival with live performances.",
      date: new Date(),
      organization: "Music Org",
      location: "Berlin, Germany",
      category: "Music",
      attendees: 200,
      image: randomImage(800, 400),
    },
    {
      id: "2",
      title: "Tech Conference",
      description: "Explore the latest in technology and innovation.",
      date: new Date(),
      organization: "Tech World",
      location: "Munich, Germany",
      category: "Technology",
      attendees: 500,
      image: randomImage(800, 400),
    },
    {
      id: "3",
      title: "Art Exhibition",
      description: "Discover amazing artworks from talented artists.",
      date: new Date(),
      organization: "Art Gallery",
      location: "Hamburg, Germany",
      category: "Art",
      attendees: 150,
      image: randomImage(800, 400),
    },
    {
      id: "4",
      title: "Food Festival",
      description: "Taste delicious food from around the world.",
      date: new Date(),
      organization: "Food Lovers",
      location: "Cologne, Germany",
      category: "Food & Drink",
      attendees: 300,
      image: randomImage(800, 400),
    },
    {
      id: "5",
      title: "Startup Meetup",
      description: "Network with entrepreneurs and investors.",
      date: new Date(),
      organization: "Startup Hub",
      location: "Frankfurt, Germany",
      category: "Business",
      attendees: 100,
      image: randomImage(800, 400),
    },
    {
      id: "6",
      title: "Sports Championship",
      description: "Watch the best teams compete for the title.",
      date: new Date(),
      organization: "Sports League",
      location: "Stuttgart, Germany",
      category: "Sports",
      attendees: 1000,
      image: randomImage(800, 400),
    },
    {
      id: "7",
      title: "Book Fair",
      description: "Explore a wide range of books and meet authors.",
      date: new Date(),
      organization: "Book World",
      location: "Leipzig, Germany",
      category: "Literature",
      attendees: 400,
      image: randomImage(800, 400),
    },
    {
      id: "8",
      title: "Film Festival",
      description: "Enjoy screenings of award-winning films.",
      date: new Date(),
      organization: "Cinema Club",
      location: "Dresden, Germany",
      category: "Film",
      attendees: 250,
      image: randomImage(800, 400),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full mb-6 px-4">
      

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

