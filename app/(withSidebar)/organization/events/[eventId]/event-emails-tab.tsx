"use client";
import { useEffect, useState } from "react";
import { Email, EventDetails } from "@/lib/types-old";
import EmailTable from "@/components/org/events/event-email-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { emailTemplates } from "@/lib/mock/email-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EmailTemplateView from "@/components/org/email-template-view";

// Mock-Daten für E-Mails (Instanzen von E-Mail-Vorlagen, die an Empfänger gesendet wurden)
const mockEmails: Email[] = [
  {
    id: "email-1",
    eventId: "event-1",
    subject: "Anmeldebestätigung",
    body: "<p>Vielen Dank für Ihre Anmeldung zu unserer Veranstaltung!</p>",
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
    subject: "Veranstaltungserinnerung - Morgen!",
    body: "<p>Vergessen Sie nicht unsere Veranstaltung morgen!</p>",
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
    subject: "Feedback zur Veranstaltung",
    body: "<p>Bitte geben Sie uns Ihr Feedback zur Veranstaltung.</p>",
    recipients: ["attendee1@example.com"],
    status: "draft",
    createdAt: new Date("2023-09-21T09:15:00"),
    updatedAt: new Date("2023-09-21T09:15:00"),
    createdBy: "user-1",
    updatedBy: "user-1",
  },
];

// Interface für E-Mail-Vorlagen
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isSystemTemplate?: boolean;
  isOrgTemplate?: boolean;
  isEventTemplate?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function EventEmailsTab({eventDetails}: {eventDetails: EventDetails}) {
  const eventId = eventDetails.metadata.id;
  const [emails, setEmails] = useState<Email[]>([]);
  const [orgTemplates, setOrgTemplates] = useState<EmailTemplate[]>([]);
  const [eventTemplates, setEventTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In einer echten Anwendung würde hier ein API-Request erfolgen
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock-API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filtere E-Mails für dieses Event
        const eventEmails = mockEmails.filter(email => email.eventId === eventId);
        setEmails(eventEmails);
        
        // Hole Organisationsvorlagen
        const orgTemplatesData = emailTemplates.map(template => ({
          ...template,
          isSystemTemplate: false,
          isOrgTemplate: true,
          isEventTemplate: false
        }));
        setOrgTemplates(orgTemplatesData);
        
        // Mock Event-spezifische Vorlagen (in einer echten App aus der API laden)
        const mockEventTemplates: EmailTemplate[] = [
          {
            id: "event-template-1",
            name: "Individuelle Event-Begrüßung",
            subject: "Willkommen zu [Event Name] - Wichtige Informationen",
            body: `<h2>Willkommen zu ${eventDetails.metadata.title}!</h2><p>Dies ist eine individuelle Vorlage für dieses Event.</p>`,
            description: "Individuelle Begrüßungs-E-Mail für dieses Event",
            isSystemTemplate: false,
            isOrgTemplate: false,
            isEventTemplate: true,
            createdBy: "Aktueller Benutzer",
            createdAt: new Date("2023-10-01")
          },
          {
            id: "event-template-2",
            name: "Angepasste Anmeldevorlage",
            subject: "Anmeldebestätigung - [Event Name]",
            body: `<h2>Vielen Dank für Ihre Anmeldung!</h2><p>Dies ist eine angepasste Organisationsvorlage.</p>`,
            description: "Abgeleitet von Organisationsvorlage",
            isSystemTemplate: false,
            isOrgTemplate: true,
            isEventTemplate: true,
            createdBy: "Aktueller Benutzer",
            createdAt: new Date("2023-09-15")
          }
        ];
        setEventTemplates(mockEventTemplates);
        
        setError(null);
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
        setError("Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, eventDetails.metadata.title]);

  // Löscht eine E-Mail-Instanz
  const handleDeleteEmail = async (emailId: string) => {
    try {
      // In einer echten App wäre dies ein DELETE-Request an die API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Lokalen Zustand aktualisieren
      setEmails(emails.filter(email => email.id !== emailId));
    } catch (err) {
      console.error("Fehler beim Löschen der E-Mail:", err);
      alert("E-Mail konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.");
    }
  };

  // Sendet eine E-Mail-Instanz
  const handleSendEmail = async (emailId: string) => {
    try {
      // In einer echten App wäre dies ein POST-Request an die API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Lokalen Zustand aktualisieren
      setEmails(emails.map(email => 
        email.id === emailId 
          ? { ...email, status: "sent", sentAt: new Date() } 
          : email
      ));
    } catch (err) {
      console.error("Fehler beim Senden der E-Mail:", err);
      alert("E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    }
  };

  // Dupliziert eine Vorlage (erstellt eine Kopie in den Event-Vorlagen)
  const handleDuplicateTemplate = (template: EmailTemplate) => {
    // In einer echten App: POST-Request zum Erstellen einer neuen Vorlage basierend auf der bestehenden
    const newTemplate: EmailTemplate = {
      ...template,
      id: `copy-${template.id}-${Date.now()}`,
      name: `Kopie von ${template.name}`,
      isSystemTemplate: false,
      isOrgTemplate: false,
      isEventTemplate: true,
      createdBy: "Aktueller Benutzer",
      createdAt: new Date(),
    };
    
    setEventTemplates([...eventTemplates, newTemplate]);
  };

  // Löscht eine Event-Vorlage
  const handleDeleteTemplate = (templateId: string) => {
    setEventTemplates(eventTemplates.filter(template => template.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Event-Kommunikation
          </CardTitle>
          <CardDescription>
            Verwalten Sie E-Mails und Vorlagen für dieses Event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instances" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="instances" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-Mail-Instanzen
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                E-Mail-Vorlagen
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="instances">
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
            </TabsContent>
            
            <TabsContent value="templates">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  {error}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Event-Vorlagen</h3>
                    <Button asChild>
                      <Link href={`/organization/events/${eventId}/templates/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Vorlage erstellen
                      </Link>
                    </Button>
                  </div>

                  {/* Event-spezifische Vorlagen */}
                  {eventTemplates.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 mb-8">
                      {eventTemplates.map((template) => (
                        <EmailTemplateView
                          key={template.id}
                          template={template}
                          onEdit={() => {
                            window.location.href = `/organization/events/${eventId}/templates/${template.id}/edit`;
                          }}
                          onDelete={() => handleDeleteTemplate(template.id)}
                          onCreateEmail={() => {
                            window.location.href = `/organization/events/${eventId}/emails/create?template=${template.id}`;
                          }}
                          isEvent={true}
                          eventId={eventId}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 mb-6 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">Noch keine event-spezifischen Vorlagen vorhanden</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        asChild
                      >
                        <Link href={`/organization/events/${eventId}/templates/create`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Erste Vorlage erstellen
                        </Link>
                      </Button>
                    </div>
                  )}

                  <h3 className="text-lg font-medium mb-4">Organisationsvorlagen</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {orgTemplates.map((template) => (
                      <EmailTemplateView
                        key={template.id}
                        template={template}
                        onDuplicate={() => handleDuplicateTemplate(template)}
                        onCreateEmail={() => {
                          window.location.href = `/organization/events/${eventId}/emails/create?template=${template.id}`;
                        }}
                        eventId={eventId}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}