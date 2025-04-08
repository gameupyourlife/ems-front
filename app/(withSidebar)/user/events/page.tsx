"use client"

import { useState } from "react"
import EventLayout from "@/components/user/event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function AllEvents() {
  // Zustand für alle Events initialisieren
  const [allEvents] = useState<EventInfo[]>([
    {
      id: "101",
      title: "Webentwicklungs-Workshop",
      description: "Lerne die Grundlagen der Webentwicklung mit HTML, CSS und JavaScript.",
      date: new Date("2025-05-15"), // Use Date object directly
      organization: "Code Akademie",
      location: "Berlin, Deutschland",
      category: "Technologie", // Using the category value that matches our filter
      image: randomImage(800, 400),
      attendees: 200
    },
    {
      id: "102",
      title: "UX-Design Masterclass",
      description: "Beherrsche die Prinzipien des User Experience Designs mit Branchenexperten.",
      date: new Date("2025-05-20"),
      organization: "Design Hub",
      location: "Hamburg, Deutschland",
      category: "Design", // Using the category value that matches our filter
      image: randomImage(800, 400),
      attendees: 50
    },
    {
      id: "103",
      title: "Data Science Bootcamp",
      description: "Intensives Training in Datenanalyse, Visualisierung und maschinellem Lernen.",
      date: new Date("2025-06-01"),
      organization: "Dateninstitut",
      location: "München, Deutschland",
      category: "Technologie", // Using the category value that matches our filter
      image: randomImage(800, 400),
      attendees: 100
    },
  ])

  // Funktion zum Verarbeiten von Suchanfragen
  const handleSearch = (query: string) => {
    console.log("Suchanfrage:", query)
  }

  // Funktion zum Verarbeiten von Filteränderungen
  const handleFilterChange = (filters: any) => {
    console.log("Angewendete Filter:", filters)
  }

  return (
    <main className="container mx-auto py-8">
      {/* EventLayout-Komponente mit den Event-Daten */}
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

