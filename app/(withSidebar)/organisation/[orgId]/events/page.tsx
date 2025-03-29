"use client";;
import { mockEvents, mockOrg } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import EventTable from "@/components/org/event-table";

export default function OrganizationEventsPage({ params }: { params: { orgId: string } }) {
    // In a real application, you would fetch the organization and its events here
    const orgId = params.orgId;
    const org = mockOrg; // This would come from an API call in a real app

    // Filter for past, current, and future events
    const currentDate = new Date();

    const allEvents = mockEvents;
    const upcomingEvents = mockEvents
        .filter(event => new Date(event.date) > currentDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pastEvents = mockEvents
        .filter(event => new Date(event.date) < currentDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Events Management</h1>
                    <p className="text-muted-foreground">Manage all events for {org.name}</p>
                </div>
                <Button size="sm" asChild>
                    <Link href={`/organisation/${orgId}/events/create`}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            {/* Events Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">All Events</CardTitle>
                        <CardDescription>Total number of events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{allEvents.length}</div>
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

            <EventTable events={allEvents} orgId={orgId} />

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
    );
}