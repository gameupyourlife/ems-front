"use client"

import { useState } from "react"
import EventLayout from "@/components/user/usr-event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function allEvents() {
  const [allEvents] = useState<EventInfo[]>([
    {
      id: "101",
      title: "Web Development Workshop",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
      date: new Date("2025-05-15"),
      organization: "Code Academy",
      location: "Berlin, Germany",
      category: "Technology",
      attendees: 30,
      image: randomImage(800, 400),
    },
    {
      id: "102",
      title: "UX Design Masterclass",
      description: "Master the principles of user experience design with industry experts.",
      date: new Date("2025-05-20"),
      organization: "Design Hub",
      location: "Hamburg, Germany",
      category: "Design",
      attendees: 25,
      image: randomImage(800, 400),
    },
    {
      id: "103",
      title: "Data Science Bootcamp",
      description: "Intensive training in data analysis, visualization, and machine learning.",
      date: new Date("2025-06-01"),
      organization: "Data Institute",
      location: "Munich, Germany",
      category: "Technology",
      attendees: 20,
      image: randomImage(800, 400),
    },
       
    
  ])

  const handleSearch = (query: string) => {
    console.log("Search query:", query)
  }

  const handleFilterChange = (filters: any) => {
    console.log("Filters applied:", filters)
  }

  return (
    <main className="container mx-auto py-8">
      <EventLayout
        events={allEvents}
        title="Angemeldete Events"
        initialView="grid"
        searchable={true}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
    </main>
  )
}

