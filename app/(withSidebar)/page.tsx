"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { UsersIcon, MapPinIcon, CalendarDays, TrendingUp, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useEvents } from "@/lib/backend/hooks/events"
import { useMembers } from "@/lib/backend/hooks/use-org"
import { Skeleton } from "@/components/ui/skeleton"
import EventCard from "@/components/event-card"
import Link from "next/link"

// Schönere StatsCard Komponente
function StatsCard({
  title,
  description,
  value,
  icon: Icon,
}: {
  title: string
  description: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const name = session?.user?.name || ""
  const token = session?.user?.jwt
  const orgId = session?.user?.organization.id

  const { data: events, isLoading: eventsLoading, error } = useEvents(orgId || "", token || "")
  const { data: members, isLoading: membersLoading } = useMembers(orgId || "", token || "")

  // Events verarbeiten
  const now = new Date()

  // Angemeldete Events (isAttending = true), sortiert nach Startdatum
  const attendingEvents = events
    ? [...events]
        .filter((event) => event.isAttending && new Date(event.start) > now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    : []

  // Nächstes angemeldetes Event
  const nextAttendingEvent = attendingEvents[0] || null

  // Nächste drei verfügbare Events (alle Events, sortiert nach Startdatum)
  const upcomingEvents = events
    ? [...events]
        .filter((event) => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 3)
    : []

  // Statistiken berechnen
  const totalUpcomingEvents = events ? events.filter((event) => new Date(event.start) > now).length : 0
  const totalAttendees = upcomingEvents.reduce((sum, event) => sum + (event.attendeeCount || 0), 0)
  const pastEvents = events ? events.filter((event) => new Date(event.start) <= now).length : 0
  const totalMembers = members ? members.length : 0

  // Formatierungsfunktion für Datum
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        return "Ungültiges Datum"
      }
      return dateObj.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      console.error("Fehler beim Formatieren des Datums:", error)
      return "Datum nicht verfügbar"
    }
  }

  const isLoading = eventsLoading || membersLoading

  if (error) {
    return (
      <>
        <SiteHeader actions={[]}>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="container mx-auto py-8 px-4">
            <div className="text-center text-red-500">Fehler beim Laden der Events: {error.message}</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SiteHeader actions={[]}>
        <BreadcrumbItem>
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Hero Section */}
          <div className="mb-12 text-center md:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Willkommen zurück, <span className="text-primary">{name}</span>!
              </h1>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto md:mx-0 leading-relaxed">
                Hier finden Sie alle Informationen zu Ihren Veranstaltungen.
              </p>
            </div>
          </div>

          {/* Statistik-Karten */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {isLoading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <StatsCard
                  title="Anstehende Events"
                  description="Events in der Zukunft"
                  value={totalUpcomingEvents}
                  icon={CalendarDays}
                />
                <StatsCard
                  title="Teilnehmer gesamt"
                  description="Über alle anstehenden Events"
                  value={totalAttendees}
                  icon={TrendingUp}
                />
                <StatsCard
                  title="Vergangene Events"
                  description="Bereits stattgefunden"
                  value={pastEvents}
                  icon={Clock}
                />
                <StatsCard
                  title="Teammitglieder"
                  description="In Ihrer Organisation"
                  value={totalMembers}
                  icon={Users}
                />
              </>
            )}
          </div>

          {/* Nächstes Event Highlight */}
          {nextAttendingEvent && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Ihr nächstes angemeldetes Event</h2>
              <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(nextAttendingEvent.start)}</span>
                      </div>
                      <h3 className="text-2xl font-bold">{nextAttendingEvent.title}</h3>
                    </div>
                    <Link href={`/events/${nextAttendingEvent.id}`} passHref>
                      <Button size="lg" className="lg:w-auto w-full">
                        Details anzeigen
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <UsersIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Teilnehmer</p>
                          <p className="font-semibold">
                            {nextAttendingEvent.attendeeCount || 0} / {nextAttendingEvent.capacity || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <MapPinIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Veranstaltungsort</p>
                          <p className="font-semibold">{nextAttendingEvent.location || "Ort nicht angegeben"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Nächste verfügbare Events</h2>
                <p className="text-muted-foreground mt-1">Entdecken Sie kommende Veranstaltungen</p>
              </div>
              <Button variant="outline" size="lg" asChild className="transition-all duration-200 hover:shadow-md">
                <Link href="/events">Alle Events anzeigen</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video w-full">
                      <Skeleton className="h-full w-full rounded-t-lg" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="transition-transform duration-200 hover:scale-[1.02]">
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 transition-all duration-200 hover:shadow-lg">
                <CardContent className="py-12 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Keine anstehenden Events</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Es gibt derzeit keine anstehenden Events. Schauen Sie später wieder vorbei oder erstellen Sie ein
                    neues Event.
                  </p>
                  <Button size="lg">Event erstellen</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
