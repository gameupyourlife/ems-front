"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// React Hook Form-Importe
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Editor-Komponenten-Importe
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { SiteHeader } from "../site-header";
import { QuickAction } from "../dynamic-quick-actions";

// Typdefinition für das Template
export interface EmailTemplateFormData {
  id?: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  isUserCreated?: boolean;
}

// Validierungsschema für das Formular
const templateFormSchema = z.object({
  name: z.string().trim().min(1, "Vorlagenname ist erforderlich"),
  subject: z.string().trim().min(1, "Betreff ist erforderlich"),
  description: z.string().trim().min(1, "Beschreibung ist erforderlich"),
  body: z.string().min(1, "E-Mail-Inhalt ist erforderlich").refine(val => val !== '<p></p>', "E-Mail-Inhalt ist erforderlich"),
});

type FormData = z.infer<typeof templateFormSchema>;

// Editor-Toolbar-Komponente – wiederverwendet aus email-form.tsx
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

// Komponente für Platzhalter-Hilfe
function PlaceholderHelp() {
  return (
    <div className="bg-muted/30 rounded-md p-4 text-sm space-y-3">
      <h4 className="font-medium">Verfügbare Platzhalter</h4>
      <p>Nutze diese Platzhalter, um Veranstaltungsdetails automatisch einzufügen:</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <code className="bg-muted rounded px-1">[Event Name]</code> – Veranstaltungstitel
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Event Date]</code> – Veranstaltungsdatum
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Start Time]</code> – Beginn
        </div>
        <div>
          <code className="bg-muted rounded px-1">[End Time]</code> – Ende
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Venue Name]</code> – Veranstaltungsort
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Room/Area]</code> – Raum oder Bereich
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Venue Address]</code> – Adresse des Veranstaltungsorts
        </div>
        <div>
          <code className="bg-muted rounded px-1">[Code]</code> – Veranstaltungs-Code
        </div>
      </div>
    </div>
  );
}

// Props-Interface für das Formular
interface EmailTemplateFormProps {
  template?: EmailTemplateFormData;
  onSave: (templateData: EmailTemplateFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function EmailTemplateForm({
  template,
  onSave,
  isSubmitting = false,
}: EmailTemplateFormProps) {
  const router = useRouter();
  const isEditing = !!template;
  
  // Initialisierung von React Hook Form
  const { 
    control, 
    handleSubmit: hookFormSubmit, 
    formState: { errors },
    setValue,
    watch 
  } = useForm<FormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: template?.name || "",
      subject: template?.subject || "",
      description: template?.description || "",
      body: template?.body || "",
    }
  });
  
  const bodyValue = watch("body");

  // Editor für den E-Mail-Inhalt
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Placeholder.configure({
        placeholder: 'Schreibe hier den Inhalt deiner E-Mail-Vorlage...',
      }),
    ],
    content: template?.body || "",
    onUpdate: ({ editor }) => {
      setValue("body", editor.getHTML(), { shouldValidate: true });
    }
  });

  // Handler für das Absenden des Formulars
  const onSubmit = async (data: FormData) => {
    // Vorlagendaten vorbereiten
    const templateData: EmailTemplateFormData = {
      id: template?.id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      description: data.description,
      isUserCreated: true,
    };

    try {
      await onSave(templateData);
      router.push('/organization/email-templates');
    } catch (error) {
      console.error("Fehler beim Speichern der Vorlage:", error);
      alert("Vorlage konnte nicht gespeichert werden. Bitte versuche es erneut.");
    }
  };

  const quickActions: QuickAction[] = [
    {
      label: "Zurück",
      onClick: () => router.push(`/organization/edit`),
      icon: <ArrowLeft className="h-4 w-4" />,
      variant: "outline",
    },
    {
      label: "Mail-Vorlage speichern",
      onClick: hookFormSubmit((data) => onSubmit(data)),
      icon: <Save className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <SiteHeader actions={quickActions} />
      <div className="space-y-6 p-4 md:p-6">

        <Card className="w-full">
          <form onSubmit={hookFormSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {isEditing ? "E-Mail-Vorlage bearbeiten" : "E-Mail-Vorlage erstellen"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Bearbeite die Details und den Inhalt der Vorlage"
                  : "Erstelle eine neue, wiederverwendbare E-Mail-Vorlage für deine Veranstaltungen"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
                    Vorlagenname *
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="name"
                        placeholder="Gib einen Namen für die Vorlage ein"
                        className={errors.name ? "border-red-500" : ""}
                        {...field}
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
                    Beschreibung *
                  </Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="description"
                        placeholder="Beschreibe kurz den Zweck dieser Vorlage"
                        rows={2}
                        className={errors.description ? "border-red-500" : ""}
                        {...field}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject" className={errors.subject ? "text-red-500" : ""}>
                    E-Mail-Betreff *
                  </Label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="subject"
                        placeholder="Gib den E-Mail-Betreff mit Platzhaltern wie [Event Name] ein"
                        className={errors.subject ? "border-red-500" : ""}
                        {...field}
                      />
                    )}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                <PlaceholderHelp />

                <div className="grid gap-2">
                  <Label htmlFor="body" className={errors.body ? "text-red-500" : ""}>
                    E-Mail-Inhalt *
                  </Label>
                  <div className={`border rounded-md ${errors.body ? "border-red-500" : ""}`}>
                    {editor && <EmailEditorToolbar editor={editor} />}
                    <EditorContent
                      editor={editor}
                      className="prose dark:prose-invert max-w-none p-4 min-h-[300px]"
                    />
                  </div>
                  {errors.body && (
                    <p className="text-xs text-red-500">{errors.body.message}</p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/organization/email-templates')}
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent rounded-full" />
                    {isEditing ? "Wird aktualisiert..." : "Wird erstellt..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Vorlage aktualisieren" : "Vorlage speichern"}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}