"use client";;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// UI-Komponenten & Icons
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Info, ListTodo, Save } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Eigene Formulare & Typen
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";
import { eventBasicInfoSchema, EventBasicInfoFormData } from "@/lib/form-schemas";
import { createEvent, NewEventPayload } from "@/lib/api/postEvents";
import { SiteHeader } from "@/components/site-header";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { AgendaEntry, createAgendaEntry } from "@/lib/backend/agenda";

export default function CreateEventPage() {
  const router = useRouter();

  // Authentifizierungs-Session
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  // Form für grundlegende Informationen
  const basicInfoForm = useForm<EventBasicInfoFormData>({
    resolver: zodResolver(eventBasicInfoSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      start: new Date(),
      end: new Date(Date.now() + 3600_000),
      capacity: 100,
      image: "",
    },
    mode: "onChange", // Validieren bei Änderungen für sofortiges Feedback
  });

  // Lokaler State
  const [activeTab, setActiveTab] = useState<"basic" | "agenda">("basic");
  const [agendaItems, setAgendaItems] = useState<AgendaEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [validationTriggered, setValidationTriggered] = useState(false);

  // Effekt zum Weiterleiten, wenn nicht authentifiziert
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Benutzerinformationen aus der Sitzung abrufen
  const userId = session?.user?.id ?? "";
  const orgId = session?.user?.organization?.id ?? "";
  const token = session?.user?.jwt ?? "";

  // Ladezustand anzeigen, während die Sitzung geladen wird
  if (isLoadingSession) {
    return (
      <Card className="flex items-center justify-center h-[500px]">
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-medium text-muted-foreground">Lade Sitzung...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Wenn nicht authentifiziert, null zurückgeben (leitet weiter)
  if (status === "unauthenticated") {
    return null;
  }

  // Fehler anzeigen, wenn keine Organisation gefunden wurde
  if (!orgId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Zugriffsfehler</AlertTitle>
        <AlertDescription>
          Organisation nicht gefunden. Bitte stellen Sie sicher, dass Sie einer Organisation zugeordnet sind.
        </AlertDescription>
      </Alert>
    );
  }

  // Validierungsfunktion für das gesamte Formular
  const validateForm = () => {
    setValidationTriggered(true);
    const errors: string[] = [];

    // Überprüfen, ob das Basisinformationsformular gültig ist
    const isBasicInfoValid = basicInfoForm.formState.isValid;
    if (!isBasicInfoValid) {
      // Spezifische Feldfehler abrufen
      const fieldErrors = Object.entries(basicInfoForm.formState.errors)
        .map(([field, error]) => `${getFieldLabel(field)}: ${error.message}`);

      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
      } else {
        errors.push("Bitte füllen Sie alle erforderlichen Felder im Tab 'Basis' aus.");
      }
    }

    // Überprüfen, ob Agenda-Elemente vorhanden sind
    if (agendaItems.length === 0) {
      errors.push("Bitte fügen Sie mindestens einen Agenda-Eintrag hinzu.");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  // Hilfsfunktion zum Abrufen von menschenlesbaren Feldbezeichnungen
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      title: 'Titel',
      description: 'Beschreibung',
      category: 'Kategorie',
      capacity: 'Kapazität',
      location: 'Ort',
      start: 'Startdatum',
      end: 'Enddatum',
      image: 'Titelbild'
    };
    return labels[field] || field;
  };

  // Submit-Handler zum Erstellen des Events
  const onSubmit = basicInfoForm.handleSubmit(async (basicData) => {
    // Validiere zuerst das gesamte Formular
    if (!validateForm()) {
      // Wenn es Fehler gibt, zeige sie an und unterbreche den Vorgang
      toast.error(
        <div className="space-y-2">
          <div className="font-medium">Bitte korrigieren Sie folgende Fehler:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );

      // Wechsle zu dem entsprechenden Tab, wenn Fehler vorhanden sind
      if (basicInfoForm.formState.errors && Object.keys(basicInfoForm.formState.errors).length > 0) {
        setActiveTab("basic");
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const payload: NewEventPayload = {
        title: basicData.title,
        description: basicData.description,
        category: basicData.category,
        location: basicData.location,
        capacity: basicData.capacity,
        image:
          (basicData.image ?? "").trim() || "https://example.com/placeholder.jpg",
        status: 0,
        start:
          typeof basicData.start === "string"
            ? basicData.start
            : basicData.start.toISOString(),
        end:
          typeof basicData.end === "string"
            ? basicData.end
            : basicData.end.toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };

      const eventInfo = await createEvent(orgId, payload, token);

      // Zeige Fortschrittsbenachrichtigung an
      toast.success("Event erfolgreich erstellt. Füge Agenda-Einträge hinzu...");

      // Erstelle Agenda-Einträge
      await Promise.all(
        agendaItems.map(async (entry) => {
          return createAgendaEntry(
            orgId,
            eventInfo.id,
            {
              end: entry.end.toISOString(),
              start: entry.start.toISOString(),
              title: entry.title,
              description: entry.description,
            },
            token
          );
        })
      );

      toast.success("Event und Agenda-Einträge erfolgreich erstellt!");
      router.push("/organization/events");
    } catch (err: any) {
      console.error("Fehler beim Erstellen des Events:", err);
      toast.error(err.message || "Fehler beim Erstellen des Events");
      setFormErrors([err.message || "Es ist ein unerwarteter Fehler aufgetreten"]);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Handle moving to the next tab with validation
  const moveToNextTab = async () => {
    if (activeTab === "basic") {
      setValidationTriggered(true);

      // Validierung für Basisinformationen auslösen
      const isValid = await basicInfoForm.trigger();

      if (!isValid) {
        const fieldErrors = Object.entries(basicInfoForm.formState.errors)
          .map(([field, error]) => `${getFieldLabel(field)}: ${error.message}`);

        toast.error(
          <div className="space-y-2">
            <div className="font-medium">Bitte korrigieren Sie folgende Fehler:</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {fieldErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        );
        return;
      }

      // Wenn gültig, zum Agenda-Tab wechseln
      setActiveTab("agenda");
    } else if (activeTab === "agenda") {
      if (agendaItems.length === 0) {
        setValidationTriggered(true);
        toast.error(
          <div className="space-y-2">
            <div className="font-medium">Bitte korrigieren Sie folgende Fehler:</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Agenda: Bitte fügen Sie mindestens einen Agenda-Eintrag hinzu</li>
            </ul>
          </div>
        );
        return;
      }

      // Wenn gültig, das Formular absenden
      onSubmit();
    }
  };

  return (
    <>
      <SiteHeader
        actions={[
          {
            label: "Zurück",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => router.back(),
            variant: "outline",
          },
          {
            children: (
              <Button
                variant="outline"
                onClick={() => router.push("/organization/events")}
              >
                Abbrechen
              </Button>
            ),
          },
          {
            children: (
              <Button
                disabled={isSubmitting} // Nur während der Übermittlung deaktivieren
                onClick={onSubmit}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Wird erstellt...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="mr-2 h-4 w-4" />
                    Event erstellen
                  </span>
                )}
              </Button>
            ),
          },
        ]}
      >
        <BreadcrumbItem>
          <BreadcrumbPage>Event erstellen</BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>

      <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* Anzeigen von Formularfehlern */}
        {validationTriggered && formErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Fehler beim Erstellen des Events</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Fortschrittsanzeige */}
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${activeTab === "basic" ? 50 : 100}%`,
            }}
          ></div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
          defaultValue="basic"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Basis
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <EventBasicInfoForm
              form={basicInfoForm}
              onTabChange={() => setActiveTab("agenda")}
              submitLabel="Weiter: Agenda"
            />
          </TabsContent>

          <TabsContent value="agenda">
            <EventAgendaForm
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onTabChange={() => setActiveTab("basic")}
              isFinalStep
              submitLabel="Event erstellen"
              isSubmitting={isSubmitting}
              eventStart={basicInfoForm.getValues("start")}
              eventEnd={basicInfoForm.getValues("end")}
            />
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between border-t p-6 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (activeTab === "basic") {
                router.push("/organization/events");
              } else {
                setActiveTab("basic");
              }
            }}
          >
            {activeTab === "basic" ? "Abbrechen" : "Zurück"}
          </Button>

          <Button
            onClick={moveToNextTab}
            disabled={isSubmitting} // Nur während der Übermittlung deaktivieren
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Wird erstellt...
              </span>
            ) : activeTab === "basic" ? (
              "Weiter: Agenda"
            ) : (
              "Event erstellen"
            )}
          </Button>
        </CardFooter>
      </div>
    </>
  );
}