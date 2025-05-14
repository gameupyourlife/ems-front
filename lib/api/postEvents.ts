import type { EventInfo, EmsFile, Flow, AgendaStep } from "@/lib/types";
import { z } from "zod";

// Basis-URL für alle Requests
const BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/orgs`
    : "http://localhost:5256/api/orgs";

// Aktualisiertes Zod-Schema, das mit den Backend-Anforderungen übereinstimmt
export const eventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"), // Nicht mehr optional
  category: z.string().min(1, "Kategorie ist erforderlich"),
  location: z.string().min(1, "Ort ist erforderlich"),
  capacity: z.number(),
  image: z.string().min(1, "Bild-URL ist erforderlich"), // Nicht mehr optional
  start: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Ungültiges Datum" }),
  end: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Ungültiges Datum" }),
  status: z.number().int(),
});
export type EventFormData = z.infer<typeof eventSchema>;

// Payload-Typ für neue Events
export interface NewEventPayload extends EventFormData {
  attendees: number;
  files: EmsFile[];
  flows: Flow[];
  agenda: AgendaStep[];
}

// POST /events - Korrigierte Version
export async function createEvent(
  orgId: string,
  payload: NewEventPayload
): Promise<EventInfo> {
  try {
    // Client-seitige Validierung
    eventSchema.parse(payload);

    // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
    const validatedPayload = {
      ...payload,
      title: payload.title || "",
      description: payload.description || "",
      category: payload.category || "",
      location: payload.location || "",
      image: payload.image || "https://placeholder.com/default.jpg",
    };

    // Debug-Ausgabe
    console.log("Sending event payload:", validatedPayload);

    const res = await fetch(`${BASE}/${orgId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedPayload), // Direktes Senden ohne eventDto-Wrapper
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Bad Request Body from server:", text);
      
      // Verbesserte Fehlerbehandlung
      let msg = text;
      try {
        const err = JSON.parse(text);
        if (err.errors) {
          // Formatiere Fehler für bessere Lesbarkeit
          const formattedErrors = Object.entries(err.errors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`;
              } else {
                return `${field}: ${String(messages)}`;
              }
            })
            .join("\n");
          msg = formattedErrors;
        } else {
          msg = err.message || text;
        }
      } catch (e) {
        // Bei JSON-Parsing-Fehler den ursprünglichen Text verwenden
      }
      throw new Error(msg);
    }
    
    const raw = await res.json();
    return raw as EventInfo;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
}