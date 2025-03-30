import EventCard from "@/components/event-card";
import { NavEvents } from "@/components/event-filter-search";
import { EventInfo } from "@/lib/types";
import { randomImage } from "@/lib/utils";

export default function Page() {
    const event: EventInfo = {
        title: "Event Title",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        date: new Date(),
        organization: "Organization Name",
        location: "Teststraße 1, 12345 Teststadt",
        category: "Event Category",
        attendees: 100,
        image: randomImage(800, 400),
        id: "1",
    }




    return (
        <div>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <NavEvents />
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-8 ">
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
                <div className="w-[400px]">
                    <EventCard event={event} />
                </div>
            </div>
        </div>
    )
}