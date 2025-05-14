import type { EventInfo } from "@/lib/types";
import { z } from "zod";

const BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/orgs`
    : "http://localhost:5256/api/orgs";

export interface EventInfoRaw {
  id?: string
  title: string
  category: string
  start: string
  location: string
  attendees: number
  status: number
  description: string
}

export async function getEvents(orgId: string): Promise<EventInfo[]> {
  const res = await fetch(`${BASE}/${orgId}/events`, { headers: {/*…*/} })
  if (!res.ok) throw new Error(`Status ${res.status}`)

  const raw: EventInfoRaw[] = await res.json()
  return raw.map((e): EventInfo => ({
    id: e.id ?? crypto.randomUUID(), // oder zwingend vom Backend mitliefern
    title: e.title,
    category: e.category,
    date: new Date(e.start),
    location: e.location,
    attendees: e.attendees,
    description: e.description,
    createdAt: new Date(), // TODO: vom Backend mitliefern
    updatedAt: new Date(), // TODO: vom Backend mitliefern
    createdBy: "userId", // TODO: vom Backend mitliefern
    updatedBy: "userId", // TODO: vom Backend mitliefern
    image: "randomImage(800, 400)",// TODO: vom Backend mitliefern
    organization: "",
    capacity: 0,
    status: "",
    start: new Date(e.start), 
    end: new Date(e.start)
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