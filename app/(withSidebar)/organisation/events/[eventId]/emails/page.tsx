import { redirect } from "next/navigation";

export default function Page({ params }: { params: { eventId: string } }) {
    redirect(`/organisation/events/${params.eventId}?tab=emails`);
}