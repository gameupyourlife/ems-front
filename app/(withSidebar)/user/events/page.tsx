"use client"

import { useState } from "react"
import EventLayout from "@/components/user/usr-event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function ExamplePage() {
  const [allEvents] = useState<EventInfo[]>([
    {
        id: "101",
        title: "Introduction to Machine Learning",
        description: "Learn the basics of machine learning and its applications in various fields.",
        date: new Date("2025-07-10"),
        organization: "AI Academy",
        location: "Frankfurt, Germany",
        category: "Technology",
        attendees: 22,
        image: randomImage(800, 400),
    },
    {
        id: "102",
        title: "Advanced JavaScript Workshop",
        description: "Deep dive into advanced JavaScript concepts and frameworks.",
        date: new Date("2025-07-15"),
        organization: "Web Dev Hub",
        location: "Berlin, Germany",
        category: "Technology",
        attendees: 18,
        image: randomImage(800, 400),
    },
    {
        id: "103",
        title: "Creative Writing Retreat",
        description: "Enhance your writing skills in a serene environment with expert guidance.",                   
        date: new Date("2025-07-20"),
        organization: "Writers Guild",
        location: "Hamburg, Germany",
        category: "Arts",   
        attendees: 12,
        image: randomImage(800, 400),
    },
    {
        id: "104",
        title: "Blockchain Technology Seminar",
        description: "Explore the fundamentals and future of blockchain technology.",
        date: new Date("2025-07-25"),
        organization: "Tech Innovators",
        location: "Munich, Germany",
        category: "Technology",
        attendees: 30,
        image: randomImage(800, 400),
    },
  ])

  const [searchResults, setSearchResults] = useState<EventInfo[]>(allEvents)

  const handleSearch = (query: string) => {
    console.log("Search query:", query)
    // You can implement additional search logic here if needed
    // The internal filtering is already handled by the EventLayout component
  }

  return (
    <main className="container mx-auto py-8">
      <EventLayout
        events={allEvents}
        title="Workshop Events"
        initialView="grid"
        searchable={true}
        onSearch={handleSearch}
      />
    </main>
  )
}

