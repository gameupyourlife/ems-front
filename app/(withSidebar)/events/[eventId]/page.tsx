"use client"
import { useParams, useRouter } from "next/navigation"
import type { EventInfo } from "@/lib/types-old"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { useEventsById } from "@/lib/backend/hooks/events"
import { useRegisterAttendee } from "@/lib/backend/hooks/events"
import { useSession } from "next-auth/react"
import { SiteHeader } from "@/components/site-header"
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"

export default function EventDetailPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const token = session?.user?.jwt || ""
  const orgId = session?.user?.organization?.id || ""
  const userId = session?.user?.id || ""
  const profilePicture = session?.user?.profilePicture || ""

  const {
    data: eventData,
    isLoading,
    error,
  } = useEventsById(orgId, String(eventId), token)

  // Hook for registration
  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
  } = useRegisterAttendee({
    onSuccess: () => {
      // Optionally show a toast or similar here
    },
  })

  // Extract single event if hook returns array
  const event: EventInfo | null = Array.isArray(eventData)
    ? eventData[0] ?? null
    : (eventData as unknown as EventInfo) || null

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

  if (error || !event) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="text-red-500 mb-4 font-medium">
          {error?.message || "Event nicht gefunden"}
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    )
  }

  const formatDate = (date: Date) =>
    format(new Date(date), "EEEE, d. MMMM yyyy", { locale: de })
  const formatTime = (date: Date) => format(new Date(date), "HH:mm", { locale: de })

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

  return (
    <>
      <SiteHeader actions={[{
        label: "Zurück",
        icon: <ArrowLeft className=" h-4 w-4" />,
        onClick: () => router.back(),
        variant: "outline"
      }]} >
        <BreadcrumbItem>
          <BreadcrumbPage>
            {event.title}
          </BreadcrumbPage>
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Kein Bild verfügbar
                </div>
              )}
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
                        <p>{event.location || "Kein Ort angegeben"}</p>
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
                          {event.attendeeCount} / {event.capacity}
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
                {registerError && <p className="text-red-500">Fehler: {registerError.message}</p>}
                <Button
                  className="w-full"
                  onClick={() =>
                    register({ orgId, eventId: String(eventId), userId, profilePicture, token })
                  }
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      Anmelden…
                    </>
                  ) : (
                    "Anmelden"
                  )}
                </Button>

              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Ersteller</h3>
                <p className="text-muted-foreground">
                  {event.creatorName || "Keine Informationen zum Veranstalter"}
                </p>
              </CardContent>
            </Card>

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
