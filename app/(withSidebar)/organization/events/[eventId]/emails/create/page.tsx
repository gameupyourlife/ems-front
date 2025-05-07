"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { EventEmailForm } from "@/components/org/events/event-email-form";
import { Email, User, EventInfo } from "@/lib/types";
import { mockEmails } from "@/lib/mock/email-data";

// Mock data for attendees
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

// Mock event data
const mockEvents: EventInfo[] = [
  {
    id: "event-1",
    title: "Tech Conference 2023",
    organization: "TechCorp",
    date: new Date("2023-10-15"),
    location: "Conference Center, Downtown",
    description: "Annual technology conference featuring the latest innovations",
    category: "Technology",
    attendees: 250,
    capacity: 300,
    image: "https://example.com/tech-conf.jpg",
    status: "active",
    start: new Date("2023-10-15T09:00:00"),
    end: new Date("2023-10-15T17:00:00"),
    createdAt: new Date("2023-07-10T10:00:00"),
    updatedAt: new Date("2023-07-10T10:00:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "event-2",
    title: "Marketing Workshop",
    organization: "Marketing Guild",
    date: new Date("2023-11-05"),
    location: "Business Center, Midtown",
    description: "Hands-on workshop for digital marketing professionals",
    category: "Marketing",
    attendees: 45,
    capacity: 50,
    image: "https://example.com/marketing-workshop.jpg",
    status: "active",
    start: new Date("2023-11-05T13:00:00"),
    end: new Date("2023-11-05T17:30:00"),
    createdAt: new Date("2023-08-15T14:20:00"),
    updatedAt: new Date("2023-08-15T14:20:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  }
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
    // In a real app, this would be a fetch request to your API
    const fetchAttendees = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setAttendees(mockAttendees);
      } catch (err) {
        console.error("Error fetching attendees:", err);
        // Handle error state if needed
      }
    };

    // Fetch event details
    const fetchEventDetails = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 200));
        const event = mockEvents.find(e => e.id === eventId);
        if (event) {
          setEventDetails(event);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    };

    fetchAttendees();
    fetchEventDetails();

    // If duplicating an email, fetch the original email
    if (duplicateEmailId) {
      const fetchEmailToDuplicate = async () => {
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 300));
          const email = mockEmails.find(e => e.id === duplicateEmailId);
          if (email) {
            setEmailToDuplicate({
              ...email,
              id: "", // Remove ID for duplication
              status: "draft", // Reset status to draft
              sentAt: undefined, // Clear sent date
              scheduledFor: undefined, // Clear schedule
              createdAt: new Date(), // Update creation date
              updatedAt: new Date(), // Update update date
            });
          }
        } catch (err) {
          console.error("Error fetching email to duplicate:", err);
        }
      };

      fetchEmailToDuplicate();
    }
  }, [eventId, duplicateEmailId]);

  const handleSaveEmail = async (emailData: Partial<Email>) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("Email saved:", emailData);
      // Success - navigation back to email list happens in the form component
    } catch (err) {
      console.error("Error saving email:", err);
      throw err; // Rethrow to let the form component handle error display
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