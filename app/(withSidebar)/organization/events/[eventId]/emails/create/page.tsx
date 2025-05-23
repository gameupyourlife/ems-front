"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { EventEmailForm } from "@/components/org/events/event-email-form";
import { Email, User, EventInfo } from "@/lib/types-old";
import { mockEmails } from "@/lib/mock/email-data";
import { mockEvents } from "@/lib/data";

// Beispielhafte Teilnehmerdaten (Mock-Daten)
const mockAttendees: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    createdAt: "2023-01-15T10:00:00",
    updatedAt: "2023-01-15T10:00:00",
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    createdAt: "2023-02-20T14:30:00",
    updatedAt: "2023-02-20T14:30:00",
    profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "user-3",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    createdAt: "2023-03-10T09:15:00",
    updatedAt: "2023-03-10T09:15:00",
    profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

export default function CreateEmail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const duplicateEmailId = searchParams.get("duplicate");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [emailToDuplicate, setEmailToDuplicate] = useState<Email | undefined>(undefined);
  const [eventDetails, setEventDetails] = useState<EventInfo | undefined>(undefined);

  useEffect(() => {
    // In einer echten Anwendung würde hier ein API-Aufruf erfolgen
    const fetchAttendees = async () => {
      try {
        // Simulierter API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 300));
        setAttendees(mockAttendees);
      } catch (err) {
        console.error("Fehler beim Laden der Teilnehmer:", err);
        // Fehlerstatus kann hier behandelt werden
      }
    };

    // Event-Details abrufen
    const fetchEventDetails = async () => {
      try {
        // Simulierter API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 200));
        const event = mockEvents.find(e => e.id === eventId);
        if (event) {
          setEventDetails(event);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Event-Details:", err);
      }
    };

    fetchAttendees();
    fetchEventDetails();

    // Wenn eine E-Mail dupliziert werden soll, lade die Original-E-Mail
    if (duplicateEmailId) {
      const fetchEmailToDuplicate = async () => {
        try {
          // Simulierter API-Aufruf
          await new Promise(resolve => setTimeout(resolve, 300));
          const email = mockEmails.find(e => e.id === duplicateEmailId);
          if (email) {
            setEmailToDuplicate({
              ...email,
              id: "", // ID für Duplikat entfernen
              status: "draft", // Status auf Entwurf zurücksetzen
              sentAt: undefined, // Versanddatum entfernen
              scheduledFor: undefined, // Geplantes Datum entfernen
              createdAt: new Date(), // Erstellungsdatum aktualisieren
              updatedAt: new Date(), // Aktualisierungsdatum aktualisieren
            });
          }
        } catch (err) {
          console.error("Fehler beim Laden der zu duplizierenden E-Mail:", err);
        }
      };

      fetchEmailToDuplicate();
    }
  }, [eventId, duplicateEmailId]);

  // Speichern der E-Mail (simuliert)
  const handleSaveEmail = async (emailData: Partial<Email>) => {
    setIsSubmitting(true);
    try {
      // In einer echten Anwendung würde hier ein POST-Request an die API erfolgen
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("E-Mail gespeichert:", emailData);
      // Erfolg - Navigation zurück zur E-Mail-Liste erfolgt in der Formular-Komponente
    } catch (err) {
      console.error("Fehler beim Speichern der E-Mail:", err);
      throw err; // Fehler weitergeben, damit das Formular die Anzeige übernimmt
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventEmailForm
      eventId={eventId}
      eventAttendees={attendees}
      eventDetails={eventDetails}
      onSave={handleSaveEmail}
      isSubmitting={isSubmitting}
      email={emailToDuplicate}
    />
  );
}