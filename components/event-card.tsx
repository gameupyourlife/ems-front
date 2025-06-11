import { Calendar, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EventInfo } from "@/lib/types-old"
import Link from "next/link"

export default function EventCard({ event, isPast = false }: { event: EventInfo; isPast?: boolean }) {
  // Frühe Rückgabe wenn event nicht existiert
  if (!event || typeof event !== "object") {
    return null
  }

  return (
    <div className={`${isPast ? "opacity-60" : ""} h-full flex flex-col`}>
      <Card className="pt-0 flex flex-col flex-1 overflow-hidden">
        <div className="relative top-0 aspect-video w-full overflow-hidden ">
          <img
            src={event.image?? "/placeholder.svg?height=200&width=400"}
            alt={event.title?? "Event"}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=400"
            }}
          />
          {event.category && <Badge className="absolute top-2 right-2">{event.category}</Badge>}
          {isPast && (
           <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
            <div className="absolute top-4 right-[-32px] w-32 h-8 bg-red-500 transform rotate-45 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Vergangen</span>
            </div>
          </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{event.title || "Unbekanntes Event"}</CardTitle>
          <CardDescription>{event.organization || "Unbekannte Organisation"}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-grow">
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              <span>{event.start ? new Date(event.start).toLocaleDateString() : "Datum unbekannt"}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 opacity-70" />
              <span>{event.location || "Ort unbekannt"}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 opacity-70" />
              <span>
                {event.attendeeCount || 0} / {event.capacity || 0} Teilnehmer
              </span>
            </div>
            <p className="text-muted-foreground line-clamp-2 mt-2">
              {event.description || "Keine Beschreibung verfügbar"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-0 mt-auto">
          <Button variant="outline" className="w-full" asChild disabled={isPast}>
            <Link href={`/events/${event.id || ""}`} className="w-full">
              {"Details anzeigen"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
