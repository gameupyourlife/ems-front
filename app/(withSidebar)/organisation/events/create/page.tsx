"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Icons
import { ArrowLeftIcon, FileText, FunctionSquare, Info, ListTodo, Save } from "lucide-react";
// Custom forms
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFilesForm } from "@/components/org/events/event-files-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";

// Types and Data
import { mockFiles, mockFlows } from "@/lib/data";
import { type EmsFile, type Flow, type AgendaStep, EventStatus } from "@/lib/types";
import { eventBasicInfoSchema as eventFormSchema, EventBasicInfoFormData as EventFormData } from "@/lib/form-schemas";
import { createEvent, NewEventPayload } from "@/lib/api/postEvents";
import { start } from "repl";

interface CreateEventPageProps { orgId?: string; }
export default function CreateEventPage({ orgId = "a8911a6b-942d-42e4-9b08-fcedacfa1f9c" }: CreateEventPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedFiles, setSelectedFiles] = useState<EmsFile[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
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

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Datum-Strings erzeugen
      const startStr = typeof data.start === "string" ? data.start : data.start.toISOString();
      const endStr   = typeof data.end   === "string" ? data.end   : data.end.toISOString();
      const now = new Date().toISOString();
      const userId = "7e0e928c-d6f3-452b-91c3-058605e226a7";
      const orgId = "a8911a6b-942d-42e4-9b08-fcedacfa1f9c";

  // Payload bauen
  // HIER: die Zahl 0 statt eines Strings
const payload: NewEventPayload = {
  title:       data.title,
  description: data.description,
  category:    data.category,
  location:    data.location,
  capacity:    data.capacity,
  image:       (data.image ?? "").trim() !== "" 
                 ? data.image ?? "" 
                 : "https://example.com/placeholder.jpg",
  status:      0,
  start:       startStr,
  end:         endStr,
  createdAt:   now,
  createdBy:   userId,
};
      await createEvent(orgId, payload);
      toast.success("Event erfolgreich erstellt");
      router.push("/organisation/events");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
            <Link href="/organisation/events"><ArrowLeftIcon className="h-4 w-4"/></Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Event</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/organisation/events")}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || !form.formState.isValid}>
            {isSubmitting
              ? <span className="flex items-center"><span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"/>Creating...</span>
              : <span className="flex items-center"><Save className="mr-2 h-4 w-4"/>Create Event</span>
            }
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full mx-auto bg-muted">
          <TabsTrigger value="basic" className="flex items-center gap-2"><Info className="h-4 w-4"/><span>Basic Info</span></TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2"><FileText className="h-4 w-4"/><span>Files</span></TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2"><FunctionSquare className="h-4 w-4"/><span>Flows</span></TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2"><ListTodo className="h-4 w-4"/><span>Agenda</span></TabsTrigger>
        </TabsList>
        <TabsContent value="basic"><EventBasicInfoForm form={form} onTabChange={setActiveTab} submitLabel="Next: Files"/></TabsContent>
        <TabsContent value="files"><EventFilesForm selectedFiles={selectedFiles} availableFiles={mockFiles} onFilesChange={setSelectedFiles} onTabChange={setActiveTab} submitLabel="Next: Flows"/></TabsContent>
        <TabsContent value="flows"><EventFlowsForm selectedFlows={selectedFlows} availableFlows={mockFlows} onFlowsChange={setSelectedFlows} onTabChange={setActiveTab} submitLabel="Next: Agenda"/></TabsContent>
        <TabsContent value="agenda"><EventAgendaForm agendaItems={agendaItems} onAgendaItemsChange={setAgendaItems} onTabChange={setActiveTab} isFinalStep submitLabel="Create Event" isSubmitting={isSubmitting} /></TabsContent>
      </Tabs>
    </div>
  );
}
