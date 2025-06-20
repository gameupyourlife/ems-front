"use client";;
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
import { useMembers } from "@/lib/backend/hooks/use-org";
import { useEvents } from "@/lib/backend/hooks/events";
import { useSession } from "next-auth/react";

export default function Page() {
    const { data: session } = useSession();
    const router = useRouter();
    const orgId = session?.user?.organization.id || "";
    const token = session?.user?.jwt || "";

    // Diese Hooks werden IMMER aufgerufen – Hook-Regel eingehalten ✅
    const { data: members } = useMembers(orgId, token);
    let { data: events } = useEvents(orgId, token);
    events = events ?? [];

    const currentOrg = session?.org;
    if (!currentOrg) {
        return <div className="p-8 text-center text-muted-foreground">Organisation nicht gefunden.</div>;
    }

    // Filtere nur zukünftige Events (Events mit Startdatum in der Zukunft)
    const currentDate = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.start) > currentDate)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 6); // Zeige nur die nächsten 6 Events an


    // Definiere Schnellaktionen
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
                {/* Statistik-Karten */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Anzahl Teammitglieder" description="+3 im letzten Monat" value={currentOrg.numOfMembers} />
                    <StatsCard title="Anzahl Events" description="+2 im letzten Monat" value={currentOrg.numOfEvents} />
                    <StatsCard title="Anstehende Events" description={`Nächstes Event in ${formatDistanceToNow(new Date(upcomingEvents[0]?.start || new Date()))}`} value={upcomingEvents.length} />
                    <StatsCard title="Anzahl Teilnehmende" description="Über alle Events" value={events.reduce((sum, event) => sum + (event.attendeeCount || 0), 0)} />
                </div>

                {/* Tabs für Mitglieder und Events */}
                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="mb-4 grid w-full grid-cols-2">
                        <TabsTrigger value="members">Teammitglieder</TabsTrigger>
                        <TabsTrigger value="events">Anstehende Events</TabsTrigger>
                    </TabsList>

                    {/* Mitglieder-Tab - verwendet die TeamMembers-Komponente */}
                    <TabsContent value="members">
                        <TeamMembers members={members ?? []} orgId={orgId} />
                    </TabsContent>

                    {/* Events-Tab */}
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
                                    <p className="text-muted-foreground">Es gibt keine anstehenden Events für diese Organisation</p>
                                    <Button className="mt-4" asChild>
                                        <Link href={`/organization/events/create`}>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Event erstellen
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
