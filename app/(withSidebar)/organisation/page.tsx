"use client";;
import { mockEvents, mockOrg, mockOrgUsers } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, FileIcon, GlobeIcon, PlusIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/stats-card";
import { formatDistanceToNow } from "date-fns";
import TeamMembers from "@/components/org/team-members";
import OrgEventCard from "@/components/org/event-card";

export default function Page() {
  const org = mockOrg;
  const members = mockOrgUsers;
  
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organisation/files`}>
              <FileIcon className="mr-2 h-4 w-4" />
              Dateien
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organisation/events`}>
              <ListIcon className="mr-2 h-4 w-4" />
              Events verwalten
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/organisation/events/create`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Event erstellen
            </Link>
          </Button>
        </div>
      </div>

      {/* Organization Description */}
      <Card>
        <CardContent className="py-4">
          <p className="text-muted-foreground">{org.description}</p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Anzahl Teammitglieder" description="+3 im letzten Monat" value={org.numOfMembers} />
        <StatsCard title="Anzahl Events" description="+2 im Letzten Monat" value={org.numOfEvents} />
        <StatsCard title="Anstehende Events" description={`Nächste Event in ${formatDistanceToNow(mockEvents[1].date)}`} value={upcomingEvents.length} />
        <StatsCard title="Anzahl Teilnehmende" description="Über alle Events" value={mockEvents.reduce((sum, event) => sum + event.attendees, 0)} />
      </div>

      {/* Tabs for Members and Events */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="members">Teammitglieder</TabsTrigger>
          <TabsTrigger value="events">Anstehende Events</TabsTrigger>
        </TabsList>

        {/* Members Tab - Using the TeamMembers component */}
        <TabsContent value="members">
          <TeamMembers members={members} orgId={org.id} />
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Anstehende Events</h2>
            <Button size="sm" asChild>
              <Link href={`/organisation/events`}>Alle Events verwalten</Link>
            </Button>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="mb-2 font-medium">Keine anstehenden Events</h3>
                <p className="text-muted-foreground">Es gibt keine Anstehende Events für diese Organisation</p>
                <Button className="mt-4" asChild>
                  <Link href={`/organisation/events/create`}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Ein Event erstellen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <OrgEventCard event={event} key={event.id} orgId={org.id} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
