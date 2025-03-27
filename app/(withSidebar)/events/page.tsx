import EventCard from "@/components/event-card";
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
    )
}