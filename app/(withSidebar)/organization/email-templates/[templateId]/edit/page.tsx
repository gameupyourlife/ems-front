"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Wand, X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emailTemplates } from "@/lib/mock/email-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
}

// Formular-Schema mit Validierung
const formSchema = z.object({
  name: z.string().min(2, "Vorlagenname muss mindestens 2 Zeichen lang sein.").max(100),
  description: z.string().max(200, "Beschreibung darf maximal 200 Zeichen enthalten.").optional(),
  subject: z.string().min(2, "Betreff muss mindestens 2 Zeichen lang sein.").max(150, "Betreff darf maximal 150 Zeichen enthalten."),
  body: z.string().min(10, "E-Mail-Inhalt muss mindestens 10 Zeichen lang sein."),
});

export default function TemplateEditPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const isNewTemplate = templateId === "create";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      body: "<p>Ihr E-Mail-Inhalt hier...</p>"
    },
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        // Neue Vorlage: Standardwerte setzen
        if (isNewTemplate) {
          setTemplate({
            id: "new-template",
            name: "Neue Vorlage",
            description: "Vorlagenbeschreibung eingeben",
            subject: "Ihr Betreff",
            body: "<p>Ihr E-Mail-Inhalt hier...</p>"
          });
          form.reset({
            name: "Neue Vorlage",
            description: "Vorlagenbeschreibung eingeben",
            subject: "Ihr Betreff",
            body: "<p>Ihr E-Mail-Inhalt hier...</p>"
          });
          setIsLoading(false);
          return;
        }

        // Simuliertes Laden (API-Aufruf)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Vorlage aus Mock-Daten suchen
        const foundTemplate = emailTemplates.find(t => t.id === templateId);

        if (!foundTemplate) {
          setError("Vorlage nicht gefunden");
          setTemplate(null);
        } else {
          setTemplate(foundTemplate);
          form.reset({
            name: foundTemplate.name,
            description: foundTemplate.description,
            subject: foundTemplate.subject,
            body: foundTemplate.body
          });
          setError(null);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Vorlage:", err);
        setError("Vorlage konnte nicht geladen werden. Bitte erneut versuchen.");
        setTemplate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, form, isNewTemplate]);

  // Für Vorschau: aktuelle Werte beobachten
  const previewSubject = form.watch("subject");
  const previewBody = form.watch("body");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      // Simuliertes Speichern (API-Aufruf)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Nach dem Speichern zurück zur Übersicht oder Detailseite
      if (isNewTemplate) {
        router.push('/organization/email-templates');
      } else {
        router.push(`/organization/email-templates/${templateId}`);
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Vorlage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;

    setIsGenerating(true);
    try {
      // Simulierte KI-Generierung
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generierter Beispielinhalt
      const generatedSubject = `${aiPrompt.substring(0, 20)}${aiPrompt.length > 20 ? '...' : ''}`;
      const generatedBody = `<h2>Generierte E-Mail für: ${aiPrompt}</h2>
        <p>Dies ist eine KI-generierte E-Mail basierend auf Ihrer Anfrage. Sie können diesen Inhalt anpassen.</p>
        <p>Ihr Prompt war: <strong>${aiPrompt}</strong></p>
        <ul>
          <li>Dies ist ein Beispiel-Punkt</li>
          <li>Sie können den Inhalt anpassen</li>
          <li>Fügen Sie eigene Details hinzu</li>
        </ul>
        <p>Vielen Dank für die Nutzung unseres Services.</p>
        <p><em>Mit freundlichen Grüßen,<br>[Organisation]</em></p>`;

      form.setValue("subject", generatedSubject);
      form.setValue("body", generatedBody);

      setAiGeneratorOpen(false);
      setAiPrompt("");
    } catch (err) {
      console.error("Fehler bei der KI-Generierung:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Platzhalter am Ende des Feldes einfügen
  const insertPlaceholder = (placeholder: string, field: "subject" | "body") => {
    const currentValue = form.getValues(field);
    const newValue = `${currentValue} [${placeholder}]`;
    form.setValue(field, newValue);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !isNewTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vorlage nicht gefunden</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/organization/email-templates">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zu den Vorlagen
          </Link>
        </Button>
      </div>
    );
  }

  const quickActions: QuickAction[] = [
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild >
              <Link href={isNewTemplate ? "/organization/email-templates" : `/organization/email-templates/${templateId}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent >
            <p>Zurück</p>
          </TooltipContent>
        </Tooltip >
      )
    },
    {
      children: (
        <Button
          onClick={() => form.handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Speichern...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </>
          )}
        </Button>
      )
    },
  ]

  return (
    <>
      <SiteHeader actions={quickActions} idName={template?.name} />

      <div className="space-y-6 p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Vorlageninformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vorlagenname</FormLabel>
                        <FormControl>
                          <Input placeholder="Vorlagennamen eingeben" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ein eindeutiger Name für die Vorlage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Kurze Beschreibung dieser Vorlage"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Beschreiben Sie, wofür diese Vorlage verwendet wird
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">E-Mail-Inhalt</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="px-6">
                      <TabsList className="grid grid-cols-2 mb-6 w-[200px]">
                        <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
                        <TabsTrigger value="code">HTML</TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="space-y-1 mb-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-Mail-Betreff</FormLabel>
                              <FormControl>
                                <Input placeholder="E-Mail-Betreff eingeben" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 my-3">
                        <div className="text-sm text-muted-foreground">Platzhalter einfügen:</div>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertPlaceholder("Veranstaltungsname", "subject")}
                          >
                            [Veranstaltungsname]
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertPlaceholder("Teilnehmername", "subject")}
                          >
                            [Teilnehmername]
                          </Button>
                        </div>
                      </div>

                      <TabsContent value="edit" className="mt-4">
                        <FormField
                          control={form.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-Mail-Inhalt</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="E-Mail-Inhalt eingeben (HTML unterstützt)"
                                  className="min-h-[300px] font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2 mt-4 mb-2">
                          <div className="text-sm text-muted-foreground">Platzhalter einfügen:</div>
                          <div className="flex flex-wrap gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertPlaceholder("Veranstaltungsname", "body")}
                            >
                              [Veranstaltungsname]
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertPlaceholder("Teilnehmername", "body")}
                            >
                              [Teilnehmername]
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertPlaceholder("Veranstaltungsdatum", "body")}
                            >
                              [Veranstaltungsdatum]
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertPlaceholder("Organisation", "body")}
                            >
                              [Organisation]
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-6">
                          Verwenden Sie HTML-Tags für die Formatierung. Platzhalter werden beim Versand durch echte Inhalte ersetzt.
                        </p>
                      </TabsContent>

                      <TabsContent value="code" className="mt-4">
                        <FormField
                          control={form.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HTML-Quelltext</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="HTML-Code eingeben"
                                  className="min-h-[300px] font-mono bg-black text-green-400 dark:bg-black"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-sm text-muted-foreground mt-4">
                          Bearbeiten Sie den HTML-Quelltext direkt. Achten Sie auf die Syntax, um Darstellungsfehler zu vermeiden.
                        </p>
                      </TabsContent>

                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>

        {/* Vorschau-Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Vorlagen-Vorschau</DialogTitle>
              <DialogDescription>
                So sieht Ihre E-Mail beim Versand aus
              </DialogDescription>
            </DialogHeader>

            <div className="border-t -mx-6 px-6 pt-6 flex-1 overflow-hidden">
              <div className="space-y-6 flex-1 overflow-auto">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Betreff:</div>
                  <div className="border rounded-md p-3 bg-muted text-sm">
                    {previewSubject || "Kein Betreff angegeben"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">E-Mail-Inhalt:</div>
                  <div className="border rounded-md overflow-auto flex-1">
                    <div className="p-5 bg-card">
                      {previewBody ? (
                        <div
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewBody }}
                        />
                      ) : (
                        <p className="text-muted-foreground">Kein Inhalt angegeben</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t -mx-6 px-6 pt-4">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Vorschau schließen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* KI-Generator-Dialog */}
        <Dialog open={aiGeneratorOpen} onOpenChange={setAiGeneratorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>KI-E-Mail-Generator</DialogTitle>
              <DialogDescription>
                Beschreiben Sie, welche Art von E-Mail Sie erstellen möchten. Die KI generiert einen Vorschlag.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="aiPrompt" className="text-sm font-medium">
                  Welche E-Mail möchten Sie erstellen?
                </label>
                <textarea
                  id="aiPrompt"
                  className="w-full p-2 h-32 border rounded-md resize-none"
                  placeholder="z.B. Willkommensmail für neue Konferenzteilnehmer mit Infos zum Ablauf"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAiGeneratorOpen(false)} disabled={isGenerating}>
                Abbrechen
              </Button>
              <Button
                onClick={handleAiGenerate}
                disabled={!aiPrompt || isGenerating}
                className="ml-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Generiere...
                  </>
                ) : (
                  <>
                    <Wand className="mr-2 h-4 w-4" />
                    Inhalt generieren
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}