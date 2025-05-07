"use client";;
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Icons
import { FileText, FunctionSquare, Info, ListTodo, Save } from "lucide-react";

// Custom components
import { EventBasicInfoForm } from "@/components/org/events/event-basic-info-form";
import { EventFilesForm } from "@/components/org/events/event-files-form";
import { EventFlowsForm } from "@/components/org/events/event-flows-form";
import { EventAgendaForm } from "@/components/org/events/event-agenda-form";

// Types and Data
import { AgendaStep, EmsFile, Flow } from "@/lib/types";
import { mockFiles, mockFlows } from "@/lib/data";

// Form schema
import { EventBasicInfoFormData as EventFormData, eventBasicInfoSchema as eventFormSchema } from "@/lib/form-schemas";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";

export default function CreateEventPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("basic");
    const [selectedFiles, setSelectedFiles] = useState<EmsFile[]>([]);
    const [selectedFlows, setSelectedFlows] = useState<Flow[]>([]);
    const [agendaItems, setAgendaItems] = useState<AgendaStep[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("upcoming");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize the form with default values using our shared schema
    const form = useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            category: "",
            start: new Date(),
            end: new Date(new Date().getTime() + 3600000), // 1 hour later
            capacity: 100,
            image: "",
            status: "upcoming"
        }
    });

    // Handle form submission
    const onSubmit = async (data: EventFormData) => {
        setIsSubmitting(true);

        try {

            // Prepare the event data
            const newEvent = {
                title: data.title,
                description: data.description,
                location: data.location,
                category: data.category,
                capacity: data.capacity,
                image: data.image,
                start: data.start,
                end: data.end,
                status: data.status,
                attendees: 0
            };

            // In a real application, you would send this data to an API
            console.log("Creating new event:", newEvent);
            console.log("Selected files:", selectedFiles);
            console.log("Selected flows:", selectedFlows);
            console.log("Agenda:", agendaItems);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            toast.success("Event erfolgreich erstellt");

            // Redirect to the events page
            router.push("/organization/events");
        } catch (error) {
            console.error("Error creating event:", error);
            toast.error("Failed to create event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const quickActions: QuickAction[] = [
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
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting || !form.formState.isValid}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating...
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Save className="mr-2 h-4 w-4" />
                            Create Event
                        </div>
                    )}
                </Button>
            )
        }

    ];

    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
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
                            onTabChange={setActiveTab}
                            submitLabel="Nächster Schritt: Dateien"
                        />
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files">
                        <EventFilesForm
                            selectedFiles={selectedFiles}
                            availableFiles={mockFiles}
                            onFilesChange={setSelectedFiles}
                            onTabChange={setActiveTab}
                            submitLabel="Nächster Schritt: Flows"
                        />
                    </TabsContent>

                    {/* Flows Tab */}
                    <TabsContent value="flows">
                        <EventFlowsForm
                            selectedFlows={selectedFlows}
                            availableFlows={mockFlows}
                            onFlowsChange={setSelectedFlows}
                            onTabChange={setActiveTab}
                            submitLabel="Nächster Schritt: Agenda"
                        />
                    </TabsContent>

                    {/* Agenda Tab */}
                    <TabsContent value="agenda">
                        <EventAgendaForm
                            agendaItems={agendaItems}
                            onAgendaItemsChange={setAgendaItems}
                            onTabChange={setActiveTab}
                            isFinalStep={true}
                            submitLabel="Event erstellen"
                            isSubmitting={isSubmitting}
                        />
                    </TabsContent>
                </Tabs>

            </div>
        </>
    );
}