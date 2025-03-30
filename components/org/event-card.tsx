import { Calendar, MapPin, Users, Edit, Clock, TrashIcon, ShareIcon, ChevronRight, Tag, MoreHorizontal } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { EventInfo } from "@/lib/types";
import Link from "next/link";
import { Progress } from "../ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function OrgEventCard({ event, orgId }: { event: EventInfo, orgId: string }) {
    // Calculate if event is upcoming, ongoing, or past
    const now = new Date();
    const eventDate = new Date(event.date);
    const isToday = eventDate.toDateString() === now.toDateString();
    const isUpcoming = eventDate > now;
    const isPast = eventDate < now && !isToday;

    // Calculate days until event
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate capacity percentage
    const capacityPercent = Math.min(100, (event.attendees / 100) * 100);

    // Get status display
    const getStatusDisplay = () => {
        if (isPast) return { text: "Past event", variant: "secondary" as const };
        if (isToday) return { text: "Today", variant: "destructive" as const };
        if (daysUntil === 1) return { text: "Tomorrow", variant: "default" as const };
        return { text: `In ${daysUntil} days`, variant: "default" as const };
    };

    const status = getStatusDisplay();

    return (
        <Card className="h-full flex flex-col overflow-hidden group hover:shadow-md transition-all duration-300 border-opacity-50">
            {/* Image section with overlay gradient */}
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>

                {/* Status badge */}
                <Badge
                    className="absolute top-3 left-3 shadow-sm"
                    variant={status.variant}
                >
                    {status.text}
                </Badge>

                {/* Category badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 ">
                    <Badge className="shadow-sm flex items-center gap-1.5 backdrop-blur-xs   dark:backdrop-brightness-75 bg-white/50 dark:bg-transparent" variant="outline">
                        <Tag className="h-3 w-3" />
                        {event.category}
                    </Badge>
                </div>

                {/* Title overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1">{event.title}</h3>
                    <p className="text-sm opacity-90">{event.organization}</p>
                </div>
            </div>

            <CardContent className="flex-grow p-4">
                <div className="space-y-3.5">
                    {/* Date and time */}
                    <div className="flex w-full gap-4">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm">{eventDate.toLocaleDateString("de-DE", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm">{eventDate.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-sm truncate">{event.location}</span>
                        </div>
                    </div>

                    {/* <Separator className="my-1" /> */}

                    {/* Attendance tracking */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">{event.attendees} attendees</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{capacityPercent}% capacity</span>
                        </div>
                        <Progress
                            value={capacityPercent}
                            className={cn("h-1.5 rounded-full", {
                                "bg-muted": capacityPercent < 70,
                                "bg-amber-100": capacityPercent >= 70 && capacityPercent < 90,
                                "bg-red-100": capacityPercent >= 90
                            })}
                            indicatorClassName={cn({
                                "bg-primary": capacityPercent < 70,
                                "bg-amber-500": capacityPercent >= 70 && capacityPercent < 90,
                                "bg-red-500": capacityPercent >= 90
                            })}
                        />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-3 justify-between items-center">
                <Button variant="default" className="flex-1" asChild>
                    <Link href={`/organisation/${orgId}/events/${event.id}`} className="flex items-center justify-center">
                        <span>Manage Event</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/organisation/${orgId}/events/${event.id}`} className="flex cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Invite to Event</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/organisation/${orgId}/events/${event.id}`} className="flex cursor-pointer">
                                <ShareIcon className="mr-2 h-4 w-4" />
                                <span>Share Event</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span>Delete Event</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}