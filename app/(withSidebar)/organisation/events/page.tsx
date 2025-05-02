"use client";;
import { mockEvents, mockOrg } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { EventInfo } from "@/lib/types";
import { useOrg } from "@/lib/context/user-org-context";
import TableLoadingSkeleton from "@/components/table-loading-skeleton";
import EventTable from "@/components/org/event-table";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { useRouter } from "next/navigation";
import { useEvents } from "@/lib/backend/hooks/events";



export default function OrganizationEventsPage() {

    // const { isPending, error, data: rawEvents } = useEvents("1");



    const { currentOrg } = useOrg()
    const { data: rawEvents, isPending, error } = useEvents(currentOrg?.id || "");
    const router = useRouter();

    if (!currentOrg) {
        return <div className="text-red-500">No organization selected.</div>;
    }



    const events: EventInfo[] = rawEvents?.map((event: any) => {

        let entry: EventInfo = {
            id: event.id!,
            title: event.title!,
            description: event.description!,
            location: event.location!,
            createdAt: new Date(event.createdAt || 0),
            updatedAt: new Date(event.updatedAt || 0),
            createdBy: "",
            updatedBy: "",
            status: event.status!,
            start: new Date(event.start || 0),
            end: new Date(event.end || 0),
            organization: "",
            category: event.category!,
            attendees: event.attendeeCount!,
            capacity: 500,
            image: "",

        }

        return entry;
    }) || [];




    const org = mockOrg; // This would come from an API call in a real app

    // Filter for past, current, and future events
    const currentDate = new Date();

    const upcomingEvents = mockEvents
        .filter(event => new Date(event.start) > currentDate)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const pastEvents = mockEvents
        .filter(event => new Date(event.start) < currentDate)
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    const quickActions: QuickAction[] = [
        {
            label: "Event erstellen",
            onClick: () => router.push(`/organisation/events/create`),
            icon: <PlusIcon className="h-4 w-4" />,
        },
    ];

    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">



                {/* Events Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">All Events</CardTitle>
                            <CardDescription>Total number of events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{events.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Upcoming Events</CardTitle>
                            <CardDescription>Events in the future</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{upcomingEvents.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">Past Events</CardTitle>
                            <CardDescription>Completed events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{pastEvents.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events Table with Tabs */}

                {isPending && <TableLoadingSkeleton />}
                {error && <div className="text-red-500">Error: {error.message}</div>}
                {!isPending && !error && events && events.length === 0 && <div className="text-muted-foreground">No events found.</div>}
                {!isPending && !error && events && events.length > 0 && <EventTable />}



                {/* <Tabs defaultValue="all" className="flex-1 overflow-hidden">
                <TabsList className="mb-4 grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                    <TabsTrigger value="past">Past Events</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="flex-1 overflow-hidden">
                </TabsContent>

                <TabsContent value="upcoming" className="flex-1 overflow-hidden">
                    <EventTable events={upcomingEvents} orgId={orgId} />
                </TabsContent>

                <TabsContent value="past" className="flex-1 overflow-hidden">
                    <EventTable events={pastEvents} orgId={orgId} />
                </TabsContent>
            </Tabs> */}


            </div>
        </>

    );
}