"use client";

// Komponenten-Importe
import { SiteHeader } from "@/components/site-header";
import EventLayout from "@/components/user/event-layout";
import { useEvents } from "@/lib/backend/hooks/events";
import { useSession } from "next-auth/react";

// EventList-Komponente
export default function EventList() {
  // Session und Token auslesen
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const orgId = session?.user?.organization.id;

  // Events für die Organisation laden
  const { data: events, isLoading, error } = useEvents(orgId || "", token || "");

  // Ladeanzeige
  if (isLoading) {
    return <div className="py-20 text-center">Events werden geladen …</div>;
  }

  // Fehleranzeige
  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        Fehler beim Laden: {error.message}
      </div>
    );
  }

  // Events nach Startdatum aufsteigend sortieren
  const sortedEvents = events
    ? [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    : [];

  return (
    <>
      <SiteHeader actions={[]} />
      
      <main className="container mx-auto py-8">
        <EventLayout
          events={sortedEvents}
          title={"Alle Events"}
          initialView="grid"
          searchable
          onSearch={(q) => console.log("Suchanfrage:", q)}
          onFilterChange={(f) => console.log("Filter:", f)}
        />
      </main>
    </>
  );
}
