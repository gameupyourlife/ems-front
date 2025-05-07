"use client";;
import { useState } from "react";
import { mockFlows } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlayCircle, Trash, AlertTriangle, Copy, Save, ArrowLeft, HistoryIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Flow } from "@/lib/types";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FlowForm } from "@/components/org/flows/flow-form";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { ConfirmationButton } from "@/components/ui/confirmation-button";

export default function FlowDetailsPage() {
    const params = useParams();
    const router = useRouter();

    // Get the flow ID from the URL parameters
    const flowId = Array.isArray(params.flowId) ? params.flowId[0] : params.flowId as string;

    // Find the flow in the mock data
    const flow = mockFlows.find(f => f.id === flowId);

    // If flow not found, handle gracefully
    if (!flow) {
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

    // State for editable flow data and editing mode
    const [isEditing, setIsEditing] = useState(false);

    // Function to handle saving changes
    const handleSave = (updatedFlow: Flow) => {
        // In a real app, you would make an API call here
        setIsEditing(false);
        toast.success("Flow updated", {
            description: "Your changes have been saved successfully.",
            duration: 3000,
        });
    };

    // Function to handle running the flow manually
    const handleRunFlow = () => {
        toast.info("Flow triggered", {
            description: "The flow has been triggered manually and is now running.",
            duration: 3000,
        });
    };

    // Function to handle deleting the flow
    const handleDelete = () => {
        // In a real app, you would make an API call here
        router.push(`/organization/flows`);
        toast.error("Flow deleted", {
            description: "The flow has been deleted successfully.",
            duration: 3000,
        });
    };

    // Function to handle duplicating the flow
    const handleDuplicate = () => {
        toast.success("Flow duplicated", {
            description: "A copy of this flow has been created.",
            duration: 3000,
        });
    };

    // Get formatted dates
    const createdAtFormatted = format(new Date(flow.createdAt), "MMMM dd, yyyy 'at' HH:mm");
    const updatedAtFormatted = format(new Date(flow.updatedAt), "MMMM dd, yyyy 'at' HH:mm");

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
                    <BreadcrumbPage>{flow.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </SiteHeader>

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">



                {/* Main Content Tabs */}
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
            </div>
        </>

    );
}