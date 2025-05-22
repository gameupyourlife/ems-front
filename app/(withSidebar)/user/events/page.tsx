"use client";;
import { SiteHeader } from "@/components/site-header";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import EventLayout from "@/components/user/event-layout";
import { useEvents } from "@/lib/backend/hooks/events";
import { useSession } from "next-auth/react";

export default function EventList() {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const orgId = session?.user?.organization.id;

  const { data: events, isLoading, error } = useEvents(orgId || "", token || "");

  const attendingEvents = events?.filter((event) => event.isAttending) || [];



  return (
    <>
      <SiteHeader actions={[]} >
        <BreadcrumbItem>
          <BreadcrumbPage>{"Alle Events"}</BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>

      <main className="container mx-auto py-8">
        <EventLayout
          events={attendingEvents}
          isLoading={isLoading}
          error={error}
          title={"Alle Events"}
          initialView="grid"
          searchable
          onSearch={(q) => console.log("Suchanfrage:", q)}
          onFilterChange={(f) => console.log("Filter:", f)}
        />
      </main>
    </>
  );
}