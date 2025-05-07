"use client";;
import { mockEvents } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, EditIcon } from "lucide-react";
import Link from "next/link";
import StatsCard from "@/components/stats-card";
import { formatDistanceToNow } from "date-fns";
import TeamMembers from "@/components/org/team-members";
import OrgEventCard from "@/components/org/event-card";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { useRouter } from "next/navigation";
import { useOrg } from "@/lib/context/user-org-context";
import { useMembers } from "@/lib/backend/hooks/org";
import { useEvents } from "@/lib/backend/hooks/events";

export default function Page() {
    // const org = mockOrg;

    const { currentOrg } = useOrg();
    if (!currentOrg) return null; // Ensure currentOrg is available before proceeding

    const { data: members } = useMembers(currentOrg?.id || "")
    let { data: events } = useEvents(currentOrg?.id || "")
    events = events ?? [] // Ensure events is an array to avoid errors
    const router = useRouter();

    // Filter for only upcoming events (events with dates in the future)
    const currentDate = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.start) > currentDate)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 6); // Show only the next 6 upcoming events

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    // Define quick actions
    const quickActions: QuickAction[] = [

        {
            label: "Organisation bearbeiten",
            onClick: () => router.push(`/organization/edit`),
            icon: <EditIcon className="h-4 w-4" />,
        },
        {
            label: "Event erstellen",
            onClick: () => router.push(`/organization/events/create`),
            icon: <CalendarIcon className="h-4 w-4" />,
        },
    ];

    return (
        <>

            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Anzahl Teammitglieder" description="+3 im letzten Monat" value={currentOrg.numOfMembers} />
                    <StatsCard title="Anzahl Events" description="+2 im Letzten Monat" value={currentOrg.numOfEvents} />
                    <StatsCard title="Anstehende Events" description={`Nächste Event in ${formatDistanceToNow(mockEvents[1].start)}`} value={upcomingEvents.length} />
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
                        <TeamMembers members={members ?? []} orgId={currentOrg.id} />
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent value="events" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Anstehende Events</h2>
                            <Button size="sm" asChild>
                                <Link href={`/organization/events`}>Alle Events verwalten</Link>
                            </Button>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <Card className="p-6 text-center">
                                <CardContent>
                                    <h3 className="mb-2 font-medium">Keine anstehenden Events</h3>
                                    <p className="text-muted-foreground">Es gibt keine Anstehende Events für diese organization</p>
                                    <Button className="mt-4" asChild>
                                        <Link href={`/organization/events/create`}>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Ein Event erstellen
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingEvents.map((event) => (
                                    <OrgEventCard event={event} key={event.id} orgId={currentOrg.id} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
