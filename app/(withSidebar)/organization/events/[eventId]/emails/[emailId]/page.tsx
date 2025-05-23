"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Email } from "@/lib/types-old";
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
  Edit, Send,
  Trash,
  Copy,
  User,
  CalendarIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Mock-Daten für E-Mails
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
  
  // Zustände für Dialoge
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Lädt die E-Mail anhand der ID
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        // Simulierter API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sucht die E-Mail
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

    fetchEmail();
  }, [eventId, emailId]);

  // Versendet die E-Mail
  const handleSendEmail = async () => {
    setIsSubmitting(true);
    try {
      // In einer echten App wäre dies ein POST-Request an die API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Lokalen Status aktualisieren
      if (email) {
        setEmail({
          ...email,
          status: "sent",
          sentAt: new Date(),
        });
      }
      
      setSendDialogOpen(false);
    } catch (err) {
      console.error("Fehler beim Versenden der E-Mail:", err);
      alert("E-Mail konnte nicht gesendet werden. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Löscht die E-Mail
  const handleDeleteEmail = async () => {
    setIsSubmitting(true);
    try {
      // In einer echten App wäre dies ein DELETE-Request an die API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Zurück zur E-Mail-Liste navigieren
      router.push(`/organization/events/${eventId}/emails`);
    } catch (err) {
      console.error("Fehler beim Löschen der E-Mail:", err);
      alert("E-Mail konnte nicht gelöscht werden. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gibt das Status-Badge zurück
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Entwurf</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800">Geplant</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-green-50 text-green-800">Gesendet</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-800">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          onClick={() => router.push(`/organization/events/${eventId}/emails`)} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Zurück zur Übersicht
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
          onClick={() => router.push(`/organization/events/${eventId}/emails`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück zu den E-Mails
        </Button>
        
        <div className="flex items-center gap-2">
          {email.status === "draft" && (
            <>
              <Button 
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/organization/events/${eventId}/emails/${emailId}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Link>
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={() => setSendDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-1" />
                Jetzt senden
              </Button>
            </>
          )}
          
          <Button 
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/organization/events/${eventId}/emails/create?duplicate=${emailId}`}>
              <Copy className="h-4 w-4 mr-1" />
              Duplizieren
            </Link>
          </Button>
          
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{email.subject}</CardTitle>
              <CardDescription>E-Mail für Event #{eventId}</CardDescription>
            </div>
            <div>{getStatusBadge(email.status)}</div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* E-Mail Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Empfänger</h4>
              <div className="space-y-1">
                {email.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{recipient}</span>
                  </div>
                ))}
                {email.recipients.length === 0 && (
                  <p className="text-sm text-muted-foreground">Keine Empfänger angegeben</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Erstellt am</h4>
                <p className="text-sm">{format(new Date(email.createdAt), "PPP 'um' p")}</p>
              </div>
              
              {email.status === "scheduled" && email.scheduledFor && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Geplant für</h4>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <p className="text-sm">{format(new Date(email.scheduledFor), "PPP 'um' p")}</p>
                  </div>
                </div>
              )}
              
              {email.status === "sent" && email.sentAt && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Gesendet am</h4>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    <p className="text-sm">{format(new Date(email.sentAt), "PPP 'um' p")}</p>
                  </div>
                </div>
              )}
              
              {email.status === "failed" && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-red-600" />
                    <p className="text-sm">Senden fehlgeschlagen</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Vorschau des E-Mail-Inhalts */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">E-Mail-Inhalt</h3>
            <div 
              className="prose dark:prose-invert max-w-none border rounded-md p-6 bg-white dark:bg-gray-900"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Zuletzt aktualisiert am {format(new Date(email.updatedAt), "PPP 'um' p")}
          </div>
        </CardFooter>
      </Card>
      
      {/* Bestätigungsdialog für Senden */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>E-Mail senden</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diese E-Mail jetzt an alle {email.recipients.length} Empfänger senden?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendEmail} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                  Senden...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Jetzt senden
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bestätigungsdialog für Löschen */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>E-Mail löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diese E-Mail löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEmail} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                  Lösche...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Löschen
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}