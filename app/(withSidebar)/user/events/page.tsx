"use client";
import { useState } from "react";
import EventLayout from "@/components/user/event-layout";
import type { EventInfo } from "@/lib/types";
import { mockEventsUsr } from "@/lib/data";

export default function AllEvents() {
  // Zustand für alle Events initialisieren
  const [allEvents] = useState<EventInfo[]>(mockEventsUsr)

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

