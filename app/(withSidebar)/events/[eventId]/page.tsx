"use client"
import { useParams, useRouter } from "next/navigation"
import type { EventInfo } from "@/lib/types-old"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ArrowLeft, ListTodo } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useEventsById, useRegisterAttendee, useDeleteAttendee } from "@/lib/backend/hooks/events"
import { useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { SiteHeader } from "@/components/site-header"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useAgendaEntries } from "@/lib/backend/hooks/use-agenda"

export default function EventDetailPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.jwt || ""
  const orgId = session?.user?.organization?.id || ""
  const userId = session?.user?.id || ""
  const profilePicture = session?.user?.profilePicture || ""
  const queryClient = useQueryClient()

  // Event-Daten abrufen
  const { data: eventData, isLoading, error: fetchError } = useEventsById(orgId, String(eventId), token)

  // Registrierung-Hook
  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
  } = useRegisterAttendee({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsById", orgId, eventId, token] })
    },
  })

  // Abmelde-Hook
  const {
    mutate: unregister,
    isPending: isUnregistering,
    error: unregisterError,
  } = useDeleteAttendee({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsById", orgId, eventId, token] })
    },
  })

  // Typüberprüfung für EventInfo
  function istEventInfo(obj: any): obj is EventInfo {
    return obj && typeof obj === "object" && "id" in obj && "title" in obj && "location" in obj
  }

  // Event-Objekt extrahieren
  const event: EventInfo | null = Array.isArray(eventData)
    ? istEventInfo(eventData[0])
      ? eventData[0]
      : null
    : istEventInfo(eventData)
      ? eventData
      : null

  // Agenda-Daten abrufen
  const {
    data: agendaEntries = [],
    isLoading: isLoadingAgenda,
    error: agendaError,
  } = useAgendaEntries(orgId, String(eventId), token)

  // Debug logging
  console.log("Agenda entries:", agendaEntries)
  console.log("Agenda loading:", isLoadingAgenda)
  console.log("Agenda error:", agendaError)

  // Hilfsfunktionen für Datums- und Zeitformatierung
  const formatDate = (date: Date) => format(new Date(date), "EEEE, d. MMMM yyyy", { locale: de })
  const formatTime = (date: Date) => format(new Date(date), "HH:mm", { locale: de })

  // Status-Badge für Eventstatus
  const getStatusBadge = (status: number | string) => {
    const st = typeof status === "string" ? Number.parseInt(status, 10) : status
    switch (st) {
      case 0:
        return <Badge className="bg-white text-black">Geplant</Badge>
      case 1:
        return <Badge className="bg-green-500 text-white">Läuft</Badge>
      case 2:
        return <Badge className="bg-white text-black">Abgeschlossen</Badge>
      case 3:
        return <Badge className="bg-red-500 text-white">Abgesagt</Badge>
      case 4:
        return <Badge className="bg-orange-500 text-white">Verschoben</Badge>
      case 5:
        return <Badge className="bg-gray-500 text-white">Archiviert</Badge>
      default:
        return <Badge className="bg-white text-black">Unbekannt</Badge>
    }
  }

  // Prüfen, ob Nutzer angemeldet ist
  const isRegistered = event?.isAttending || false

  // Prüfen, ob das Event bereits vorbei ist
  const isEventPassed = event ? new Date() > new Date(event.start) : false

  // Ladeanzeige
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-muted-foreground">Lade Event-Details...</div>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    )
  }

  // Fehleranzeige
  if (fetchError || !event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-red-500 mb-4 font-medium">{fetchError?.message || "Event nicht gefunden"}</div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    )
  }

  return (
    <>
      <SiteHeader
        actions={[
          {
            label: "Zurück",
            icon: <ArrowLeft className=" h-4 w-4" />,
            onClick: () => router.back(),
            variant: "outline",
          },
        ]}
      >
        <BreadcrumbItem>
          <BreadcrumbPage>{event.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>

      <main className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(event.status)}
              <Badge className="bg-primary text-primary-foreground font-bold" variant="outline">
                {event.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Event-Bild */}
            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden bg-muted">
              {event.image ? (
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Kein Bild verfügbar</div>
              )}
            </div>

            {/* Event-Beschreibung */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Beschreibung</h2>
              <div className="prose max-w-none">
                {event.description ? (
                  <p>{event.description}</p>
                ) : (
                  <p className="text-muted-foreground">Keine Beschreibung verfügbar</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Event-Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Details</h2>

              {/* Datum und Zeit - Zwei separate Karten */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Startdatum und -zeit */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Start</h3>
                        <p>{formatDate(event.start)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatTime(event.start)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enddatum und -zeit */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Ende</h3>
                        <p>{formatDate(event.end)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{formatTime(event.end)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weitere Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ort */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Ort</h3>
                        <p>{event.location || "Kein Ort angegeben"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teilnehmer */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Teilnehmer</h3>
                        <p>
                          {event.attendeeCount} / {event.capacity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Agenda Sektion */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ListTodo className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Agenda</h2>
              </div>

              {isLoadingAgenda ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-muted-foreground">Lade Agenda...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : agendaError ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-red-500">
                      <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Fehler beim Laden der Agenda: {agendaError.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : agendaEntries && agendaEntries.length > 0 ? (
                <div className="space-y-4">
                  {agendaEntries
                    .filter((item) => item && item.id && item.title && item.start && item.end)
                    .map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Zeit */}
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                <Clock className="h-4 w-4" />
                                {formatTime(item.start)} - {formatTime(item.end)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{formatDate(item.start)}</div>
                            </div>

                            {/* Inhalt */}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              {item.description && <p className="text-muted-foreground">{item.description}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Keine Agenda-Einträge verfügbar</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Teilnahme-/Abmelde-Karte */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Teilnehmen</h3>
                {(registerError || unregisterError) && (
                  <p className="text-red-500 mb-2">Fehler: {registerError?.message || unregisterError?.message}</p>
                )}
                <Button
                  className={`
                    w-full flex justify-center items-center
                    ${
                      isRegistered
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : isEventPassed
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-primary hover:bg-primary-dark text-primary-foreground"
                    }
                  `}
                  onClick={() => {
                    if (isEventPassed) return
                    if (isRegistered) {
                      unregister({ orgId, eventId: String(eventId), userId, token })
                    } else {
                      register({ orgId, eventId: String(eventId), userId, profilePicture, token })
                    }
                  }}
                  disabled={isRegistering || isUnregistering || isEventPassed}
                >
                  {isRegistering || isUnregistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isRegistered ? "Abmelden…" : "Anmelden…"}
                    </>
                  ) : isEventPassed ? (
                    "Event beendet"
                  ) : isRegistered ? (
                    "Abmelden"
                  ) : (
                    "Anmelden"
                  )}
                </Button>

                {isEventPassed && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Anmeldungen sind nicht mehr möglich, da das Event bereits begonnen hat.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Ersteller-Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Ersteller</h3>
                <p className="text-muted-foreground">{event.creatorName || "Keine Informationen zum Veranstalter"}</p>
              </CardContent>
            </Card>

            {/* Weitere Informationen */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Weitere Informationen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Erstellt am:</span>
                    <span>{format(new Date(event.createdAt), "dd.MM.yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aktualisiert am:</span>
                    <span>{format(new Date(event.updatedAt), "dd.MM.yyyy")}</span>
                  </div>
                  {event.organization && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organisation:</span>
                      <span>{event.organization}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
