"use client"
import { redirect, useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    redirect(`/organisation/events/${params.eventId}?tab=emails`);
}