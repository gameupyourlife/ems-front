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
            {/* Event Details Card */}
            <Card className="md:col-span-2 flex flex-col ">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Event Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 grow">
                    <div className="space-y-2">
                        <h3 className="font-medium">Description</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Date & Time</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <div>
                                    <div>{format(new Date(event.start), "MMMM dd, yyyy")}</div>
                                    <div>{format(new Date(event.start), "h:mm a")} - {format(new Date(event.end), "h:mm a")}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Location</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Category</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Tag className="mr-2 h-4 w-4" />
                                <span>{event.category}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Attendance</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                <span>{event.attendeeCount} / {event.capacity} attendees</span>
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
                        <div>Created: {format(new Date(event.createdAt), "MMM dd, yyyy")} by {event.createdBy}</div>
                        <div>Last updated: {format(new Date(event.updatedAt), "MMM dd, yyyy")} by {event.updatedBy}</div>
                    </div>
                </CardFooter>
            </Card>

            {/* Attendees Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Attendees
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">{event.attendeeCount}</div>
                            <p className="text-sm text-muted-foreground">of {event.capacity} capacity</p>
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center bg-background relative">
                            <div className="text-lg font-bold">{attendancePercentage}%</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-medium">Recent Attendees</h3>

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
                                View All Attendees
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}