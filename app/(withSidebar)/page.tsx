"use client"

import { useSession } from "next-auth/react"
import { CalendarIcon, PlusIcon, RefreshCwIcon as RefreshIcon, ClockIcon, UsersIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"

export default function DashboardPage() {
  const { data: session } = useSession()
  const name = session?.user?.name || ""

  // Beispiel-Events (in einer echten Anwendung würden diese von einer API kommen)
  const upcomingEvents = [
    { id: 1, title: "Sommerfest 2025", date: "15. Juni 2025", attendees: 120, location: "Berlin" },
    { id: 2, title: "Produktvorstellung", date: "23. Juli 2025", attendees: 45, location: "München" },
    { id: 3, title: "Team Workshop", date: "5. August 2025", attendees: 18, location: "Hamburg" },
  ]

  return (
    <>
      <SiteHeader actions={[]} >
        <BreadcrumbItem>
          <BreadcrumbPage>
            Dashboard
          </BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto py-8 px-4">
          {/* Hero Section */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl mb-2">
              Willkommen zurück, <span className="text-primary">{name}</span>!
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto md:mx-0">
              Hier finden Sie alle Informationen zu Ihren Veranstaltungen und können neue Events erstellen.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button className="justify-start">
                    <PlusIcon className="mr-2 h-4 w-4" /> Event erstellen
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <RefreshIcon className="mr-2 h-4 w-4" /> Events aktualisieren
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" /> Kalender anzeigen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Statistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">{upcomingEvents.length}</span>
                    <span className="text-muted-foreground text-sm">Anstehende Events</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">183</span>
                    <span className="text-muted-foreground text-sm">Teilnehmer gesamt</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">12</span>
                    <span className="text-muted-foreground text-sm">Vergangene Events</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">4.8</span>
                    <span className="text-muted-foreground text-sm">Durchschn. Bewertung</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Nächstes Event</CardTitle>
                <CardDescription>{upcomingEvents[0].date}</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{upcomingEvents[0].title}</h3>
                <div className="flex items-center text-muted-foreground mb-1">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>{upcomingEvents[0].attendees} Teilnehmer</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{upcomingEvents[0].location}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Details anzeigen
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Anstehende Events</h2>
              <Button variant="outline" size="sm">
                Alle anzeigen
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" /> {event.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      <span>{event.attendees} Teilnehmer</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                    <Button size="sm">Bearbeiten</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
