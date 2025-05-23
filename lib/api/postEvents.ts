import { type EventInfo } from "@/lib/types-old";
import { z } from "zod";

// Basis-URL für alle Requests
const BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/orgs`
    : "http://localhost:5256/api/orgs";

// Aktualisiertes Zod-Schema, das mit den Backend-Anforderungen übereinstimmt
export const eventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  category: z.string().min(1, "Kategorie ist erforderlich"),
  location: z.string().min(1, "Ort ist erforderlich"),
  capacity: z.number(),
  image: z
    .string()
    .url({ message: "Bitte gib eine gültige Bild-URL an" })
    .or(z.literal("")),
  start: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: "Ungültiges Datum" }),
  end: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: "Ungültiges Datum" }),
  status: z.number(),
});
export type EventFormData = z.infer<typeof eventSchema>;

// Payload-Typ für neue Events
export interface NewEventPayload extends EventFormData {
  createdAt: string;
  createdBy: string;
}

// POST /orgs/{orgId}/events – korrigiert mit Authorization-Header
export async function createEvent(
  orgId: string,
  payload: NewEventPayload,
  token: string
): Promise<EventInfo> {
  // Client-seitige Validierung
  eventSchema.parse(payload);

  // Fallback-Werte sicherstellen
  const validatedPayload = {
    ...payload,
    image: payload.image || "https://placeholder.com/default.jpg",
  };

  console.log("🚀 Sending event payload to", `${BASE}/${orgId}/events`);
  console.log(validatedPayload);

  const res = await fetch(`${BASE}/${orgId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Hier kommt dein JWT-Token rein:
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(validatedPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ createEvent Bad Request body:", text);

    // Versuche, JSON-Fehler besser lesbar aufzubereiten
    let message = text;
    try {
      const err = JSON.parse(text);
      if (err.errors) {
        message = Object.entries(err.errors)
          .map(([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join("\n");
      } else {
        message = err.message || text;
      }
    } catch {
      // leave message as-is
    }
    throw new Error(message);
  }

  const created = (await res.json()) as EventInfo;
  return created;
}

export async function updateEvent(
  orgId: string,
  eventId: string,
  payload: EventFormData,
  token: string
): Promise<EventInfo> {
  // Client-seitige Validierung
  eventSchema.parse(payload);

  // Fallback für leere Bild-URL
  const validatedPayload = {
    ...payload,
    image: payload.image || "https://placeholder.com/default.jpg",
  };

  console.log("🚀 Updating event with payload at", `${BASE}/${orgId}/events/${eventId}`);
  console.log(validatedPayload);

  const res = await fetch(`${BASE}/${orgId}/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(validatedPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ updateEvent Bad Request body:", text);

    // Fehlernachricht aus JSON besser lesbar machen
    let message = text;
    try {
      const err = JSON.parse(text);
      if (err.errors) {
        message = Object.entries(err.errors)
          .map(([field, msgs]) =>
            `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join("\n");
      } else {
        message = err.message || text;
      }
    } catch {
      // leave as-is
    }
    throw new Error(message);
  }

  const updated = (await res.json()) as EventInfo;
  return updated;
}