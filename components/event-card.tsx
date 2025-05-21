import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { EventInfo } from "@/lib/types-old";
import Link from "next/link";

export default function EventCard({ event }: { event: EventInfo }) {
    
    return (
        <Card key={event.id} className="pt-0 flex flex-col overflow-hidden">
            <div className="relative top-0 aspect-video w-full overflow-hidden ">
                <img src={event.image || "/placeholder.svg"} alt={event.title} className=" object-cover w-full h-full" />
                <Badge className="absolute top-2 right-2">{event.category}</Badge>
            </div>
            <CardHeader className="">
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <CardDescription>{event.organization}</CardDescription>
            </CardHeader>
            <CardContent className=" pt-0 flex-grow">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        <span>{new Date(event.start).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 opacity-70" />
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 opacity-70" />
                        <span>{typeof event.attendees === "number" ? event.attendees : 0}/{event.capacity} attendees</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mt-2">{event.description}</p>
                </div>
            </CardContent>
            <CardFooter className=" pt-0">
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/events/${event.id}`} className="w-full">
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}