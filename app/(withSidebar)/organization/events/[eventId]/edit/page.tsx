"use client";;
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

// UI Komponenten
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { ArrowLeftIcon, FileText, FunctionSquare, Info, ListTodo, Save, Trash2 } from "lucide-react";

// Eigene Komponenten
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";

import { mockFlows } from "@/lib/data";

// Formular-Schema
import { EventBasicInfoFormData as EventFormData, eventBasicInfoSchema as eventFormSchema } from "@/lib/form-schemas";
import { Flow } from "@/lib/backend/types";
import { useEventDetails } from "@/lib/backend/hooks/events";
import { useSession } from "next-auth/react";
import { AgendaEntry, deleteAgendaEntry, updateAgendaEntry } from "@/lib/backend/agenda";
import LoadingSpinner from "@/components/loading-spinner";
import { useEvents, useUpdateEvent } from "@/lib/backend/hooks/events";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: session } = useSession();
  const { data: event, isLoading } = useEventDetails(session?.user?.organization.id || "", eventId, session?.user?.jwt || "");

  // Lokale State-Variablen
  const [activeTab, setActiveTab] = useState("basic");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaEntry[]>(event?.agenda || []);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>(event?.flows || []);
  const [selectedStatus, setSelectedStatus] = useState(String(event?.metadata.status));

  // Formular initialisieren mit Event-Daten
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.metadata.title,
      description: event?.metadata.description,
      category: event?.metadata.category.toString(),
      location: event?.metadata.location,
      start: new Date(event?.metadata.start || Date.now()),
      end: new Date(event?.metadata.end || Date.now() + 3600_000),
      status: String(event?.metadata.status),
      capacity: event?.metadata.capacity,
      image: event?.metadata.image,
    },
  });

  // Formular-Submit-Handler
  const onSubmit = async (data: EventFormData) => {
    try {

      console.log("Agenda-Punkte:", agendaItems);
      console.log("Ausgewählte Flows:", selectedFlows);

      const deletedEntries = event?.agenda.filter((entry) => !agendaItems.some((item) => item.id === entry.id));
      deletedEntries && Promise.all(deletedEntries?.map((entry) => {
        return deleteAgendaEntry(session?.user?.organization.id || "", event?.metadata.id || "", entry.id, (session?.user?.jwt || ""));
      }))

      const newAddedEntries = agendaItems.filter((entry) => !event?.agenda.some((item) => item.id === entry.id));
      newAddedEntries && Promise.all(newAddedEntries?.map((entry) => {
        return updateAgendaEntry(session?.user?.organization.id || "", event?.metadata.id || "", entry.id, {
          end: entry.end.toString(),
          start: entry.start.toString(),
          title: entry.title,
          description: entry.description,
        }, (session?.user?.jwt || ""));
      }))

      // Aktualisierte Agenda-Einträge: Einträge, die schon existierten
      const updatedEntries = agendaItems.filter((entry) => event?.agenda.some((item) => item.id === entry.id));
      updatedEntries && Promise.all(updatedEntries?.map((entry) => {
        return updateAgendaEntry(session?.user?.organization.id || "", event?.metadata.id || "", entry.id, {
          end: entry.end.toString(),
          start: entry.start.toString(),
          title: entry.title,
          description: entry.description,
        }, (session?.user?.jwt || ""));
      }))

      toast.success("Event erfolgreich aktualisiert");
      router.push(`/organization/events/${eventId}`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Events:", error);
      toast.error("Event konnte nicht aktualisiert werden. Bitte versuche es erneut.");
    }
  };

  // Event löschen Handler
  const handleDeleteEvent = async () => {
    try {
      console.log("Event wird gelöscht:", eventId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Event "${event?.metadata.title}" wurde erfolgreich gelöscht`);
      router.push("/organization/events");
    } catch (error) {
      console.error("Fehler beim Löschen des Events:", error);
      toast.error("Event konnte nicht gelöscht werden. Bitte versuche es erneut.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Event-Daten in State übernehmen, wenn geladen
  useEffect(() => {
    if (event && agendaItems.length === 0 && selectedFlows.length === 0 && selectedStatus.length === 0) {
      setSelectedFlows(event.flows);
      setAgendaItems(event.agenda);
      setSelectedStatus(String(event.metadata.status));
      form.reset({
        title: event.metadata.title,
        description: event.metadata.description,
        category: event.metadata.category.toString(),
        location: event.metadata.location,
        start: new Date(event.metadata.start || Date.now()),
        end: new Date(event.metadata.end || Date.now() + 3600_000),
        status: String(event.metadata.status),
        capacity: event.metadata.capacity,
        image: event.metadata.image,
      });
    }
  }, [event]);

  // Ladeanzeige

  if(isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Render
  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Kopfbereich */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
              <Link href={`/organization/events/${eventId}`}>
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Event bearbeiten</h1>
          </div>
          <p className="text-muted-foreground ml-10">Bearbeite die Details für "{event?.metadata.title}"</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Speichern...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" /> Änderungen speichern
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs für die Event-Bearbeitung */}
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full mx-auto bg-muted">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <Info className="h-4 w-4" />
            <span>Basisdaten</span>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <FileText className="h-4 w-4" />
            <span>Dateien</span>
          </TabsTrigger>
          <TabsTrigger
            value="flows"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <FunctionSquare className="h-4 w-4" />
            <span>Flows</span>
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <ListTodo className="h-4 w-4" />
            <span>Agenda</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Basisdaten */}
        <TabsContent value="basic">
          <EventBasicInfoForm
            form={form}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        {/* Tab: Flows */}
        <TabsContent value="flows">
          <EventFlowsForm
            selectedFlows={selectedFlows}
            availableFlows={mockFlows}
            onFlowsChange={setSelectedFlows}
            onTabChange={setActiveTab}
            eventId={eventId}
          />
        </TabsContent>

        {/* Tab: Agenda */}
        <TabsContent value="agenda">
          <EventAgendaForm
            agendaItems={agendaItems}
            onAgendaItemsChange={setAgendaItems}
            onTabChange={setActiveTab}
            eventId={eventId}
            isFinalStep
            submitLabel="Event speichern"
            isSubmitting={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Bestätigungsdialog für Löschen */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bist du sicher, dass du dieses Event löschen möchtest?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Das Event "{event?.metadata.title}" und alle zugehörigen Daten werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEvent}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Löschen...
                </div>
              ) : (
                "Event löschen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
