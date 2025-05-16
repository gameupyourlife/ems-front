"use client";;
import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import {
  ArrowLeftIcon,
  FileText,
  FunctionSquare,
  Info,
  ListTodo,
  Save,
  Trash2,
} from "lucide-react";

// Custom components
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";

// Types and Data
import { AgendaStep, EmsFile, Flow } from "@/lib/types";
import { mockedEventDetails, mockFiles, mockFlows } from "@/lib/data";

// Form schema
import { EventBasicInfoFormData as EventFormData, eventBasicInfoSchema as eventFormSchema } from "@/lib/form-schemas";


export default function EditEventPage() {
  
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  // redirect(`/organization/events/${eventId}?tab=basic`);
  
  // In a real app, you would fetch the event details by ID
  const eventDetails = mockedEventDetails;
  const event = eventDetails.metadata;
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaStep[]>(eventDetails.agenda);
  const [selectedFiles, setSelectedFiles] = useState<EmsFile[]>(eventDetails.files);
  const [selectedFlows, setSelectedFlows] = useState<Flow[]>(eventDetails.flows);
  const [selectedStatus, setSelectedStatus] = useState(String(event.status));
  
  // Initialize form with event data using our shared schema
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      category: event.category.toString(),
      location: event.location,
      start: new Date(event.start),
      end: new Date(event.end),
      status: String(event.status),
      capacity: event.capacity,
      image: event.image,
    },
  });
  
  // Form submission handler
  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    
    try {
      // Combine date and time fields
      
      // In a real app, you would call an API to update the event

      console.log("Agenda items:", agendaItems);
      console.log("Selected files:", selectedFiles);
      console.log("Selected flows:", selectedFlows);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Event updated successfully");
      router.push(`/organization/events/${eventId}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete event
  const handleDeleteEvent = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, you would call an API to delete the event
      console.log("Deleting event:", eventId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Event "${event.title}" deleted successfully`);
      router.push("/organization/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // // Handle status change
  // const onStatusChange = (status: string) => {
  //   setSelectedStatus(status);
  //   form.setValue("status", status, { shouldValidate: true });
  // };
  
  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Header with back button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 mr-1">
              <Link href={`/organization/events/${eventId}`}>
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Edit Event</h1>
          </div>
          <p className="text-muted-foreground ml-10">Update the details for "{event.title}"</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full mx-auto bg-muted">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <Info className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <FileText className="h-4 w-4" />
              <span>Files</span>
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

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            {/* ToDo: Fix the issues here with the form */}
            <EventBasicInfoForm 
              form={form}
               
            />
          </TabsContent>
          
          {/* Flows Tab */}
          <TabsContent value="flows">
            <EventFlowsForm 
              selectedFlows={selectedFlows} 
              availableFlows={mockFlows}
              onFlowsChange={setSelectedFlows}
              onTabChange={setActiveTab}
              eventId={eventId}
            />
          </TabsContent>
          
          {/* Agenda Tab */}
          <TabsContent value="agenda">
            <EventAgendaForm 
              agendaItems={agendaItems} 
              onAgendaItemsChange={setAgendaItems}
              onTabChange={setActiveTab}
              eventId={eventId}
              isFinalStep={true}
              submitLabel="Save Event"
              isSubmitting={isLoading}
            />
          </TabsContent>
        </Tabs>
      </form>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{event.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteEvent}
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