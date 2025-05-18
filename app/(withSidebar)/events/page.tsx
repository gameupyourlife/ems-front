"use client";;
import EventLayout from "@/components/user/event-layout";
import { useEvents } from "@/lib/backend/hooks/events";
import { useSession } from "next-auth/react";

interface EventListProps {
  title?: string;
}

export default function EventList({
  title = "Alle Events",
}: EventListProps) {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const orgId = session?.user?.organization.id;

  const { data: events, isLoading, error } = useEvents(orgId || "", token || "");

  if (isLoading) {
    return <div className="py-20 text-center">Lade Events …</div>;
  }
  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        Fehler beim Laden: {error.message}
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