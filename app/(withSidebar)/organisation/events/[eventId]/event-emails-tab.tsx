"use client";;
import { useEffect, useState } from "react";
import { Email, EventDetails } from "@/lib/types";
import EmailTable from "@/components/org/events/event-email-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

// Mock data for emails
const mockEmails: Email[] = [
  {
    id: "email-1",
    eventId: "event-1",
    subject: "Registration Confirmation",
    body: "<p>Thank you for registering for our event!</p>",
    recipients: ["attendee1@example.com", "attendee2@example.com"],
    status: "sent",
    sentAt: new Date("2023-09-15T14:30:00"),
    createdAt: new Date("2023-09-14T10:00:00"),
    updatedAt: new Date("2023-09-14T10:00:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-2",
    eventId: "event-1",
    subject: "Event Reminder - Tomorrow!",
    body: "<p>Don't forget about our event tomorrow!</p>",
    recipients: ["attendee1@example.com", "attendee2@example.com", "attendee3@example.com"],
    status: "scheduled",
    scheduledFor: new Date("2023-09-25T08:00:00"),
    createdAt: new Date("2023-09-20T16:45:00"),
    updatedAt: new Date("2023-09-20T16:45:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  {
    id: "email-3",
    eventId: "event-1",
    subject: "Event Feedback Request",
    body: "<p>Please provide your feedback on the event.</p>",
    recipients: ["attendee1@example.com"],
    status: "draft",
    createdAt: new Date("2023-09-21T09:15:00"),
    updatedAt: new Date("2023-09-21T09:15:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
];

export default function EventEmailsTab({eventDetails}: {eventDetails: EventDetails}) {
  const eventId = eventDetails.metadata.id;
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be a fetch request to your API
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter emails for this event
        const eventEmails = mockEmails.filter(email => email.eventId === eventId);
        setEmails(eventEmails);
        setError(null);
      } catch (err) {
        console.error("Error fetching emails:", err);
        setError("Failed to load emails. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [eventId]);

  const handleDeleteEmail = async (emailId: string) => {
    try {
      // In a real app, this would be a DELETE request to your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setEmails(emails.filter(email => email.id !== emailId));
    } catch (err) {
      console.error("Error deleting email:", err);
      alert("Failed to delete email. Please try again.");
    }
  };

  const handleSendEmail = async (emailId: string) => {
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setEmails(emails.map(email => 
        email.id === emailId 
          ? { ...email, status: "sent", sentAt: new Date() } 
          : email
      ));
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Event Emails
          </CardTitle>
          <CardDescription>
            Manage email communications for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : (
            <EmailTable 
              emails={emails} 
              eventId={eventId} 
              onDeleteEmail={handleDeleteEmail}
              onSendEmail={handleSendEmail}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}