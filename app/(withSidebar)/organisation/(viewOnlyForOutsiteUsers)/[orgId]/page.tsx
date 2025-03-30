"use client";;
import { mockEvents, mockOrg } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlobeIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import EventCard from "@/components/event-card";
import { Organization } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export default function Page({ orgId }: { orgId: string }) {
  const org: Organization = mockOrg;

  // Filter for only upcoming events (events with dates in the future)
  const currentDate = new Date();
  const upcomingEvents = mockEvents
    .filter(event => new Date(event.date) > currentDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6); // Show only the next 6 upcoming events

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Organization Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={org.profilePicture} alt={org.name} />
            <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GlobeIcon className="h-4 w-4" />
              <a href={org.website} className="hover:underline">{org.website}</a>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon className="h-4 w-4" /> {org.address}
            </p>
          </div>
        </div>
        
        <Separator orientation="vertical" className="hidden md:block" />
        
        {/* Address */}
        <div>
          <p className="">{org.description}</p>

        </div>
      </div>

      {/* Events Tab */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Button size="sm" asChild>
            <Link href={`/organisation/${org.id}/events`}>View All Events</Link>
          </Button>
        </div>

        {upcomingEvents.length === 0 ? (
          <Card className="p-6 text-center">
            <CardContent>
              <h3 className="mb-2 font-medium">No upcoming events</h3>
              <p className="text-muted-foreground">There are no upcoming events for this organization.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.slice(0, 6).map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
