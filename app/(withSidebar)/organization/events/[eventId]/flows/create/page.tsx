"use client";;
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowForm } from "@/components/org/flows/flow-form";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { Flow } from "@/lib/backend/types";
import { useSession } from "next-auth/react";
import { createOrgFlowTemplate, createOrgFlowTemplateAction, createOrgFlowTemplateTrigger } from "@/lib/backend/org-flows";

export default function CreateFlowPage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Initialize with a new empty flow template
    const [isCreating, setIsCreating] = useState(true);

    // Create a new empty flow template
    const emptyFlow: Flow = {
        id: "",
        name: "",
        description: "",
        triggers: [],
        actions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: session?.user?.id || "Unbekannt",
        updatedBy: session?.user?.id || "Unbekannt",
        existInDb: false,
        isTemplate: true,

        isActive: false,
        multipleRuns: false,
        stillPending: false,
    };

    // Function to handle flow creation
    const handleCreateFlow = async (flow: Flow) => {
        // In a real app, you would make an API call here

        try {
            const createdFlow = await createOrgFlowTemplate(
                session?.user?.organization?.id || "",
                {
                    createdBy: flow.createdBy,
                    description: flow.description || "",
                    name: flow.name,
                    createdAt: flow.createdAt,
                    updatedAt: flow.updatedAt,
                    updatedBy: flow.updatedBy,
                    organizationId: session?.user?.organization?.id || "",
                },
                session?.user?.jwt || "",
            )

            // Create all triggers concurrently
            const createdTriggers = Promise.all(
                (flow.triggers || []).map(trigger => 
                    createOrgFlowTemplateTrigger(
                        session?.user?.organization?.id || "",
                        createdFlow.id,
                        {
                            flowId: createdFlow.id,
                            type: trigger.type,
                            details: trigger.details,
                            name: trigger.name || "No name",
                            summary: trigger.description || "No description",
                        },
                        session?.user?.jwt || ""
                    )
                )
            );

            // Create all actions concurrently
            const createdActions = Promise.all(
                (flow.actions || []).map(action =>
                    createOrgFlowTemplateAction(
                        session?.user?.organization?.id || "",
                        createdFlow.id,
                        {
                            flowId: createdFlow.id,
                            type: action.type,
                            details: action.details,
                            name: action.name || "No name",
                            summary: action.description || "No description",
                        },
                        session?.user?.jwt || ""
                    )
                )
            );

            await Promise.all([createdTriggers, createdActions])

            toast.success("Flow created", {
                description: "Your flow has been created successfully and is now ready to use.",
                duration: 3000,
            });

            // Navigate to the flows list after a short delay
            setTimeout(() => {
                router.push('/organization/flows');
            }, 1500);

        } catch (error) {
            toast.error("Flow creation failed", {
                description: "There was an error creating your flow. Please try again.",
                duration: 3000,
            });

        } finally {
            setIsCreating(false);
        }
    };

    const quickActions: QuickAction[] = [
        {
            label: "Zurück",
            onClick: () => router.push(`/organization/edit`),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: "outline",
        },
        {
            label: "Flow Template speichern",
            onClick: () => router.push(`/organization/events/create`),
            icon: <SaveIcon className="h-4 w-4" />,
        },
    ];

    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">

                {/* Flow Form */}
                <FlowForm
                    flow={emptyFlow}
                    isEditing={true}
                    onSave={handleCreateFlow}
                    isCreating={true}
                />
            </div>
        </>

    );
}