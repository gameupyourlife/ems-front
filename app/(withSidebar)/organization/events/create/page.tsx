"use client";;
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// UI Components & Icons
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FunctionSquare, Info, ListTodo, Save } from "lucide-react";

// Custom Forms & Types
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";
import { mockFlows } from "@/lib/data";
import {
  eventBasicInfoSchema as eventFormSchema,
  EventBasicInfoFormData as EventFormData,
} from "@/lib/form-schemas";
import { createEvent, NewEventPayload } from "@/lib/api/postEvents";
import { Flow } from "@/lib/backend/types";
import { SiteHeader } from "@/components/site-header";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { AgendaEntry, createAgendaEntry } from "@/lib/backend/agenda";

export default function CreateEventPage() {
  const router = useRouter();

  // ─── 1️⃣ Alle Hooks ganz oben aufrufen ─────────────────────────

  // Auth-Session
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  // Form-Hook
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
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
  });

  // Lokaler State
  const [activeTab, setActiveTab] = useState<"basic" | "flows" | "agenda">("basic");
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── 2️⃣ Session-Redirect in useEffect ───────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // ─── 3️⃣ Einmalig Werte aus der Session extrahieren ───────────
  const userId = session?.user?.id ?? "";
  const orgId = session?.user?.organization?.id ?? "";
  const token = session?.user?.jwt ?? "";

  // ─── 4️⃣ Frühe Returns *nach* allen Hook-Aufrufen ──────────────
  if (isLoadingSession) {
    return <div className="py-20 text-center">Lade Session…</div>;
  }
  if (status === "unauthenticated") {
    return null; // wir redirecten ja ohnehin
  }
  if (!orgId) {
    return (
      <div className="py-20 text-center text-red-500">
        Organisation nicht gefunden.
      </div>
    );
  }

  // ─── 5️⃣ onSubmit greift auf die oben definierten Variablen zu ──
  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const payload: NewEventPayload = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        capacity: data.capacity,
        image:
          (data.image ?? "").trim() || "https://example.com/placeholder.jpg",
        status: 0,
        start:
          typeof data.start === "string"
            ? data.start
            : data.start.toISOString(),
        end:
          typeof data.end === "string"
            ? data.end
            : data.end.toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: userId,
      };

      const eventInfo = await createEvent(orgId, payload, token);

      Promise.all(agendaItems.map((entry) => {
        return createAgendaEntry(orgId, eventInfo.id, {
          end: entry.end.toString(),
          start: entry.start.toString(),
          title: entry.title,
          description: entry.description,
        }, token)
      }))

      toast.success("Event erfolgreich erstellt");
      router.push("/organization/events");
    } catch (err: any) {
      console.error("CreateEvent Error:", err);
      toast.error(err.message || "Fehler beim Erstellen des Events");
    } finally {
      setIsSubmitting(false);
    }
  });

  // ─── 6️⃣ JSX ───────────────────────────────────────────────────
  return (

    <>
      <SiteHeader actions={[{
        label: "Zurück",
        icon: <ArrowLeft className=" h-4 w-4" />,
        onClick: () => router.back(),
        variant: "outline"
      },
      {
        children: (
          <Button
            variant="outline"
            onClick={() => router.push("/organization/events")}
          >
            Cancel
          </Button>
        )
      },
      {
        children: (
          <Button
            disabled={isSubmitting || !form.formState.isValid}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Create Event
              </span>
            )}
          </Button>
        )
      }

      ]} >
        <BreadcrumbItem>
          <BreadcrumbPage>
            Erstellen
          </BreadcrumbPage>
        </BreadcrumbItem>
      </SiteHeader>

      <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
          defaultValue="basic"
        >
          <TabsList className="grid grid-cols-3 w-full mx-auto bg-muted">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <FunctionSquare className="h-4 w-4" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <EventBasicInfoForm
              form={form}
              onTabChange={() => setActiveTab("flows")}
              submitLabel="Next: Flows"
            />
          </TabsContent>
          <TabsContent value="flows">
            <EventFlowsForm
              selectedFlows={selectedFlows}
              availableFlows={mockFlows}
              onFlowsChange={setSelectedFlows}
              onTabChange={() => setActiveTab("agenda")}
              submitLabel="Next: Agenda"
            />
          </TabsContent>
          <TabsContent value="agenda">
            <EventAgendaForm
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onTabChange={() => setActiveTab("basic")}
              isFinalStep
              submitLabel="Create Event"
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}