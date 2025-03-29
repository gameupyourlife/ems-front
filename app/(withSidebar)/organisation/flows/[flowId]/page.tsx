"use client";;
import { useState } from "react";
import { mockFlows } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
    Mail,
    Bell,
    FileText,
    Image,
    LayoutList,
    PencilLine,
    Tag,
    Calendar,
    Users,
    Check,
    Zap,
    Trash,
    AlertTriangle,
    Copy,
    Plus,
    Save,
    ArrowLeft,
    PlayCircle,
    HistoryIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Flow } from "@/lib/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddActionDialog, AddTriggerDialog } from "@/components/org/flows/flow-dialogs";

// Helper to get appropriate icon for trigger types
const getTriggerIcon = (type: string) => {
    switch (type) {
        case 'date':
            return <Calendar className="h-5 w-5" />;
        case 'numOfAttendees':
            return <Users className="h-5 w-5" />;
        case 'status':
            return <Tag className="h-5 w-5" />;
        case 'registration':
            return <Check className="h-5 w-5" />;
        default:
            return <Zap className="h-5 w-5" />;
    }
};

// Helper to get appropriate icon for action types
const getActionIcon = (type: string) => {
    switch (type) {
        case 'email':
            return <Mail className="h-5 w-5" />;
        case 'notification':
            return <Bell className="h-5 w-5" />;
        case 'statusChange':
            return <Tag className="h-5 w-5" />;
        case 'fileShare':
            return <FileText className="h-5 w-5" />;
        case 'imageChange':
            return <Image className="h-5 w-5" />;
        case 'titleChange':
            return <LayoutList className="h-5 w-5" />;
        case 'descriptionChange':
            return <PencilLine className="h-5 w-5" />;
        default:
            return <Zap className="h-5 w-5" />;
    }
};





export default function FlowDetailsPage({flowId}: {flowId: string}) {
    const params = useParams();
    const router = useRouter();
    
    // Get the flow ID from the URL parameters
    // const flowId = Array.isArray(params.flowId) ? params.flowId[0] : params.flowId;
    // const orgId = Array.isArray(params.orgId) ? params.orgId[0] : params.orgId as string;

    flowId = "2";
    
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
                    <Link href={`/organisation/flows`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Flows
                    </Link>
                </Button>
            </div>
        );
    }
    
    // State for editable flow data
    const [editedFlow, setEditedFlow] = useState<Flow>({...flow});
    const [isEditing, setIsEditing] = useState(false);
    
    // State for dialog control
    const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
    const [isAddActionOpen, setIsAddActionOpen] = useState(false);
    
    // Function to handle saving changes
    const handleSave = () => {
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
        router.push(`/organisation/flows`);
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
    
    // Function to handle adding a new trigger
    const handleAddTrigger = (triggerType: string, details: any) => {
        const newTrigger = {
            id: `trigger-${Date.now()}`,
            type: triggerType,
            details: details
        };
        
        //@ts-ignore
        setEditedFlow(prev => ({
            ...prev,
            trigger: [...prev.trigger, newTrigger]
        }));
        
        toast.success("Trigger added", {
            description: `A new ${triggerType} trigger has been added to the flow.`,
            duration: 3000,
        });
    };
    
    // Function to handle adding a new action
    const handleAddAction = (actionType: string, details: any) => {
        const newAction = {
            id: `action-${Date.now()}`,
            type: actionType,
            details: details
        };
        
        //@ts-ignore
        setEditedFlow(prev => ({
            ...prev,
            actions: [...prev.actions, newAction]
        }));
        
        toast.success("Action added", {
            description: `A new ${actionType} action has been added to the flow.`,
            duration: 3000,
        });
    };
    
    // Get formatted dates
    const createdAtFormatted = format(new Date(flow.createdAt), "MMMM dd, yyyy 'at' HH:mm");
    const updatedAtFormatted = format(new Date(flow.updatedAt), "MMMM dd, yyyy 'at' HH:mm");

    return (
        <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/organisation">Organizations</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/organisation`}>Organization</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/organisation/flows`}>Flows</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{flow.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Flow Header with Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{flow.name}</h1>
                        <Badge variant="outline" className="ml-2 text-xs">
                            ID: {flow.id}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Created by {flow.createdBy} • Last updated {updatedAtFormatted}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleRunFlow}>
                                    <PlayCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Run flow manually</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleDuplicate}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Duplicate flow</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <Button 
                        variant={isEditing ? "secondary" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Cancel Editing" : "Edit Flow"}
                    </Button>
                    
                    {isEditing && (
                        <Button variant="default" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="editor">Flow Editor</TabsTrigger>
                    <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Flow Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Flow Information</CardTitle>
                                <CardDescription>Basic details about this automation flow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Flow Name</Label>
                                        {isEditing ? (
                                            <Input 
                                                id="name" 
                                                value={editedFlow.name} 
                                                onChange={(e) => setEditedFlow({...editedFlow, name: e.target.value})}
                                            />
                                        ) : (
                                            <div className="rounded-md border px-3 py-2">{flow.name}</div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        {isEditing ? (
                                            <Textarea 
                                                id="description" 
                                                value={editedFlow.description} 
                                                onChange={(e) => setEditedFlow({...editedFlow, description: e.target.value})}
                                                className="min-h-[100px]"
                                            />
                                        ) : (
                                            <div className="rounded-md border px-3 py-2 min-h-[100px]">
                                                {flow.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Metadata */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Metadata</CardTitle>
                                <CardDescription>Additional information about this flow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div className="flex flex-col">
                                        <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                                        <dd className="font-mono">{createdAtFormatted}</dd>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                                        <dd className="font-mono">{updatedAtFormatted}</dd>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                                        <dd>{flow.createdBy}</dd>
                                    </div>
                                    <div className="flex flex-col">
                                        <dt className="text-sm font-medium text-muted-foreground">Last Updated By</dt>
                                        <dd>{flow.updatedBy}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                        
                        {/* Triggers */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Triggers</CardTitle>
                                <CardDescription>Conditions that initiate this flow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px]">
                                    <ul className="space-y-4">
                                        {flow.trigger.map((trigger) => (
                                            <li key={trigger.id} className="flex items-start gap-3 rounded-md border p-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                                    {getTriggerIcon(trigger.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="font-medium capitalize">{trigger.type} Trigger</div>
                                                    {trigger.details && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {Object.entries(trigger.details).map(([key, value]) => (
                                                                <div key={key}>
                                                                    <span className="capitalize">{key}:</span> {String(value)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="pt-0">
                                    <Button variant="outline" className="w-full" size="sm" onClick={() => setIsAddTriggerOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Trigger
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                        
                        {/* Actions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Actions</CardTitle>
                                <CardDescription>Actions performed when this flow is triggered</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px]">
                                    <ul className="space-y-4">
                                        {flow.actions.map((action) => (
                                            <li key={action.id} className="flex items-start gap-3 rounded-md border p-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                                                    {getActionIcon(action.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="font-medium capitalize">{action.type} Action</div>
                                                    {action.details && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {Object.entries(action.details).map(([key, value]) => (
                                                                <div key={key}>
                                                                    <span className="capitalize">{key}:</span> {String(value)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                            {isEditing && (
                                <CardFooter className="pt-0">
                                    <Button variant="outline" className="w-full" size="sm" onClick={() => setIsAddActionOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Action
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </TabsContent>
                
                {/* Flow Editor Tab */}
                <TabsContent value="editor" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Flow Editor</CardTitle>
                            <CardDescription>Visual editor for configuring your flow</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-4">
                                {/* Flow editor controls */}
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddTriggerOpen(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Trigger
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddActionOpen(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Action
                                    </Button>
                                </div>
                                
                                {/* Visual flow builder placeholder */}
                                <div className="flex h-[450px] items-center justify-center rounded-md border border-dashed">
                                    <div className="text-center">
                                        <Zap className="mx-auto h-10 w-10 text-muted-foreground" />
                                        <h3 className="mt-2 text-lg font-medium">Visual Flow Builder</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            The visual flow builder would be implemented here, allowing drag-and-drop editing of triggers and actions.
                                        </p>
                                        <p className="mt-2 text-sm">
                                            Use the buttons above to add new triggers and actions to your flow.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                            <CardTitle>Flow Settings</CardTitle>
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
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDelete}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Flow
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button 
                                variant="default" 
                                disabled={!isEditing}
                                onClick={handleSave}
                                className="ml-auto"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Trigger Dialog */}
            <AddTriggerDialog 
                open={isAddTriggerOpen} 
                onOpenChange={setIsAddTriggerOpen} 
                onAdd={handleAddTrigger} 
            />

            {/* Add Action Dialog */}
            <AddActionDialog 
                open={isAddActionOpen} 
                onOpenChange={setIsAddActionOpen} 
                onAdd={handleAddAction} 
            />
        </div>
    );
}