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

export async function getEvents(orgId: string): Promise<EventInfo[]> {
  const res = await fetch(`${BASE}/${orgId}/events`, { headers: {/*…*/} })
  if (!res.ok) throw new Error(`Status ${res.status}`)

  const raw: EventInfoRaw[] = await res.json()
  return raw.map((e): EventInfo => ({
    id: e.id ?? crypto.randomUUID(),
    title: e.title,
    category: e.category,
    date: new Date(e.start),
    location: e.location,
    attendees: e.attendeeCount,
    capacity: e.capacity,
    description: e.description,
    createdAt: new Date(),
    updatedAt: new Date(), 
    createdBy: "userId", 
    updatedBy: "userId", 
    image: e.image  ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Test.svg/1200px-Test.svg.png",
    organization: "",
    status: "",
    start: new Date(e.start), 
    end: new Date(e.start),
    creatorName: e.creatorName ?? "Unbekannt",
  }))
}

export const eventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategorie ist erforderlich"),
  location: z.string().min(1, "Ort ist erforderlich"),
  capacity: z
    .number({ invalid_type_error: "Kapazität muss eine Zahl sein" })
    .optional(),
  image: z.string().url("Ungültige URL").optional(),
  start: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Ungültiges Datum",
  }),
  end: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Ungültiges Datum",
  }),
});
export type EventFormData = z.infer<typeof eventSchema>;

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
    status:        String(e.status),
    image:         e.image ?? "/placeholder.svg",
    creatorName:   e.creatorName ?? "Unbekannt",
    start:         new Date(e.start),
    end:           e.end ? new Date(e.end) : new Date(e.start),
    date:          new Date(e.start),
    createdAt:     new Date(e.createdAt ?? Date.now()),
    updatedAt:     new Date(e.updatedAt ?? Date.now()),
    createdBy:     e.createdBy ?? "",
    updatedBy:     e.updatedBy ?? "",
    organization:  e.organization ?? "",
  };
}