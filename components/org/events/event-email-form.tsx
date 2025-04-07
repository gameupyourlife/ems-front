"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card,
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { DateTimePicker24h } from "@/components/ui/date-time-picker";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon, ChevronLeft, Send, Users, UserPlus, Mail, TemplateIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Email, User, EventInfo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { emailTemplates, applyTemplateValues, generatePlaceholderValues } from "@/lib/mock/email-data";

// Editor component imports
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

// Toolbar component for the email editor
function EmailEditorToolbar({ editor }: { editor: any }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-2 flex flex-wrap items-center gap-1 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("bold") ? "bg-muted" : ""
        )}
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("italic") ? "bg-muted" : ""
        )}
      >
        <span className="italic">I</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
        )}
      >
        H1
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
        )}
      >
        H2
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("bulletList") ? "bg-muted" : ""
        )}
      >
        • List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "h-8 px-2",
          editor.isActive("orderedList") ? "bg-muted" : ""
        )}
      >
        1. List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={cn(
          "h-8 px-2",
          editor.isActive("link") ? "bg-muted" : ""
        )}
      >
        Link
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="h-8 px-2"
      >
        Image
      </Button>

      <div className="ml-auto flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 px-2"
        >
          Undo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 px-2"
        >
          Redo
        </Button>
      </div>
    </div>
  );
}

// The main email form component
interface EventEmailFormProps {
  email?: Email;
  eventId: string;
  eventAttendees?: User[];
  eventDetails?: EventInfo;
  onSave: (emailData: Partial<Email>) => Promise<void>;
  isSubmitting?: boolean;
}

export function EventEmailForm({
  email,
  eventId,
  eventAttendees = [],
  eventDetails,
  onSave,
  isSubmitting = false,
}: EventEmailFormProps) {
  const router = useRouter();
  const isEditing = !!email;
  
  const [subject, setSubject] = useState(email?.subject || "");
  const [recipients, setRecipients] = useState<string[]>(email?.recipients || []);
  const [recipientType, setRecipientType] = useState<"all" | "specific">(
    email ? (email.recipients.length === 0 ? "all" : "specific") : "all"
  );
  const [scheduleSetting, setScheduleSetting] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    email?.scheduledFor ? new Date(email.scheduledFor) : undefined
  );
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  // Email content editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Placeholder.configure({
        placeholder: 'Write your email content here...',
      }),
    ],
    content: email?.body || "",
  });

  // Reset the form if email changes
  useEffect(() => {
    if (email) {
      setSubject(email.subject || "");
      setRecipients(email.recipients || []);
      setRecipientType(email.recipients.length === 0 ? "all" : "specific");
      setScheduleSetting(email.scheduledFor ? "later" : "now");
      setScheduledDate(email.scheduledFor ? new Date(email.scheduledFor) : undefined);
      
      if (editor) {
        editor.commands.setContent(email.body || "");
      }
    }
  }, [email, editor]);

  // Handle form submission
  const handleSubmit = async (sendNow: boolean = false) => {
    if (!subject.trim()) {
      alert("Please enter a subject for your email");
      return;
    }

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      alert("Please enter content for your email");
      return;
    }

    // If scheduling but no date selected
    if (scheduleSetting === "later" && !scheduledDate) {
      alert("Please select a date for scheduling this email");
      return;
    }

    const finalRecipients = recipientType === "all" 
      ? eventAttendees.map(attendee => attendee.email)
      : recipients;

    const emailData: Partial<Email> = {
      subject,
      body: editor.getHTML(),
      recipients: finalRecipients,
      status: sendNow ? "sent" : (scheduleSetting === "later" ? "scheduled" : "draft"),
      scheduledFor: scheduleSetting === "later" ? scheduledDate : undefined,
      eventId,
    };

    try {
      await onSave(emailData);
      router.push(`/organisation/events/${eventId}/emails`);
    } catch (error) {
      console.error("Error saving email:", error);
      alert("Failed to save email. Please try again.");
    }
  };

  // Add an individual recipient
  const addRecipient = (email: string) => {
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
  };

  // Remove a recipient
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  // Handle adding recipients from attendees list
  const addAttendee = (attendee: User) => {
    if (!recipients.includes(attendee.email)) {
      setRecipients([...recipients, attendee.email]);
    }
  };

  // Apply a template to the email
  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Generate placeholders based on event details
    const placeholders = generatePlaceholderValues(eventDetails);

    // Apply placeholders to template
    const subjectWithValues = applyTemplateValues(template.subject, placeholders);
    const bodyWithValues = applyTemplateValues(template.body, placeholders);

    // Update the form
    setSubject(subjectWithValues);
    if (editor) {
      editor.commands.setContent(bodyWithValues);
    }

    // Close the dialog
    setTemplateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/organisation/events/${eventId}/emails`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Emails
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Email" : "Create Email"}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the email details and content" 
              : "Compose a new email to send to event attendees"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Email Content</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplateDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-4 w-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Use Template
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Recipients</Label>
              <Tabs defaultValue={recipientType} onValueChange={(value) => setRecipientType(value as "all" | "specific")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">All Attendees</TabsTrigger>
                  <TabsTrigger value="specific">Specific Recipients</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-2">
                  <div className="flex items-center py-2">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      This email will be sent to all attendees ({eventAttendees.length})
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="specific" className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="recipientEmail"
                        placeholder="Enter email address"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            addRecipient(input.value);
                            input.value = '';
                          }
                        }}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        const input = document.getElementById('recipientEmail') as HTMLInputElement;
                        addRecipient(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-10 p-0">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <div className="p-3 border-b">
                          <h4 className="font-medium">Add Event Attendees</h4>
                          <p className="text-xs text-muted-foreground">Select from event attendees</p>
                        </div>
                        <ScrollArea className="h-72">
                          {eventAttendees.length > 0 ? (
                            <div className="p-2 space-y-1">
                              {eventAttendees.map((attendee) => (
                                <div 
                                  key={attendee.id}
                                  className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                                  onClick={() => addAttendee(attendee)}
                                >
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{attendee.name}</div>
                                    <div className="text-xs text-muted-foreground">{attendee.email}</div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addAttendee(attendee);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No attendees for this event
                            </div>
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="py-1 pl-2">
                        {email}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => removeRecipient(email)}
                        >
                          &times;
                        </Button>
                      </Badge>
                    ))}
                    {recipients.length === 0 && (
                      <div className="text-sm text-muted-foreground p-1">
                        No recipients added yet
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <Label>Scheduling</Label>
              <Tabs defaultValue={scheduleSetting} onValueChange={(value) => setScheduleSetting(value as "now" | "later")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="now">Send when ready</TabsTrigger>
                  <TabsTrigger value="later">Schedule for later</TabsTrigger>
                </TabsList>
                <TabsContent value="now" className="space-y-2">
                  <div className="flex items-center py-2">
                    <span className="text-sm">
                      The email will be saved as a draft and can be sent manually when ready.
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="later" className="space-y-2">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="scheduledDate">Select date and time</Label>
                    <DateTimePicker24h
                      granularity="minute"
                      value={scheduledDate}
                      onChange={setScheduledDate}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Email Content</Label>
              <div className="border rounded-md">
                {editor && <EmailEditorToolbar editor={editor} />}
                <EditorContent
                  editor={editor}
                  className="prose max-w-none p-4 min-h-[300px]"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/organisation/events/${eventId}/emails`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            {scheduleSetting === "now" && (
              <Button
                variant="default"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            )}
            {scheduleSetting === "later" && (
              <Button
                variant="default"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Template selection dialog */}
      <AlertDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Choose an Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Select a template to use as a starting point for your email. Event details will be automatically inserted where possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="overflow-y-auto max-h-[50vh]">
            <div className="grid gap-4 py-4 md:grid-cols-2">
              {emailTemplates.map(template => (
                <div 
                  key={template.id}
                  className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template.id)}
                >
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Subject: <span className="text-foreground">{template.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}