import type { EventInfo } from "@/lib/types";
import { z } from "zod";

const BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/orgs`
    : "http://localhost:5256/api/orgs";

export interface EventInfoRaw {
  creatorName: string;
  id?: string
  title: string
  category: string
  start: string
  end?: string
  location: string
  attendeeCount: number
  capacity: number
  status: number
  description: string
  image: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  organization?: string
}


export async function getEventById(orgId: string, eventId: string): Promise<EventInfo> {
  const res = await fetch(`${BASE}/${orgId}/events/${eventId}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Event nicht gefunden");
    throw new Error(`Beim Laden des Events ist ein Fehler aufgetreten (Status ${res.status})`);
  }
  const e: EventInfoRaw = await res.json();
  return {
    id:            e.id ?? crypto.randomUUID(),
    title:         e.title,
    category:      e.category,
    description:   e.description,
    location:      e.location,
    attendees:     e.attendeeCount,
    capacity:      e.capacity,
    status:        e.status,
    image:         e.image ?? "/placeholder.svg",
    creatorName:   e.creatorName ?? "Unbekannt",
    start:         new Date(e.start),
    end:           e.end ? new Date(e.end) : new Date(e.start),
    createdAt:     new Date(e.createdAt ?? Date.now()),
    updatedAt:     new Date(e.updatedAt ?? Date.now()),
    createdBy:     e.createdBy ?? "",
    updatedBy:     e.updatedBy ?? "",
    organization:  e.organization ?? "",
  };
}