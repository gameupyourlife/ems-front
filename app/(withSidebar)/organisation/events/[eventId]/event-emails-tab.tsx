"use client";;
import { useEffect, useState } from "react";
import { Email, EventDetails } from "@/lib/types";
import EmailTable from "@/components/org/events/event-email-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, Plus, Edit, Copy, Pencil } from "lucide-react";
import Link from "next/link";
import { emailTemplates } from "@/lib/mock/email-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for emails (instances of email templates sent to recipients)
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

// Interface for email templates
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
    // In a real app, this would be a fetch request to your API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter emails for this event
        const eventEmails = mockEmails.filter(email => email.eventId === eventId);
        setEmails(eventEmails);
        
        // Get organization templates
        const orgTemplatesData = emailTemplates.map(template => ({
          ...template,
          isSystemTemplate: false,
          isOrgTemplate: true,
          isEventTemplate: false
        }));
        setOrgTemplates(orgTemplatesData);
        
        // Mock event-specific templates (in a real app, fetch from API)
        const mockEventTemplates: EmailTemplate[] = [
          {
            id: "event-template-1",
            name: "Custom Event Welcome",
            subject: "Welcome to [Event Name] - Special Information",
            body: `<h2>Welcome to ${eventDetails.title}!</h2><p>This is a custom template for this specific event.</p>`,
            description: "Custom welcome email for this event",
            isSystemTemplate: false,
            isOrgTemplate: false,
            isEventTemplate: true,
            createdBy: "Current User",
            createdAt: new Date("2023-10-01")
          },
          {
            id: "event-template-2",
            name: "Modified Registration Template",
            subject: "Registration Confirmation - [Event Name]",
            body: `<h2>Thank you for registering!</h2><p>This is a modified organization template.</p>`,
            description: "Modified from organization template",
            isSystemTemplate: false,
            isOrgTemplate: true,
            isEventTemplate: true,
            createdBy: "Current User",
            createdAt: new Date("2023-09-15")
          }
        ];
        setEventTemplates(mockEventTemplates);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, eventDetails.title]);

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

  // Handle duplicate template (create a copy in event templates)
  const handleDuplicateTemplate = (template: EmailTemplate) => {
    // In real app, send POST request to create new template based on existing one
    const newTemplate: EmailTemplate = {
      ...template,
      id: `copy-${template.id}-${Date.now()}`,
      name: `Copy of ${template.name}`,
      isSystemTemplate: false,
      isOrgTemplate: false,
      isEventTemplate: true,
      createdBy: "Current User",
      createdAt: new Date(),
    };
    
    setEventTemplates([...eventTemplates, newTemplate]);
  };

  // Handle delete event template
  const handleDeleteTemplate = (templateId: string) => {
    setEventTemplates(eventTemplates.filter(template => template.id !== templateId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Event Communications
          </CardTitle>
          <CardDescription>
            Manage emails and templates for this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instances" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="instances" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Instances
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Email Templates
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
                    <h3 className="text-lg font-medium">Event Templates</h3>
                    <Button asChild>
                      <Link href={`/organisation/events/${eventId}/templates/create`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                      </Link>
                    </Button>
                  </div>

                  {/* Event-specific templates */}
                  {eventTemplates.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                      {eventTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className="border rounded-md p-4 hover:border-primary transition-colors relative"
                        >
                          <div className="absolute top-4 right-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/organisation/events/${eventId}/templates/${template.id}/edit`} className="flex cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Template</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Delete Template</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <Badge 
                            variant="outline" 
                            className="bg-green-50 text-green-800 mb-2"
                          >
                            Event Template
                          </Badge>

                          <h3 className="font-medium mb-2 pr-8">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                            Subject: <span className="text-foreground">{template.subject}</span>
                          </p>
                          <Link href={`/organisation/events/${eventId}/emails/create?template=${template.id}`} 
                            className="flex items-center justify-center w-full px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Email
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 mb-6 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">No event-specific templates yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        asChild
                      >
                        <Link href={`/organisation/events/${eventId}/templates/create`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Template
                        </Link>
                      </Button>
                    </div>
                  )}

                  <h3 className="text-lg font-medium mb-4">Organization Templates</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {orgTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className="border rounded-md p-4 hover:border-primary transition-colors relative"
                      >
                        <div className="absolute top-4 right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicate as Event Template</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Badge 
                          variant="outline" 
                          className="bg-blue-50 text-blue-800 mb-2"
                        >
                          Organization Template
                        </Badge>

                        <h3 className="font-medium mb-2 pr-8">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                          Subject: <span className="text-foreground">{template.subject}</span>
                        </p>
                        <div className="flex gap-2">
                          <Link href={`/organisation/events/${eventId}/emails/create?template=${template.id}`} 
                            className="flex items-center justify-center flex-1 px-3 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Email
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="px-3 py-2"
                            onClick={() => handleDuplicateTemplate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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