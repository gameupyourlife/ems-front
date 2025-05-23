"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPin, Tag, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EventDetails } from "@/lib/types-old";

export default function EventOverviewTab({ eventDetails }: { eventDetails: EventDetails }) {

    const event = eventDetails.metadata;
    const eventId = event.id;

    const attendancePercentage = Math.round((event.attendeeCount / event.capacity) * 100);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event-Details-Karte */}
            <Card className="md:col-span-2 flex flex-col ">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Veranstaltungsdetails
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 grow">
                    <div className="space-y-2">
                        <h3 className="font-medium">Beschreibung</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Datum & Uhrzeit</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <div>
                                    <div>{format(new Date(event.start), "dd. MMMM yyyy")}</div>
                                    <div>{format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Ort</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Kategorie</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Tag className="mr-2 h-4 w-4" />
                                <span>{event.category}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Teilnahme</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                <span>{event.attendeeCount} / {event.capacity} Teilnehmer</span>
                            </div>

                            <div className="pt-1">
                                <Progress
                                    value={attendancePercentage}
                                    className={cn("h-1.5 w-full", {
                                        "bg-green-100": attendancePercentage < 70,
                                        "bg-amber-100": attendancePercentage >= 70 && attendancePercentage < 90,
                                        "bg-red-100": attendancePercentage >= 90
                                    })}
                                    indicatorClassName={cn({
                                        "bg-green-500": attendancePercentage < 70,
                                        "bg-amber-500": attendancePercentage >= 70 && attendancePercentage < 90,
                                        "bg-red-500": attendancePercentage >= 90
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/40 border-t px-6 py-4 text-xs text-muted-foreground">
                    <div className="flex justify-between w-full">
                        <div>Erstellt am: {format(new Date(event.createdAt), "dd. MMM yyyy")} von {event.createdBy}</div>
                        <div>Zuletzt aktualisiert: {format(new Date(event.updatedAt), "dd. MMM yyyy")} von {event.updatedBy}</div>
                    </div>
                </CardFooter>
            </Card>

            {/* Teilnehmer-Karte */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Teilnehmer
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">{event.attendeeCount}</div>
                            <p className="text-sm text-muted-foreground">von {event.capacity} Plätzen</p>
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center bg-background relative">
                            <div className="text-lg font-bold">{attendancePercentage}%</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-medium">Letzte Teilnehmer</h3>

                        <div className="space-y-3">
                            {eventDetails.attendees.map((attendee) => (
                                <div key={attendee.id} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={attendee.profilePicture} alt={attendee.name} />
                                        <AvatarFallback>{attendee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{attendee.name}</div>
                                        <div className="text-xs text-muted-foreground">{attendee.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/organization/events/${eventId}/attendees`}>
                                <Users className="mr-2 h-4 w-4" />
                                Alle Teilnehmer anzeigen
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}