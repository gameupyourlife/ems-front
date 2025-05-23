"use client";;
// React-Importe und externe Bibliotheken
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Mail,
  Calendar,
  FileText,
  Code,
  Settings,
  Edit,
  Copy,
  Trash,
  Eye,
  User,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { emailTemplates } from "@/lib/mock/email-data";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmationButton } from "@/components/ui/confirmation-button";

//#region Interfaces und Typen
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
  usageCount?: number;
}
//#endregion

export default function TemplateDetailPage() {
  //#region State und Routing
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  //#endregion

  //#region Template laden (Simuliert API-Aufruf)
  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        // In einer echten App wäre dies ein API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 500));

        // Suche das Template in den Mockdaten
        const foundTemplate = emailTemplates.find(t => t.id === templateId);

        if (!foundTemplate) {
          setError("Template nicht gefunden");
          setTemplate(null);
        } else {
          // Template mit zusätzlichen Eigenschaften erweitern
          setTemplate({
            ...foundTemplate,
            isOrgTemplate: true,
            createdAt: new Date("2023-09-15"),
            updatedAt: new Date("2023-10-01"),
            createdBy: "Administrator",
            updatedBy: "Jane Smith",
            usageCount: Math.floor(Math.random() * 25) + 1 // Zufällige Nutzungszahl zur Demonstration
          });
          setError(null);
        }
      } catch (err) {
        console.error("Fehler beim Laden des Templates:", err);
        setError("Fehler beim Laden des Templates. Bitte versuche es erneut.");
        setTemplate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);
  //#endregion

  //#region Platzhalter extrahieren
  // Extrahiert Platzhalter aus Betreff und Body
  const extractPlaceholders = () => {
    if (!template) return [];

    const combinedText = template.subject + template.body;
    const regex = /\[([^\]]+)\]/g;
    const matches = combinedText.match(regex);

    if (!matches) return [];

    // Duplikate und Klammern entfernen
    return [...new Set(matches)].map(item => item.replace(/[\[\]]/g, ''));
  };

  const placeholders = extractPlaceholders();
  //#endregion

  //#region Handler für Aktionen
  // Template löschen
  const handleDeleteTemplate = async () => {
    try {
      // In einer echten App wäre dies ein DELETE-Request
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/organization/email-templates');
    } catch (err) {
      console.error("Fehler beim Löschen des Templates:", err);
      // Fehlerbenachrichtigung anzeigen
    }
  };

  // Template duplizieren
  const handleDuplicateTemplate = async () => {
    try {
      // In einer echten App wäre dies ein POST-Request
      await new Promise(resolve => setTimeout(resolve, 800));
      const newTemplateId = `copy-${templateId}`;
      router.push(`/organization/email-templates/${newTemplateId}`);
    } catch (err) {
      console.error("Fehler beim Duplizieren des Templates:", err);
      // Fehlerbenachrichtigung anzeigen
    }
  };

  // Test-E-Mail versenden
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return;

    setIsSendingTestEmail(true);
    try {
      // In einer echten App wäre dies ein POST-Request
      await new Promise(resolve => setTimeout(resolve, 1500));

      setTestEmailSent(true);
      // Nach 3 Sekunden zurücksetzen
      setTimeout(() => {
        setIsTestEmailDialogOpen(false);
        setTestEmailSent(false);
        setTestEmailAddress("");
      }, 3000);
    } catch (err) {
      console.error("Fehler beim Versenden der Test-E-Mail:", err);
      // Fehlerbenachrichtigung anzeigen
    } finally {
      setIsSendingTestEmail(false);
    }
  };
  //#endregion

  //#region Lade- und Fehlerzustände
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Template nicht gefunden</h2>
        <p className="text-muted-foreground mb-6">{error || "Das angeforderte Template konnte nicht gefunden werden."}</p>
        <Button variant="outline" asChild>
          <Link href="/organization/email-templates">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Zurück zu den Templates
          </Link>
        </Button>
      </div>
    );
  }
  //#endregion

  //#region Quick Actions für die Kopfzeile
  const quickActions: QuickAction[] = [
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild >
              <Link href="/organization/email-templates">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent >
            <p>Zurück</p>
          </TooltipContent>
        </Tooltip >
      ),
    },
    {
      children: (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleDuplicateTemplate}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mail-Template duplizieren</p>
          </TooltipContent>
        </Tooltip >
      ),
    },
    {
      children: (
        <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Testmail versenden
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test-E-Mail versenden</DialogTitle>
              <DialogDescription>
                Sende eine Test-E-Mail mit dieser Vorlage, um die Darstellung zu überprüfen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="testEmail" className="text-sm font-medium">
                  Empfänger-E-Mail
                </label>
                <input
                  id="testEmail"
                  type="email"
                  placeholder="email@beispiel.de"
                  className="w-full p-2 border rounded-md"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  disabled={isSendingTestEmail || testEmailSent}
                />
              </div>
            </div>
            <DialogFooter>
              {testEmailSent ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Test-E-Mail erfolgreich versendet!
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsTestEmailDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={!testEmailAddress || isSendingTestEmail}
                    className="ml-2"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <div className="h-4 w-4 border-2 !border-t-transparent dark:border-black border-white rounded-full animate-spin mr-2"></div>
                        Senden...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Versenden
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      children: (
        <Button variant="outline" asChild>
          <Link href={`/organization/email-templates/${templateId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>
      ),
    },
    {
      children: (
        <ConfirmationButton confirmText="Löschen" confirmTitle="Template löschen?" confirmDescription="Bist du sicher, dass du das Template löschen möchtest? Diese Handlung kann nicht rückgängig gemacht werden." onConfirm={handleDeleteTemplate}
          variant="destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Löschen
        </ConfirmationButton>
      ),
    },
  ];
  //#endregion

  //#region Haupt-Renderbereich
  return <>
    <SiteHeader actions={quickActions} >
      <BreadcrumbItem>
        <BreadcrumbPage>
          {template.name}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </SiteHeader>

    <div className="space-y-6 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Organisations-Template
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="preview" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Vorschau
                    </TabsTrigger>
                    <TabsTrigger value="placeholders" className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Platzhalter
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="usage" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Nutzung
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="preview" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Betreff:</div>
                      <div className="border rounded-md p-3 bg-muted text-sm">
                        {template.subject}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">E-Mail-Inhalt:</div>
                      <div className="border rounded-md overflow-auto">
                        <div className="p-5 bg-card">
                          <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: template.body }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="placeholders" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Platzhalter im Template</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Platzhalter werden beim Versand der E-Mail durch echte Inhalte ersetzt.
                      </p>
                    </div>

                    {placeholders.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {placeholders.map((placeholder, index) => (
                          <div key={index} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <Tag className="h-5 w-5" />
                              </div>
                              <div>
                                <h6 className="font-medium">[{placeholder}]</h6>
                                <p className="text-sm text-muted-foreground">
                                  {placeholder === "Event Name" && "Der Name der Veranstaltung"}
                                  {placeholder === "Event Date" && "Das Datum der Veranstaltung"}
                                  {placeholder === "Attendee Name" && "Name des Teilnehmers"}
                                  {placeholder === "Organization" && "Name deiner Organisation"}
                                  {!["Event Name", "Event Date", "Attendee Name", "Organization"].includes(placeholder) && "Dynamischer Inhalt"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="dark:bg-blue-950 dark:text-blue-300 bg-blue-50 text-blue-800">
                              Dynamischer Inhalt
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border rounded-md p-6 text-center bg-muted">
                        <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Keine Platzhalter im Template gefunden</p>
                      </div>
                    )}

                    <div className="dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200 bg-amber-50 border border-amber-200 rounded-md p-4">
                      <h4 className="text-sm font-medium dark:text-amber-200 text-amber-800 mb-2">Verfügbare Platzhalter</h4>
                      <p className="text-sm mb-3">Diese Standard-Platzhalter können in jedem Template verwendet werden:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Tag className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Event Name]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Event Date]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Attendee Name]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Email Address]</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">[Organization]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="border-t pt-6 px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">HTML-Quellcode</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Der zugrundeliegende HTML-Code dieser E-Mail-Vorlage.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Betreff:</div>
                        <div className="border rounded-md p-3 bg-black text-green-400 font-mono text-sm">
                          {template.subject}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Body:</div>
                        <div className="border rounded-md bg-black text-green-400 p-4 overflow-auto max-h-[500px]">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {template.body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="usage" className="border-t pt-6 px-6 pb-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Template-Nutzung</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Wie dieses Template in deiner Organisation verwendet wird.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Gesamtnutzung</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{template.usageCount}</div>
                          <p className="text-xs text-muted-foreground mt-1">So oft wurde dieses Template verwendet</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Verwendet in Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{Math.ceil((template.usageCount ?? 0) / 3)}</div>
                          <p className="text-xs text-muted-foreground mt-1">Events, die dieses Template nutzen</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="py-4">
                          <CardTitle className="text-sm font-medium">Zuletzt verwendet</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-base font-bold">{format(new Date(), "d. MMM yyyy")}</div>
                          <p className="text-xs text-muted-foreground mt-1">Für Herbstkonferenz</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-8">
                      <h4 className="font-medium mb-3">Letzte E-Mails mit diesem Template</h4>
                      <div className="border rounded-md divide-y">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div>
                                <h6 className="font-medium">{
                                  i === 1 ? "Event-Erinnerung" :
                                    i === 2 ? "Willkommen zur Konferenz" :
                                      "Danke für die Teilnahme"
                                }</h6>
                                <p className="text-xs text-muted-foreground">
                                  Gesendet an {i * 5} Empfänger • {
                                    i === 1 ? "vor 2 Tagen" :
                                      i === 2 ? "vor 1 Woche" :
                                        "vor 2 Wochen"
                                  }
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              i === 1 ? "default" :
                                i === 2 ? "secondary" :
                                  "outline"
                            }>
                              {
                                i === 1 ? "Herbstkonferenz" :
                                  i === 2 ? "Tech Summit" :
                                    "Produktlaunch"
                              }
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg">So verwendest du dieses Template</h3>
                <p className="text-muted-foreground mt-1 text-sm">Es gibt verschiedene Möglichkeiten, diese E-Mail-Vorlage zu nutzen:</p>
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => setIsTestEmailDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Test-E-Mail senden
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Für Event-Kommunikation nutzen</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese Vorlage kann für E-Mails an Event-Teilnehmende verwendet werden.
                    Gehe auf eine Event-Seite und wähle diese Vorlage im Tab "Kommunikation" aus.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Event-spezifische Version erstellen</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Du kannst diese Vorlage für ein bestimmtes Event duplizieren und individuell anpassen.
                    Gehe zum Tab "Templates" eines Events und wähle "Von Organisation duplizieren".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-300">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">In Automatisierungen verwenden</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese Vorlage kann in Automatisierungs-Workflows für E-Mail-Aktionen ausgewählt werden,
                    um E-Mails automatisch basierend auf Auslösern zu versenden.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Template-ID</div>
                <div className="font-mono text-sm">{template.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Erstellt von</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template.createdBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Zuletzt bearbeitet von</div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{template.updatedBy}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Erstellungsdatum</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template.createdAt!), "d. MMMM yyyy")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Zuletzt aktualisiert</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{format(new Date(template.updatedAt!), "d. MMMM yyyy")}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Verwendet in</div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{template.usageCount} E-Mails</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Typ</div>
                <div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Organisations-Template
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Template-Nutzung</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">Erinnerungen</Badge>
                  <Badge variant="outline">Benachrichtigungen</Badge>
                  <Badge variant="outline">Bestätigungen</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/organization/email-templates/${templateId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Template bearbeiten
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleDuplicateTemplate}>
                <Copy className="mr-2 h-4 w-4" />
                Template duplizieren
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={() => setIsTestEmailDialogOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Test-E-Mail senden
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Template löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </>;
  //#endregion
}