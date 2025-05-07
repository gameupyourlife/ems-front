"use client";;
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FlowForm } from "@/components/org/flows/flow-form";
import { Flow } from "@/lib/types";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";

export default function CreateFlowPage() {
    const router = useRouter();

    // Initialize with a new empty flow template
    const [isCreating, setIsCreating] = useState(true);

    // Create a new empty flow template
    const emptyFlow: Flow = {
        templateId: "1",
        eventId: "event-123", // This would come from the auth context in a real app
        id: "",
        name: "",
        description: "",
        trigger: [],
        actions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "current-user", // This would come from auth in a real app
        updatedBy: "current-user"  // This would come from auth in a real app
    };

    // Function to handle flow creation
    const handleCreateFlow = (flow: Flow) => {
        // In a real app, you would make an API call here

        // Simulate a successful creation
        setIsCreating(false);

        toast.success("Flow created", {
            description: "Your flow has been created successfully and is now ready to use.",
            duration: 3000,
        });

        // Navigate to the flows list after a short delay
        setTimeout(() => {
            router.push('/organization/flows');
        }, 1500);
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