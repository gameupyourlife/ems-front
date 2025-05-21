"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

// UI Components & Icons
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, FunctionSquare, Info, ListTodo, Save } from "lucide-react";

// Custom Forms & Types
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";
import { mockFlows } from "@/lib/data";
import type { Flow, AgendaStep } from "@/lib/types-old";
import {
  eventBasicInfoSchema as eventFormSchema,
  EventBasicInfoFormData as EventFormData,
} from "@/lib/form-schemas";
import { createEvent, NewEventPayload } from "@/lib/api/postEvents";

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
  const [agendaItems, setAgendaItems] = useState<AgendaStep[]>([]);
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

      await createEvent(orgId, payload, token);
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
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/organization/events">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Event</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/organization/events")}
          >
            Cancel
          </Button>
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
        </div>
      </div>

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
  );
}