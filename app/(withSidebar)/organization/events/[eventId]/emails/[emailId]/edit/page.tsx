"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
    location: "Conference Center, Downtown",
    description: "Annual technology conference featuring the latest innovations",
    category: 1,
    attendees: 250,
    capacity: 300,
    image: "https://example.com/tech-conf.jpg",
    status: 0,
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
    location: "Business Center, Midtown",
    description: "Hands-on workshop for digital marketing professionals",
    category: 1,
    attendees: 45,
    capacity: 50,
    image: "https://example.com/marketing-workshop.jpg",
    status: 1,
    start: new Date("2023-11-05T13:00:00"),
    end: new Date("2023-11-05T17:30:00"),
    createdAt: new Date("2023-08-15T14:20:00"),
    updatedAt: new Date("2023-08-15T14:20:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  }
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
    // Fetch email data
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find the email
        const foundEmail = mockEmails.find(e => e.id === emailId && e.eventId === eventId);
        
        if (foundEmail) {
          setEmail(foundEmail);
        } else {
          setError("Email not found");
        }
      } catch (err) {
        console.error("Error fetching email:", err);
        setError("Failed to load email. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch attendees
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

    fetchEmail();
    fetchAttendees();
    fetchEventDetails();
  }, [eventId, emailId]);

  const handleSaveEmail = async (emailData: Partial<Email>) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a PUT request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update with the new data
      const updatedEmail = {
        ...email!,
        ...emailData,
        updatedAt: new Date(),
      };
      
      console.log("Email updated:", updatedEmail);
      // Success - navigation back to email list happens in the form component
    } catch (err) {
      console.error("Error updating email:", err);
      throw err; // Rethrow to let the form component handle error display
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error || !email) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 text-lg">{error || "Email not found"}</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Go Back
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