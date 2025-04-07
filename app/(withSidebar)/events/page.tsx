"use client";
import { useState } from "react";
import EventLayout from "@/components/user/event-layout";
import type { EventInfo } from "@/lib/types";
import { mockEvents } from "@/lib/data";

export default function allEvents() {
  // Daten für die Events vorgeben
  const [allEvents] = useState<EventInfo[]>(mockEvents)

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

