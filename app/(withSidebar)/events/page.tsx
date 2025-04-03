"use client"

import { useState } from "react"
import EventLayout from "@/components/user/usr-event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function ExamplePage() {
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
    {
      id: "104",
      title: "Mobile App Development",
      description: "Build cross-platform mobile applications with React Native.",
      date: new Date("2025-06-10"),
      organization: "App Builders",
      location: "Frankfurt, Germany",
      category: "Technology",
      attendees: 15,
      image: randomImage(800, 400),
    },
    {
      id: "105",
      title: "Digital Marketing Workshop",
      description: "Learn effective strategies for online marketing and social media.",
      date: new Date("2025-06-15"),
      organization: "Marketing Pros",
      location: "Cologne, Germany",
      category: "Business",
      attendees: 40,
      image: randomImage(800, 400),
    },
    {
      id: "106",
      title: "Photography Basics",
      description: "Master the fundamentals of photography and composition.",
      date: new Date("2025-06-20"),
      organization: "Photo Club",
      location: "Dresden, Germany",
      category: "Art",
      attendees: 15,
      image: randomImage(800, 400),
    },
    {
      id: "107",
      title: "Blockchain Technology Overview",
      description: "Explore the principles and applications of blockchain technology.",
      date: new Date("2025-06-25"),
      organization: "Tech Innovators",
      location: "Stuttgart, Germany",
      category: "Technology",
      attendees: 10,
      image: randomImage(800, 400),
    },
    {
      id: "108",
      title: "Creative Writing Workshop",
      description: "Enhance your writing skills through guided exercises and feedback.",
      date: new Date("2025-07-01"),
      organization: "Writers Guild",
      location: "Berlin, Germany",
      category: "Art",
      attendees: 12,
      image: randomImage(800, 400),
    },
    {
      id: "109",
      title: "Public Speaking Bootcamp",
      description: "Overcome your fear of public speaking and improve your presentation skills.",
      date: new Date("2025-07-05"),
      organization: "Communication Experts",
      location: "Munich, Germany",
      category: "Business",
      attendees: 18,
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

