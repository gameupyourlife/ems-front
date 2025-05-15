"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEventById } from "@/lib/api/getEvents"
import type { EventInfo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2 } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function EventDetailPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const orgId = "a8911a6b-942d-42e4-9b08-fcedacfa1f9c"

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId || typeof eventId !== "string") return

    async function loadEvent() {
      try {
        setIsLoading(true)
        const single = await getEventById(orgId, eventId as string)
        setEvent(single)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-muted-foreground mb-4">Lade Event …</div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-red-500 mb-4">{error || "Event nicht gefunden"}</div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    )
  }

  const formatDate = (date: Date) => format(date, "EEEE, d. MMMM yyyy", { locale: de })
  const formatTime = (date: Date) => format(date, "HH:mm", { locale: de })
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktiv</Badge>
      case "cancelled":
        return <Badge variant="destructive">Abgesagt</Badge>
      case "full":
        return <Badge variant="secondary">Ausgebucht</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Übersicht
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
          <div className="flex gap-2">
            {event.status && getStatusBadge(event.status)}
            <Badge variant="outline">{event.category}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <Image
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>

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

          <div>
            <h2 className="text-2xl font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Datum</h3>
                      <p>{formatDate(event.start)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Uhrzeit</h3>
                      <p>
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Ort</h3>
                      <p>{event.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Teilnehmer</h3>
                      <p>
                        {event.attendees} / {event.capacity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Teilnehmen</h3>
              <div className="space-y-4">
                <Button className="w-full">Anmelden</Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Teilen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Ersteller</h3>
              <p className="text-muted-foreground">{event.creatorName || "Keine Informationen zum Veranstalter"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Weitere Informationen</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Erstellt am:</span>
                  <span>{format(event.createdAt, "dd.MM.yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aktualisiert am:</span>
                  <span>{format(event.updatedAt, "dd.MM.yyyy")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
