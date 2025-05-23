"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { EventEmailForm } from "@/components/org/events/event-email-form";
import { Email, User, EventInfo } from "@/lib/types-old";
import { mockEmails } from "@/lib/mock/email-data";
import { mockEvents } from "@/lib/data";

// Mock-Daten für Teilnehmer
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

export default function EditEmail() {
  const params = useParams();
  const eventId = params.eventId as string;
  const emailId = params.emailId as string;
  
  const [email, setEmail] = useState<Email | undefined>(undefined);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [eventDetails, setEventDetails] = useState<EventInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // E-Mail-Daten laden
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        // Simulierter API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // E-Mail anhand der ID suchen
        const foundEmail = mockEmails.find(e => e.id === emailId && e.eventId === eventId);
        
        if (foundEmail) {
          setEmail(foundEmail);
        } else {
          setError("E-Mail nicht gefunden");
        }
      } catch (err) {
        console.error("Fehler beim Laden der E-Mail:", err);
        setError("E-Mail konnte nicht geladen werden. Bitte versuche es erneut.");
      } finally {
        setIsLoading(false);
      }
    };

    // Teilnehmer:innen laden
    const fetchAttendees = async () => {
      try {
        // Simulierter API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 300));
        setAttendees(mockAttendees);
      } catch (err) {
        console.error("Fehler beim Laden der Teilnehmer:innen:", err);
        // Fehlerstatus kann hier ggf. behandelt werden
      }
    };

    // Event-Details laden
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

    fetchEmail();
    fetchAttendees();
    fetchEventDetails();
  }, [eventId, emailId]);

  // Speichern der E-Mail
  const handleSaveEmail = async (emailData: Partial<Email>) => {
    setIsSubmitting(true);
    try {
      // In einer echten App wäre dies ein PUT-Request an die API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Aktualisieren mit den neuen Daten
      const updatedEmail = {
        ...email!,
        ...emailData,
        updatedAt: new Date(),
      };
      
      console.log("E-Mail aktualisiert:", updatedEmail);
      // Erfolg – Navigation zurück zur E-Mail-Liste erfolgt in der Formular-Komponente
    } catch (err) {
      console.error("Fehler beim Aktualisieren der E-Mail:", err);
      throw err; // Fehler weitergeben, damit das Formular diesen anzeigen kann
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ladezustand anzeigen
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fehlerzustand anzeigen
  if (error || !email) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 text-lg">{error || "E-Mail nicht gefunden"}</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Zurück
        </button>
      </div>
    );
  }

  return (
    <EventEmailForm
      email={email}
      eventId={eventId}
      eventAttendees={attendees}
      eventDetails={eventDetails}
      onSave={handleSaveEmail}
      isSubmitting={isSubmitting}
    />
  );
}