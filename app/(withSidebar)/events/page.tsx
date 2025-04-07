"use client"

import { useState } from "react"
import EventLayout from "@/components/user/event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function allEvents() {
  // Daten für die Events vorgeben
  const [allEvents] = useState<EventInfo[]>([
    {
      id: "101",
      title: "Webentwicklungs-Workshop",
      description: "Lerne die Grundlagen der Webentwicklung mit HTML, CSS und JavaScript.",
      date: new Date("2025-05-15"),
      organization: "Code Akademie",
      location: "Berlin, Deutschland",
      category: "Technologie",
      attendees: 30,
      image: randomImage(800, 400), // Zufälliges Bild generieren
    },
    {
      id: "102",
      title: "UX-Design Masterclass",
      description: "Beherrsche die Prinzipien des User Experience Designs mit Branchenexperten.",
      date: new Date("2025-05-20"),
      organization: "Design Hub",
      location: "Hamburg, Deutschland",
      category: "Design",
      attendees: 25,
      image: randomImage(800, 400),
    },
    {
      id: "103",
      title: "Data Science Bootcamp",
      description: "Intensives Training in Datenanalyse, Visualisierung und maschinellem Lernen.",
      date: new Date("2025-06-01"),
      organization: "Dateninstitut",
      location: "München, Deutschland",
      category: "Technologie",
      attendees: 20,
      image: randomImage(800, 400),
    },
    {
      id: "104",
      title: "Mobile App Entwicklung",
      description: "Erstelle plattformübergreifende mobile Apps mit React Native.",
      date: new Date("2025-06-10"),
      organization: "App Entwickler",
      location: "Frankfurt, Deutschland",
      category: "Technologie",
      attendees: 15,
      image: randomImage(800, 400),
    },
    {
      id: "105",
      title: "Digitales Marketing Workshop",
      description: "Lerne effektive Strategien für Online-Marketing und soziale Medien.",
      date: new Date("2025-06-15"),
      organization: "Marketing Profis",
      location: "Köln, Deutschland",
      category: "Business",
      attendees: 40,
      image: randomImage(800, 400),
    },
    {
      id: "106",
      title: "Fotografie Grundlagen",
      description: "Beherrsche die Grundlagen der Fotografie und Bildkomposition.",
      date: new Date("2025-06-20"),
      organization: "Foto Club",
      location: "Dresden, Deutschland",
      category: "Kunst",
      attendees: 15,
      image: randomImage(800, 400),
    },
    {
      id: "107",
      title: "KI und Maschinelles Lernen",
      description: "Entdecke die neuesten Trends in KI und maschinellem Lernen.",
      date: new Date("2025-06-25"),
      organization: "Tech Innovatoren",
      location: "Stuttgart, Deutschland",
      category: "Technologie",
      attendees: 50,
      image: randomImage(800, 400),
    },
    {
      id: "108",
      title: "Blockchain Grundlagen",
      description: "Verstehe die Grundlagen der Blockchain-Technologie und ihre Anwendungen.",
      date: new Date("2025-07-01"),
      organization: "Krypto Akademie",
      location: "Berlin, Deutschland",
      category: "Finanzen",
      attendees: 35,
      image: randomImage(800, 400),
    },
    {
      id: "109",
      title: "Kreatives Schreiben Workshop",
      description: "Verbessere deine Schreibfähigkeiten mit kreativen Übungen und Feedback.",
      date: new Date("2025-07-05"),
      organization: "Schriftsteller Gilde",
      location: "Hamburg, Deutschland",
      category: "Literatur",
      attendees: 20,
      image: randomImage(800, 400),
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
        title="Alle Events"
        initialView="grid"
        searchable={true} 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange}
      />
    </main>
  )
}

