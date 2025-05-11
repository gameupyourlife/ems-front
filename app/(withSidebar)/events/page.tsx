"use client";

import { useState, useEffect } from "react";
import EventLayout from "@/components/user/event-layout";
import { getEvents } from "@/lib/api/events";
import type { EventInfo } from "@/lib/types";

interface EventListProps {
  orgId: string;
  title?: string;
}

export default function EventList({
  orgId = "a8911a6b-942d-42e4-9b08-fcedacfa1f9c",
  title = "Alle Events",
}: EventListProps) {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents(orgId);
        setEvents(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [orgId]);

  if (isLoading) {
    return <div className="py-20 text-center">Lade Events …</div>;
  }
  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        Fehler beim Laden: {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <EventLayout
        events={events}
        title={title}
        initialView="grid"
        searchable
        onSearch={(q) => console.log("Suchanfrage:", q)}
        onFilterChange={(f) => console.log("Filter:", f)}
      />
    </main>
  );
}