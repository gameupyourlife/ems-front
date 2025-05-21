"use client";;
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlayCircle, Trash, Copy, Save, HistoryIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FlowForm } from "@/components/org/flows/flow-form";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { ConfirmationButton } from "@/components/ui/confirmation-button";
import { useOrgFlowTemplate } from "@/lib/backend/hooks/org-flows";
import { useSession } from "next-auth/react";
import { Flow } from "@/lib/backend/types";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import { createOrgFlowTemplateAction, createOrgFlowTemplateTrigger, deleteOrgFlowTemplate, updateOrgFlowTemplate, updateOrgFlowTemplateAction, updateOrgFlowTemplateTrigger } from "@/lib/backend/org-flows";
import { useQueryClient } from "@tanstack/react-query";
import { deleteFlow } from "@/lib/backend/event-flows";

export default function FlowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Get the flow ID from the URL parameters
    const flowId = Array.isArray(params.flowId) ? params.flowId[0] : params.flowId as string;

    // Find the flow in the mock data
    const { data: flow, isLoading, error } = useOrgFlowTemplate(session?.user?.organization?.id || "", flowId, session?.user?.jwt || "");

    // State for editable flow data and editing mode
    const [isEditing, setIsEditing] = useState(false);

    console.log("error", error);

    // If flow not found, handle gracefully
    if (!flow && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Flow Not Found</h1>
                <p className="text-muted-foreground mb-6">The flow you are looking for does not exist.</p>
                <Button asChild>
                    <Link href={`/organization/flows`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Flows
                    </Link>
                </Button>
            </div>
        );
    }

    // Function to handle saving changes
    const handleSave = async (updatedFlow: Flow) => {
        try {
            if (updatedFlow.isTemplate) {
                const metadataPromise = updateOrgFlowTemplate(
                    session?.user?.organization?.id || "",
                    updatedFlow.id,
                    {
                        id: updatedFlow.id,
                        name: updatedFlow.name,
                        organizationId: session?.user?.organization?.id || "",
                        description: updatedFlow.description,
                        updatedBy: session?.user?.id || "",
                    },
                    session?.user?.jwt || ""
                );

                const triggerPromises = (updatedFlow.triggers || []).map(trigger => {
                    if (trigger.existInDb) {
                        return updateOrgFlowTemplateTrigger(
                            session?.user?.organization?.id || "",
                            updatedFlow.id,
                            trigger.id,
                            {
                                name: trigger.name,
                                id: trigger.id,
                                type: trigger.type,
                                details: trigger.details,
                                summary: trigger.description,
                            },
                            session?.user?.jwt || ""
                        );
                    } else {
                        return createOrgFlowTemplateTrigger(
                            session?.user?.organization?.id || "",
                            updatedFlow.id,
                            {
                                name: trigger.name,
                                type: trigger.type,
                                details: trigger.details,
                                summary: trigger.description,
                            },
                            session?.user?.jwt || ""
                        );
                    }
                });

                const actionPromises = (updatedFlow.actions || []).map(action => {
                    if (action.existInDb) {
                        return updateOrgFlowTemplateAction(
                            session?.user?.organization?.id || "",
                            updatedFlow.id,
                            action.id,
                            {
                                name: action.name || "No name",
                                type: action.type,
                                details: action.details,
                                summary: action.description,
                                id: action.id,
                            },
                            session?.user?.jwt || ""
                        );
                    } else {
                        return createOrgFlowTemplateAction(
                            session?.user?.organization?.id || "",
                            updatedFlow.id,
                            {
                                name: action.name,
                                type: action.type,
                                details: action.details,
                                summary: action.description,
                            },
                            session?.user?.jwt || ""
                        );
                    }
                });

                // Execute all promises in parallel
                await Promise.all([metadataPromise, ...triggerPromises, ...actionPromises]);

                // Set everything as present in the db
                updatedFlow.triggers = updatedFlow.triggers?.map(trigger => ({ ...trigger, existInDb: true }));
                updatedFlow.actions = updatedFlow.actions?.map(action => ({ ...action, existInDb: true }));

                // React query delete cache
                queryClient.invalidateQueries({ queryKey: [flowId] });

                toast.success("Flow updated", {
                    description: "All flow components were updated successfully.",
                    duration: 3000,
                });
            } else {
                // Handle non-template flow updates here
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Error updating flow:", error);
            toast.error("Failed to update flow", {
                description: "An error occurred while saving your changes. Please try again.",
                duration: 5000,
            });
        }
    };

    // Function to handle running the flow manually
    const handleRunFlow = () => {
        toast.error("Flow can not be run manually", { description: "This feature is currently in progress and will be available soon." })
        // toast.info("Flow triggered", {
        //     description: "The flow has been triggered manually and is now running.",
        //     duration: 3000,
        // });
    };

    // Function to handle deleting the flow
    const handleDelete = async () => {
        if (!flow) {
            toast.error("Flow nicht gefunden", {
                description: "Der Flow, den Sie löschen möchten, existiert nicht.",
                duration: 5000,
            });
            return;
        }

        if (flow?.isTemplate) {
            try {
                await deleteOrgFlowTemplate(
                    session?.user?.organization?.id || "",
                    flow.id,
                    session?.user?.jwt || "")

                toast.success("Flow erfolgreich gelöscht")
                router.push(`/organization/flows`);

            } catch (error) {
                console.error("Error deleting flow:", error);
                toast.error("Flow konnte nicht gelöscht werden", {
                    description: "Ein Fehler ist beim Löschen des Flows aufgetreten. Bitte versuchen Sie es erneut.",
                    duration: 5000,
                });
            }
        } else {
            try {
                await deleteFlow(
                    session?.user?.organization?.id || "",
                    flow.eventId || "",
                    flow.id || "",
                    session?.user?.jwt || "")

                toast.success("Flow erfolgreich gelöscht")
                router.push(`/organization/flows`);

            } catch (error) {
                console.error("Error deleting flow:", error);
                toast.error("Flow konnte nicht gelöscht werden", {
                    description: "Ein Fehler ist beim Löschen des Flows aufgetreten. Bitte versuchen Sie es erneut.",
                    duration: 5000,
                });
            }
        }
    };

    // Function to handle duplicating the flow
    const handleDuplicate = () => {
        toast.error("Flow can not be duplicated", { description: "This feature is currently in progress and will be available soon." })
        // toast.success("Flow duplicated", {
        //     description: "A copy of this flow has been created.",
        //     duration: 3000,
        // });
    };

    // Get formatted dates
    const createdAtFormatted = format(new Date(flow?.createdAt || 0), "MMMM dd, yyyy 'at' HH:mm");
    const updatedAtFormatted = format(new Date(flow?.updatedAt || 0), "MMMM dd, yyyy 'at' HH:mm");



    const quickActions: QuickAction[] = [
        {
            children: (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleRunFlow}>
                                <PlayCircle className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Flow manuell ausführen</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        {
            children: (

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleDuplicate}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Flow duplizieren</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
        {
            children: (
                <Button
                    variant={isEditing ? "secondary" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? "Bearbeiten abbrechen" : "Flow bearbeiten"}
                </Button>
            )
        },
    ];

    return (
        <>
            <SiteHeader actions={quickActions} >
                <BreadcrumbItem  >
                    {flow ?
                        <BreadcrumbPage>{flow?.name}</BreadcrumbPage> :
                        <BreadcrumbPage><Skeleton className="w-60 h-6" /></BreadcrumbPage>}

                </BreadcrumbItem>
            </SiteHeader>

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">

                {flow ?
                    <Tabs defaultValue="overview" className="space-y-4 ">
                        <TabsList className="grid grid-cols-3 w-full mx-auto bg-muted">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab - Using shared Flow Form */}
                        <TabsContent value="overview" className="space-y-4">
                            <FlowForm
                                flow={flow}
                                isEditing={isEditing}
                                onSave={handleSave}
                            />
                        </TabsContent>

                        {/* Logs Tab */}
                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Execution Logs</CardTitle>
                                    <CardDescription>History of flow executions and their results</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <div className="font-medium">Recent Executions</div>
                                            <Button variant="outline" size="sm">
                                                <HistoryIcon className="mr-2 h-4 w-4" />
                                                View All
                                            </Button>
                                        </div>
                                        <div className="p-4 text-center text-muted-foreground">
                                            No recent executions found for this flow.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Flow Settings
                                        <Badge variant="outline" className="mt-0.5 text-xs cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            // Copy flow ID to clipboard
                                            navigator.clipboard.writeText(flow.id).then(() => {
                                                toast.success("Flow ID copied to clipboard", {
                                                    description: "You can now paste it wherever you need.",
                                                    duration: 3000,
                                                });
                                            });
                                        }}>
                                            ID: {flow.id}
                                        </Badge></CardTitle>
                                    <CardDescription>Configure advanced settings for this flow</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    <div className="space-y-2">
                                        <Label htmlFor="retention">Log Retention (days)</Label>
                                        <Input
                                            id="retention"
                                            type="number"
                                            defaultValue="30"
                                            disabled={!isEditing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Execution logs will be retained for this many days.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeout">Execution Timeout (seconds)</Label>
                                        <Input
                                            id="timeout"
                                            type="number"
                                            defaultValue="60"
                                            disabled={!isEditing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum time allowed for flow execution before timing out.
                                        </p>
                                    </div>

                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <div className="font-medium text-destructive mb-2">Danger Zone</div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            The following actions are destructive and cannot be undone.
                                        </p>
                                        <ConfirmationButton
                                            variant="destructive"
                                            onConfirm={handleDelete}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete Flow
                                        </ConfirmationButton>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <p className="text-muted-foreground">
                                        Created by {flow.createdBy} • Last updated {updatedAtFormatted}
                                    </p>
                                    <Button
                                        variant="default"
                                        disabled={!isEditing}
                                        onClick={() => handleSave(flow)}
                                        className="ml-auto"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Settings
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    :
                    <div>
                        <div defaultValue="overview" className="space-y-4 ">
                            <div className="grid grid-cols-3 gap-4 w-full mx-auto ">
                                <Skeleton className="h-6" />
                                <Skeleton className="h-6" />
                                <Skeleton className="h-6" />
                            </div>
                        </div>
                        <div className="mx-auto w-fit h-fit my-20">

                            <LoadingSpinner />
                        </div>
                    </div>
                }

            </div>
        </>

    );
}