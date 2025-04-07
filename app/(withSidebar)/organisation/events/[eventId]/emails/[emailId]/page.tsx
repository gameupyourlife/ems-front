"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Email } from "@/lib/types";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  Clock, 
  Edit, 
  Mail, 
  Send, 
  Trash, 
  Copy, 
  User, 
  CalendarIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock data for emails
const mockEmails: Email[] = [
  {
    id: "email-1",
    eventId: "event-1",
    subject: "Registration Confirmation",
    body: "<h2>Thank you for registering!</h2><p>We're excited to have you join us for our upcoming event. Here are some important details to keep in mind:</p><ul><li>Date: October 15, 2023</li><li>Time: 10:00 AM - 4:00 PM</li><li>Location: Conference Center, Room 302</li></ul><p>Please arrive 15 minutes early for check-in. If you have any questions, don't hesitate to reach out!</p>",
    recipients: ["john.doe@example.com", "jane.smith@example.com"],
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
    body: "<p>Don't forget about our event tomorrow!</p><p>We're looking forward to seeing you. Here's a quick reminder of what to bring:</p><ol><li>Your ticket (digital or printed)</li><li>Photo ID</li><li>A notebook and pen</li></ol><p>See you soon!</p>",
    recipients: ["john.doe@example.com", "jane.smith@example.com", "michael.j@example.com"],
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
    body: "<p>Please provide your feedback on the event.</p><p>Your insights are invaluable to us. Please take a moment to <a href='https://example.com/feedback'>fill out our survey</a>.</p>",
    recipients: ["john.doe@example.com"],
    status: "draft",
    createdAt: new Date("2023-09-21T09:15:00"),
    updatedAt: new Date("2023-09-21T09:15:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
];

export default function ViewEmail() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const emailId = params.emailId as string;
  
  const [email, setEmail] = useState<Email | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

    fetchEmail();
  }, [eventId, emailId]);

  // Handle send email
  const handleSendEmail = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      if (email) {
        setEmail({
          ...email,
          status: "sent",
          sentAt: new Date(),
        });
      }
      
      setSendDialogOpen(false);
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete email
  const handleDeleteEmail = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be a DELETE request to your API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate back to emails list
      router.push(`/organisation/events/${eventId}/emails`);
    } catch (err) {
      console.error("Error deleting email:", err);
      alert("Failed to delete email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800">Scheduled</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-50 text-green-800">Sent</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          onClick={() => router.push(`/organisation/events/${eventId}/emails`)} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Return to Emails
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/organisation/events/${eventId}/emails`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Emails
        </Button>
        
        <div className="flex items-center gap-2">
          {email.status === "draft" && (
            <>
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/organisation/events/${eventId}/emails/${emailId}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={() => setSendDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Send Now
              </Button>
            </>
          )}
          
          <Button 
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/organisation/events/${eventId}/emails/create?duplicate=${emailId}`}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Link>
          </Button>
          
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{email.subject}</CardTitle>
              <CardDescription>Email for event #{eventId}</CardDescription>
            </div>
            <div>{getStatusBadge(email.status)}</div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recipients</h4>
              <div className="space-y-1">
                {email.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{recipient}</span>
                  </div>
                ))}
                {email.recipients.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recipients specified</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                <p className="text-sm">{format(new Date(email.createdAt), "PPP 'at' p")}</p>
              </div>
              
              {email.status === "scheduled" && email.scheduledFor && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Scheduled For</h4>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p className="text-sm">{format(new Date(email.scheduledFor), "PPP 'at' p")}</p>
                  </div>
                </div>
              )}
              
              {email.status === "sent" && email.sentAt && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Sent At</h4>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    <p className="text-sm">{format(new Date(email.sentAt), "PPP 'at' p")}</p>
                  </div>
                </div>
              )}
              
              {email.status === "failed" && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                    <p className="text-sm">Failed to send</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Email content preview */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Email Content</h3>
            <div 
              className="prose max-w-none border rounded-md p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Last updated {format(new Date(email.updatedAt), "PPP 'at' p")}
          </div>
        </CardFooter>
      </Card>
      
      {/* Send confirmation dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this email now? This will send the email to all {email.recipients.length} recipients immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendEmail} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEmail} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}