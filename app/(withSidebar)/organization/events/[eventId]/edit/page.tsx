"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

// UI Components
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
import { ArrowLeftIcon, FunctionSquare, Info, ListTodo, Save, Trash2 } from "lucide-react";

// Custom components
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";

// Types and Data
import { AgendaStep } from "@/lib/types-old";
import { mockedEventDetails, mockFlows } from "@/lib/data";
import { Flow } from "@/lib/backend/types";
import { EventBasicInfoFormData as EventFormData, eventBasicInfoSchema as eventFormSchema } from "@/lib/form-schemas";

// Hooks
import { useSession } from "next-auth/react";
import { useEvents, useUpdateEvent } from "@/lib/backend/hooks/events";

export default function EditEventPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const orgId = session?.user?.organization?.id || "";
  const token = session?.user?.jwt || "";

  // Fetch all events, use for basic info
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents(orgId, token);
  const eventBasic = eventsData?.find((e) => e.id === eventId);

  // Use mocks for flows and agenda
  const eventMock = mockedEventDetails;

  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaStep[]>(eventMock.agenda);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>(eventMock.flows);

  // Form setup
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {},
  });
  const { reset, setValue } = form;

  // Populate form with real basic data
  useEffect(() => {
    if (eventBasic) {
      const basicValues = {
        title: eventBasic.title,
        description: eventBasic.description,
        category: String(eventBasic.category),
        location: eventBasic.location,
        start: new Date(eventBasic.start),
        end: new Date(eventBasic.end),
        status: String(eventBasic.status),
        capacity: eventBasic.capacity,
        image: eventBasic.image,
      };
      reset(basicValues);
      setValue('category', basicValues.category);
    }
  }, [eventBasic, reset, setValue]);

  // Add onSubmit handler
  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement update logic here
      toast.success("Event updated successfully!");
      // Optionally redirect or update state
    } catch (err: any) {
      toast.error(err.message || "Error updating event");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingEvents) return <div>Loading...</div>;
  if (!eventBasic) return <div>Event not found.</div>;

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization/events">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </div>
            )}
          </Button>
        </div>
      </div>

      
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full mx-auto bg-muted">
            <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Info className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2 data-[state=active]:bg-background">
              <FunctionSquare className="h-4 w-4" />
              <span>Flows</span>
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2 data-[state=active]:bg-background">
              <ListTodo className="h-4 w-4" />
              <span>Agenda</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <EventBasicInfoForm form={form} onTabChange={setActiveTab} />
          </TabsContent>

          {/* Flows Tab (mock) */}
          <TabsContent value="flows">
            <EventFlowsForm
              selectedFlows={selectedFlows}
              availableFlows={mockFlows}
              onFlowsChange={setSelectedFlows}
              onTabChange={setActiveTab}
              eventId={eventId}
            />
          </TabsContent>

          {/* Agenda Tab (mock) */}
          <TabsContent value="agenda">
            <EventAgendaForm
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onTabChange={setActiveTab}
              eventId={eventId}
              isFinalStep
              submitLabel="Save Event"
              isSubmitting={isLoading}
            />
          </TabsContent>
        </Tabs>
      

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{eventBasic.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {/* delete handler */}}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </div>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
