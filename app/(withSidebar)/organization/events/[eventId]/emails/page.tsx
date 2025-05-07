"use client"
import { redirect, useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    redirect(`/organization/events/${params.eventId}?tab=emails`);
}