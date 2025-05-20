// app/organization/events/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import EventTable from "@/components/org/event-table";
import { useSession } from "next-auth/react";
import { useEvents } from "@/lib/backend/hooks/events";

export default function OrganizationEventsPage() {
  const router = useRouter()
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const orgId = session?.user?.organization.id;

  const { data: events, isLoading, error } = useEvents(orgId || "", token || "");

  if (!events) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-muted-foreground mb-4">Keine Events gefunden.</div>
        <Button variant="outline" onClick={() => router.refresh()}>
          Neu laden
        </Button>
      </div>
    )
  }

  console.log("Events: ", events)

  const now = new Date()
  const upcoming = events
    .filter(e => e.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const past = events
    .filter(e => e.start < now)
    .sort((a, b) => b.start.getTime() - a.start.getTime())

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="animate-pulse">Lade Events …</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-red-500 mb-4">Fehler: {error.message}</div>
        <Button variant="outline" onClick={() => router.refresh()}>
          Neu laden
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage all events for org {orgId}</p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/organization/${orgId}/events/create`}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">All Events</CardTitle>
            <CardDescription>Total number of events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upcoming</CardTitle>
            <CardDescription>In the future</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Past</CardTitle>
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{past.length}</div>
          </CardContent>
        </Card>
      </div>

      <EventTable />
    </div>
  )
}
