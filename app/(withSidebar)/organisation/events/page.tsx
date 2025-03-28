import { NavEvents } from "@/components/nav-events";
import EventCard from "@/components/event-card";
import { EventInfo } from "@/lib/types";
import { randomImage } from "@/lib/utils";

export default function Page() {

    return(
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <NavEvents />
        </div>
    )

}