"use client";;
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
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, ChevronLeft, Send, Users, UserPlus, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Email, User, EventInfo } from "@/lib/types-old";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { emailTemplates, applyTemplateValues, generatePlaceholderValues } from "@/lib/mock/email-data";

// Editor-Komponenten-Importe
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

// Toolbar-Komponente für den E-Mail-Editor
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
        • Liste
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
        1. Liste
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
          const url = window.prompt("Bild-URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="h-8 px-2"
      >
        Bild
      </Button>

      <div className="ml-auto flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 px-2"
        >
          Rückgängig
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 px-2"
        >
          Wiederholen
        </Button>
      </div>
    </div>
  );
}

// Hauptkomponente für das E-Mail-Formular
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
  
  // Editor für den E-Mail-Inhalt
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Placeholder.configure({
        placeholder: 'Schreibe hier deinen E-Mail-Inhalt...',
      }),
    ],
    content: email?.body || "",
  });

  // Formular zurücksetzen, wenn sich die E-Mail ändert
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

  // Formular absenden
  const handleSubmit = async (sendNow: boolean = false) => {
    if (!subject.trim()) {
      alert("Bitte gib einen Betreff für deine E-Mail ein");
      return;
    }

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      alert("Bitte gib einen Inhalt für deine E-Mail ein");
      return;
    }

    // Wenn geplant, aber kein Datum ausgewählt
    if (scheduleSetting === "later" && !scheduledDate) {
      alert("Bitte wähle ein Datum für den Versand der E-Mail");
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
      router.push(`/organization/events/${eventId}/emails`);
    } catch (error) {
      console.error("Fehler beim Speichern der E-Mail:", error);
      alert("E-Mail konnte nicht gespeichert werden. Bitte versuche es erneut.");
    }
  };

  // Einzelnen Empfänger hinzufügen
  const addRecipient = (email: string) => {
    if (email && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
  };

  // Empfänger entfernen
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  // Teilnehmer aus der Teilnehmerliste hinzufügen
  const addAttendee = (attendee: User) => {
    if (!recipients.includes(attendee.email)) {
      setRecipients([...recipients, attendee.email]);
    }
  };

  // Vorlage auf die E-Mail anwenden
  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Platzhalter basierend auf Event-Details generieren
    const placeholders = generatePlaceholderValues(eventDetails);

    // Platzhalter in Vorlage einsetzen
    const subjectWithValues = applyTemplateValues(template.subject, placeholders);
    const bodyWithValues = applyTemplateValues(template.body, placeholders);

    // Formular aktualisieren
    setSubject(subjectWithValues);
    if (editor) {
      editor.commands.setContent(bodyWithValues);
    }

    // Dialog schließen
    setTemplateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/organization/events/${eventId}/emails`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück zu den E-Mails
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {isEditing ? "E-Mail bearbeiten" : "E-Mail erstellen"}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Bearbeite die E-Mail und deren Inhalt" 
              : "Verfasse eine neue E-Mail für die Teilnehmer der Veranstaltung"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">E-Mail-Inhalt</h3>
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
              Vorlage verwenden
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                placeholder="Betreff der E-Mail eingeben"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Empfänger</Label>
              <Tabs defaultValue={recipientType} onValueChange={(value) => setRecipientType(value as "all" | "specific")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">Alle Teilnehmer</TabsTrigger>
                  <TabsTrigger value="specific">Bestimmte Empfänger</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-2">
                  <div className="flex items-center py-2">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Diese E-Mail wird an alle Teilnehmer gesendet ({eventAttendees.length})
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="specific" className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="recipientEmail"
                        placeholder="E-Mail-Adresse eingeben"
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
                      Hinzufügen
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 w-10 p-0">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <div className="p-3 border-b">
                          <h4 className="font-medium">Teilnehmer hinzufügen</h4>
                          <p className="text-xs text-muted-foreground">Aus den Veranstaltungsteilnehmern auswählen</p>
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
                                    Hinzufügen
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Keine Teilnehmer für diese Veranstaltung
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
                        Noch keine Empfänger hinzugefügt
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <Label>Versandzeitpunkt</Label>
              <Tabs defaultValue={scheduleSetting} onValueChange={(value) => setScheduleSetting(value as "now" | "later")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="now">Sofort senden</TabsTrigger>
                  <TabsTrigger value="later">Für später planen</TabsTrigger>
                </TabsList>
                <TabsContent value="now" className="space-y-2">
                  <div className="flex items-center py-2">
                    <span className="text-sm">
                      Die E-Mail wird als Entwurf gespeichert und kann später manuell versendet werden.
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="later" className="space-y-2">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="scheduledDate">Datum und Uhrzeit auswählen</Label>
                    <DateTimePicker24h
                      initialDate={scheduledDate}
                      onDateChange={(date => setScheduledDate(date))}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">E-Mail-Inhalt</Label>
              <div className="border rounded-md">
                {editor && <EmailEditorToolbar editor={editor} />}
                <EditorContent
                  editor={editor}
                  className="prose dark:prose-invert max-w-none p-4 min-h-[300px]"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/organization/events/${eventId}/emails`)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              Als Entwurf speichern
            </Button>
            {scheduleSetting === "now" && (
              <Button
                variant="default"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Jetzt senden
              </Button>
            )}
            {scheduleSetting === "later" && (
              <Button
                variant="default"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Planen
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Dialog zur Vorlagenauswahl */}
      <AlertDialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>E-Mail-Vorlage auswählen</AlertDialogTitle>
            <AlertDialogDescription>
              Wähle eine Vorlage als Ausgangspunkt für deine E-Mail. Veranstaltungsdetails werden automatisch eingefügt, sofern möglich.
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
                    Betreff: <span className="text-foreground">{template.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}