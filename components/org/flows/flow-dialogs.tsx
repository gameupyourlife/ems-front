"use client";;
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    Users,
    Tag,
    Check,
    Mail,
    Bell,
    FileText,
    Image,
    LayoutList,
    PencilLine,
    Clock,
    AlertCircle,
    ChevronRight,
    Percent,
    ChevronLeft,
    Globe
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flow } from "@/lib/types";
import { cn } from "@/lib/utils";

// Selection card component for creating card-based selection UI
interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    title: string;
    description?: string;
    disabled?: boolean;
    className?: string;
    size?: "default" | "sm" | "lg";
}

function SelectionCard({ selected, onClick, icon, title, description, disabled = false, size = "default", className }: SelectionCardProps) {
    return (
        <div 
            className={cn(
                "border rounded-md p-4 transition-all h-full flex flex-col",
                selected ? "border-primary bg-primary/5" : "border-border",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:shadow-sm",
                size === "sm" && "p-2",
                className
            )}
            onClick={() => {
                if (!disabled) {
                    onClick();
                }
            }}
        >
            <div className="flex items-start gap-3 h-full">
                {icon && (
                    <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                        selected ? "bg-primary/10" : "bg-muted"
                    )}>
                        {icon}
                    </div>
                )}
                <div className="space-y-1 flex-1">
                    <div className={cn(
                        "text-sm font-medium",
                        selected && "text-primary"
                    )}>
                        {title}
                    </div>
                    {description && (
                        <div className="text-xs text-muted-foreground">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Component for adding a new trigger (condition)
export function AddTriggerDialog({ 
    open, 
    onOpenChange, 
    onAdd,
    existingFlow
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onAdd: (triggerType: string, details: any) => void;
    existingFlow?: Flow;
}) {
    const [triggerType, setTriggerType] = useState<string>("");
    const [details, setDetails] = useState<any>({});
    const [selectedTrigger, setSelectedTrigger] = useState<string>("");
    const [dateReferenceType, setDateReferenceType] = useState<string>("absolute");
    const [attendeesValueType, setAttendeesValueType] = useState<string>("absolute");

    // Check if registration trigger already exists
    const registrationTriggerExists = useMemo(() => {
        return existingFlow?.trigger.some(t => t.type === "registration");
    }, [existingFlow]);

    const handleAddTrigger = () => {
        onAdd(triggerType, details);
        onOpenChange(false);
        // Reset form
        setTriggerType("");
        setDetails({});
        setSelectedTrigger("");
        setDateReferenceType("absolute");
        setAttendeesValueType("absolute");
    };

    // Trigger types with their icons and descriptions
    const triggerTypes = [
        {
            id: "date",
            name: "Date & Time",
            description: "Trigger based on a specific date and time",
            icon: <Calendar className="h-5 w-5" />
        },
        {
            id: "numOfAttendees",
            name: "Attendees Count",
            description: "Trigger when attendance reaches a certain level",
            icon: <Users className="h-5 w-5" />
        },
        {
            id: "status",
            name: "Status Change",
            description: "Trigger when event status changes",
            icon: <Tag className="h-5 w-5" />
        },
        {
            id: "registration",
            name: "New Registration",
            description: "Trigger when someone registers for the event",
            icon: <Check className="h-5 w-5" />,
            disabled: registrationTriggerExists
        }
    ];

    useEffect(() => {
        // Reset details when trigger type changes
        setDetails({});
        
        // Reset specific state for trigger types
        if (triggerType === "date") {
            setDateReferenceType("absolute");
        } else if (triggerType === "numOfAttendees") {
            setAttendeesValueType("absolute");
        }
    }, [triggerType]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] xl:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add Trigger</DialogTitle>
                    <DialogDescription>
                        Define when this automation flow should run
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-6 py-4">
                    {/* Left side - Trigger type selection */}
                    <div className="w-1/3 space-y-4 border-r pr-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Trigger Type</div>
                        <div className="space-y-2">
                            {triggerTypes.map((trigger) => (
                                <SelectionCard 
                                    key={trigger.id}
                                    selected={triggerType === trigger.id}
                                    onClick={() => {
                                        if (!trigger.disabled) {
                                            setTriggerType(trigger.id);
                                        }
                                    }}
                                    icon={trigger.icon}
                                    title={trigger.name}
                                    description={trigger.description}
                                    disabled={trigger.disabled}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Right side - Configuration for selected trigger */}
                    <div className="w-2/3 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {!triggerType && (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground/70" />
                                <p>Select a trigger type to configure</p>
                            </div>
                        )}
                        
                        {triggerType && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {triggerTypes.find(t => t.id === triggerType)?.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {triggerTypes.find(t => t.id === triggerType)?.description}
                                    </p>
                                </div>
                                
                                <Separator />
                                
                                {triggerType === "date" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Date Reference</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectionCard
                                                    selected={dateReferenceType === "absolute"}
                                                    onClick={() => {
                                                        setDateReferenceType("absolute");
                                                        setDetails({});
                                                    }}
                                                    icon={<Calendar className="h-5 w-5" />}
                                                    title="Specific date and time"
                                                    description="Trigger on an exact date"
                                                />
                                                <SelectionCard
                                                    selected={dateReferenceType === "relative"}
                                                    onClick={() => {
                                                        setDateReferenceType("relative");
                                                        setDetails({});
                                                    }}
                                                    icon={<Clock className="h-5 w-5" />}
                                                    title="Relative to event date"
                                                    description="Trigger before/after event"
                                                />
                                            </div>
                                        </div>
                                        
                                        {dateReferenceType === "absolute" ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="dateOperator">When should this trigger?</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <SelectionCard
                                                            selected={details.operator === "before"}
                                                            onClick={() => setDetails({ ...details, operator: "before" })}
                                                            title="Before"
                                                            description="Trigger before the date"
                                                        />
                                                        <SelectionCard
                                                            selected={details.operator === "after"}
                                                            onClick={() => setDetails({ ...details, operator: "after" })}
                                                            title="After"
                                                            description="Trigger after the date"
                                                        />
                                                        <SelectionCard
                                                            selected={details.operator === "on"}
                                                            onClick={() => setDetails({ ...details, operator: "on" })}
                                                            title="Exactly on"
                                                            description="Trigger at the time"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="dateValue">Target date and time</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="dateValue"
                                                            type="datetime-local"
                                                            value={details.value || ""}
                                                            onChange={(e) => setDetails({ ...details, value: e.target.value })}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Select the date and time that will trigger this flow
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="eventDateReference">Reference Point</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <SelectionCard
                                                            selected={details.reference === "start"}
                                                            onClick={() => setDetails({ ...details, reference: "start" })}
                                                            title="Event Start Date"
                                                            description="Use event's start date"
                                                        />
                                                        <SelectionCard
                                                            selected={details.reference === "end"}
                                                            onClick={() => setDetails({ ...details, reference: "end" })}
                                                            title="Event End Date"
                                                            description="Use event's end date"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="timeDirection">Timing</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <SelectionCard
                                                            selected={details.direction === "before"}
                                                            onClick={() => setDetails({ ...details, direction: "before" })}
                                                            title="Before"
                                                            description="Trigger before this date"
                                                        />
                                                        <SelectionCard
                                                            selected={details.direction === "after"}
                                                            onClick={() => setDetails({ ...details, direction: "after" })}
                                                            title="After"
                                                            description="Trigger after this date"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor="timeAmount">Amount</Label>
                                                        <Input
                                                            id="timeAmount"
                                                            type="number"
                                                            min="1"
                                                            value={details.amount || ""}
                                                            onChange={(e) => setDetails({ ...details, amount: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor="timeUnit">Unit</Label>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            <SelectionCard
                                                                selected={details.unit === "minutes"}
                                                                onClick={() => setDetails({ ...details, unit: "minutes" })}
                                                                title="Minutes"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "hours"}
                                                                onClick={() => setDetails({ ...details, unit: "hours" })}
                                                                title="Hours"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "days"}
                                                                onClick={() => setDetails({ ...details, unit: "days" })}
                                                                title="Days"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "weeks"}
                                                                onClick={() => setDetails({ ...details, unit: "weeks" })}
                                                                title="Weeks"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Example: 2 days before event start
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {triggerType === "numOfAttendees" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Value Type</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectionCard
                                                    selected={attendeesValueType === "absolute"}
                                                    onClick={() => {
                                                        setAttendeesValueType("absolute");
                                                        setDetails({});
                                                    }}
                                                    icon={<Users className="h-5 w-5" />}
                                                    title="Absolute number"
                                                    description="Count of actual attendees"
                                                />
                                                <SelectionCard
                                                    selected={attendeesValueType === "percentage"}
                                                    onClick={() => {
                                                        setAttendeesValueType("percentage");
                                                        setDetails({});
                                                    }}
                                                    icon={<Percent className="h-5 w-5" />}
                                                    title="Percentage of capacity"
                                                    description="Percent of maximum capacity"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="attendeesOperator">Condition</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <SelectionCard
                                                    selected={details.operator === "equals"}
                                                    onClick={() => setDetails({ ...details, operator: "equals" })}
                                                    title="Equals"
                                                    description="Exactly matches"
                                                />
                                                <SelectionCard
                                                    selected={details.operator === "less"}
                                                    onClick={() => setDetails({ ...details, operator: "less" })}
                                                    title="Less than"
                                                    description="Lower than value"
                                                />
                                                <SelectionCard
                                                    selected={details.operator === "greater"}
                                                    onClick={() => setDetails({ ...details, operator: "greater" })}
                                                    title="Greater than"
                                                    description="Higher than value"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="attendeesValue">
                                                {attendeesValueType === "absolute" ? "Number of Attendees" : "Percentage of Capacity"}
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                {attendeesValueType === "absolute" ? (
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <Input
                                                    id="attendeesValue"
                                                    type="number"
                                                    min={attendeesValueType === "absolute" ? "0" : "0"}
                                                    max={attendeesValueType === "percentage" ? "100" : undefined}
                                                    value={details.value || ""}
                                                    onChange={(e) => setDetails({ ...details, value: parseInt(e.target.value) })}
                                                    className="flex-1"
                                                />
                                                {attendeesValueType === "percentage" && (
                                                    <span className="text-muted-foreground">%</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {attendeesValueType === "absolute" 
                                                    ? "This flow will trigger when the attendance count matches your condition" 
                                                    : "This flow will trigger when the attendance percentage matches your condition"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {triggerType === "status" && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="statusValue">When status changes to</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <SelectionCard
                                                    selected={details.status === "active"}
                                                    onClick={() => setDetails({ ...details, status: "active" })}
                                                    title="Active"
                                                    description="Live event"
                                                />
                                                <SelectionCard
                                                    selected={details.status === "cancelled"}
                                                    onClick={() => setDetails({ ...details, status: "cancelled" })}
                                                    title="Cancelled"
                                                    description="Event won't happen"
                                                />
                                                <SelectionCard
                                                    selected={details.status === "completed"}
                                                    onClick={() => setDetails({ ...details, status: "completed" })}
                                                    title="Completed"
                                                    description="Event has finished"
                                                />
                                                <SelectionCard
                                                    selected={details.status === "archived"}
                                                    onClick={() => setDetails({ ...details, status: "archived" })}
                                                    title="Archived"
                                                    description="Stored for reference"
                                                />
                                                <SelectionCard
                                                    selected={details.status === "draft"}
                                                    onClick={() => setDetails({ ...details, status: "draft" })}
                                                    title="Draft"
                                                    description="Work in progress"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                This flow will trigger when the event status changes to your selected value
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {triggerType === "registration" && (
                                    <div className="bg-muted/50 p-4 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded">
                                                <Check className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">New Registration</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    This trigger will activate whenever someone registers for your event.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-muted-foreground">
                                            <p className="font-medium">Available variables:</p>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li><code>user.email</code> - Registered user's email</li>
                                                <li><code>user.name</code> - Registered user's name</li>
                                                <li><code>user.id</code> - Registered user's ID</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {triggerType && `Adding a ${triggerTypes.find(t => t.id === triggerType)?.name} trigger`}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddTrigger}
                            disabled={
                                !triggerType || 
                                (triggerType !== "registration" && Object.keys(details).length === 0) ||
                                (triggerType === "date" && dateReferenceType === "absolute" && (!details.operator || !details.value)) ||
                                (triggerType === "date" && dateReferenceType === "relative" && (!details.reference || !details.direction || !details.amount || !details.unit)) ||
                                (triggerType === "numOfAttendees" && (!details.operator || details.value === undefined))
                            }
                        >
                            Add Trigger
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Component for adding a new action
export function AddActionDialog({ 
    open, 
    onOpenChange, 
    onAdd,
    existingFlow
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onAdd: (actionType: string, details: any) => void;
    existingFlow?: Flow;
}) {
    const [actionType, setActionType] = useState<string>("");
    const [details, setDetails] = useState<any>({});
    const [emailRecipientType, setEmailRecipientType] = useState<string>("specific");
    const [notificationRecipientType, setNotificationRecipientType] = useState<string>("specific");
    const [availableTriggerVariables, setAvailableTriggerVariables] = useState<{id: string, type: string, label: string, variables?: string[]}[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");
    
    // Parse existing triggers to create available variables
    useEffect(() => {
        if (existingFlow?.trigger) {
            const variables = existingFlow.trigger.map(trigger => {
                let label = '';
                switch(trigger.type) {
                    case 'registration':
                        label = 'New Registered User';
                        return { 
                            id: trigger.id, 
                            type: trigger.type, 
                            label: label,
                            variables: ['email', 'name', 'userId']
                        };
                    case 'date':
                        label = 'Date Trigger';
                        return { 
                            id: trigger.id, 
                            type: trigger.type, 
                            label: label
                        };
                    case 'numOfAttendees':
                        label = 'Attendees Count Trigger';
                        return { 
                            id: trigger.id, 
                            type: trigger.type, 
                            label: label
                        };
                    case 'status':
                        label = 'Status Change Trigger';
                        return { 
                            id: trigger.id, 
                            type: trigger.type, 
                            label: label
                        };
                    default:
                        return { 
                            id: trigger.id, 
                            type: trigger.type, 
                            label: `Trigger ${trigger.id}`
                        };
                }
            });
            setAvailableTriggerVariables(variables);
        }
    }, [existingFlow]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            // Reset all states when dialog is closed
            setTimeout(() => {
                setActionType("");
                setDetails({});
                setEmailRecipientType("specific");
                setNotificationRecipientType("specific");
                setActiveTab("");
            }, 300); // Small delay to avoid visual glitches during animation
        }
    }, [open]);

    // Action types with their icons and descriptions
    const actionTypes = [
        {
            id: "email",
            name: "Send Email",
            description: "Send an email notification",
            icon: <Mail className="h-5 w-5" />
        },
        {
            id: "notification",
            name: "Send Notification",
            description: "Send an in-app notification",
            icon: <Bell className="h-5 w-5" />
        },
        {
            id: "statusChange",
            name: "Change Status",
            description: "Update the event status",
            icon: <Tag className="h-5 w-5" />
        },
        {
            id: "fileShare",
            name: "Share File",
            description: "Change file sharing settings",
            icon: <FileText className="h-5 w-5" />
        },
        {
            id: "imageChange",
            name: "Update Image",
            description: "Change event image",
            icon: <Image className="h-5 w-5" />
        },
        {
            id: "titleChange",
            name: "Change Title",
            description: "Update event title",
            icon: <LayoutList className="h-5 w-5" />
        },
        {
            id: "descriptionChange", 
            name: "Change Description",
            description: "Update event description",
            icon: <PencilLine className="h-5 w-5" />
        }
    ];

    useEffect(() => {
        // Reset details when action type changes
        setDetails({});
        
        // Reset recipient types
        setEmailRecipientType("specific");
        setNotificationRecipientType("specific");

        // Set active tab based on action type
        if (actionType) {
            setActiveTab("config");
        } else {
            setActiveTab("");
        }
    }, [actionType]);

    // Handle going back to action type selection
    const handleBackToActionTypes = () => {
        setActiveTab("");
        // Don't reset the action type yet to keep it visually selected
    };

    const handleAddAction = () => {
        // Prepare the details based on recipient types for email and notification
        let finalDetails = {...details};
        
        if (actionType === "email") {
            if (emailRecipientType === "registeredUser" && details.selectedTriggerId) {
                finalDetails.recipients = `trigger.${details.selectedTriggerId}.user.email`;
            } else if (emailRecipientType === "allUsers") {
                finalDetails.recipients = "all.users";
            }
            // For specific emails, use the existing recipients
        }
        
        if (actionType === "notification") {
            if (notificationRecipientType === "registeredUser" && details.selectedTriggerId) {
                finalDetails.recipients = [`trigger.${details.selectedTriggerId}.user.id`];
            } else if (notificationRecipientType === "allUsers") {
                finalDetails.recipients = ["all.users"];
            }
            // For specific users, use the existing recipients
        }
        
        onAdd(actionType, finalDetails);
        onOpenChange(false);
    };

    // Helper to check if a registration trigger exists
    const hasRegistrationTrigger = useMemo(() => {
        return availableTriggerVariables.some(v => v.type === 'registration');
    }, [availableTriggerVariables]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] md:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Add Action</DialogTitle>
                    <DialogDescription>
                        Define what should happen when this flow runs
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="my-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="" onClick={handleBackToActionTypes}>Choose Action Type</TabsTrigger>
                        <TabsTrigger value="config" disabled={!actionType}>Configure Action</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="" className="py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {actionTypes.map((action) => (
                                <Card 
                                    key={action.id}
                                    className={cn(
                                        "border cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                                        actionType === action.id && "border-primary bg-primary/5"
                                    )}
                                    onClick={() => {
                                        setActionType(action.id);
                                    }}
                                >
                                    <CardContent className="p-4 space-y-2">
                                        <div className={cn(
                                            "p-2 w-10 h-10 rounded-full flex items-center justify-center",
                                            "bg-muted"
                                        )}>
                                            {action.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm">{action.name}</h3>
                                            <p className="text-xs text-muted-foreground">{action.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="config" className="py-4">
                        <div className="flex items-center mb-4">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleBackToActionTypes} 
                                className="mr-2 text-muted-foreground hover:text-foreground"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back to action types
                            </Button>
                            <div className="flex-1 text-sm font-medium">
                                Configuring: {actionTypes.find(a => a.id === actionType)?.name}
                            </div>
                        </div>
                        
                        <ScrollArea className="max-h-[400px] pr-4">
                            {actionType === "email" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emailSubject">Email Subject</Label>
                                        <Input
                                            id="emailSubject"
                                            value={details.subject || ""}
                                            onChange={(e) => setDetails({ ...details, subject: e.target.value })}
                                            placeholder="Enter email subject"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emailBody">Email Body</Label>
                                        <Textarea
                                            id="emailBody"
                                            value={details.body || ""}
                                            onChange={(e) => setDetails({ ...details, body: e.target.value })}
                                            placeholder="Enter email body"
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Recipients</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <SelectionCard
                                                selected={emailRecipientType === "specific"}
                                                onClick={() => {
                                                    setEmailRecipientType("specific");
                                                }}
                                                title="Specific Email Addresses"
                                                description="Send to individual emails you specify"
                                                icon={<Mail className="h-5 w-5" />}
                                            />
                                            
                                            {emailRecipientType === "specific" && (
                                                <div className="px-4 py-2 bg-muted/50 rounded-md ml-4 border-l-2 border-primary/30">
                                                    <Input
                                                        id="emailRecipients"
                                                        value={details.recipients || ""}
                                                        onChange={(e) => setDetails({ ...details, recipients: e.target.value })}
                                                        placeholder="e.g., user@example.com, another@example.com"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Enter email addresses separated by commas
                                                    </p>
                                                </div>
                                            )}

                                            {hasRegistrationTrigger && (
                                                <SelectionCard
                                                    selected={emailRecipientType === "registeredUser"}
                                                    onClick={() => {
                                                        setEmailRecipientType("registeredUser");
                                                        
                                                        // If there's only one registration trigger, select it automatically
                                                        const registrationTriggers = availableTriggerVariables.filter(v => v.type === 'registration');
                                                        if (registrationTriggers.length === 1) {
                                                            setDetails(prev => ({ ...prev, selectedTriggerId: registrationTriggers[0].id }));
                                                        }
                                                    }}
                                                    title="New Registered User"
                                                    description="Send to the user who just registered"
                                                    icon={<Check className="h-5 w-5" />}
                                                />
                                            )}

                                            {emailRecipientType === "registeredUser" && availableTriggerVariables.filter(v => v.type === 'registration').length > 1 && (
                                                <div className="px-4 py-2 bg-muted/50 rounded-md ml-4 border-l-2 border-primary/30">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="triggerSelect">Select registration trigger</Label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {availableTriggerVariables
                                                                .filter(v => v.type === 'registration')
                                                                .map(trigger => (
                                                                    <SelectionCard
                                                                        key={trigger.id}
                                                                        selected={details.selectedTriggerId === trigger.id}
                                                                        onClick={() => setDetails({ ...details, selectedTriggerId: trigger.id })}
                                                                        title={trigger.label}
                                                                        description={`Trigger ID: ${trigger.id}`}
                                                                    />
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <SelectionCard
                                                selected={emailRecipientType === "allUsers"}
                                                onClick={() => {
                                                    setEmailRecipientType("allUsers");
                                                }}
                                                title="All Event Users"
                                                description="Send to all users registered for the event"
                                                icon={<Users className="h-5 w-5" />}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {actionType === "notification" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="notificationMessage">Notification Message</Label>
                                        <Textarea
                                            id="notificationMessage"
                                            value={details.message || ""}
                                            onChange={(e) => setDetails({ ...details, message: e.target.value })}
                                            placeholder="Enter notification message"
                                            className="min-h-[120px]"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Recipients</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <SelectionCard
                                                selected={notificationRecipientType === "specific"}
                                                onClick={() => {
                                                    setNotificationRecipientType("specific");
                                                }}
                                                title="Specific User IDs"
                                                description="Send to individual users you specify"
                                                icon={<Users className="h-5 w-5" />}
                                            />
                                            
                                            {notificationRecipientType === "specific" && (
                                                <div className="px-4 py-2 bg-muted/50 rounded-md ml-4 border-l-2 border-primary/30">
                                                    <Input
                                                        id="notificationRecipients"
                                                        value={details.recipients ? (Array.isArray(details.recipients) ? details.recipients.join(", ") : details.recipients) : ""}
                                                        onChange={(e) => setDetails({ 
                                                            ...details, 
                                                            recipients: e.target.value.split(",").map((item: string) => item.trim())
                                                        })}
                                                        placeholder="Enter user IDs, separated by commas"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Enter user IDs separated by commas
                                                    </p>
                                                </div>
                                            )}

                                            {hasRegistrationTrigger && (
                                                <SelectionCard
                                                    selected={notificationRecipientType === "registeredUser"}
                                                    onClick={() => {
                                                        setNotificationRecipientType("registeredUser");
                                                        
                                                        // If there's only one registration trigger, select it automatically
                                                        const registrationTriggers = availableTriggerVariables.filter(v => v.type === 'registration');
                                                        if (registrationTriggers.length === 1) {
                                                            setDetails(prev => ({ ...details, selectedTriggerId: registrationTriggers[0].id }));
                                                        }
                                                    }}
                                                    title="New Registered User"
                                                    description="Send to the user who just registered"
                                                    icon={<Check className="h-5 w-5" />}
                                                />
                                            )}

                                            {notificationRecipientType === "registeredUser" && availableTriggerVariables.filter(v => v.type === 'registration').length > 1 && (
                                                <div className="px-4 py-2 bg-muted/50 rounded-md ml-4 border-l-2 border-primary/30">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="notificationTriggerSelect">Select registration trigger</Label>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {availableTriggerVariables
                                                                .filter(v => v.type === 'registration')
                                                                .map(trigger => (
                                                                    <SelectionCard
                                                                        key={trigger.id}
                                                                        selected={details.selectedTriggerId === trigger.id}
                                                                        onClick={() => setDetails({ ...details, selectedTriggerId: trigger.id })}
                                                                        title={trigger.label}
                                                                        description={`Trigger ID: ${trigger.id}`}
                                                                    />
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <SelectionCard
                                                selected={notificationRecipientType === "allUsers"}
                                                onClick={() => {
                                                    setNotificationRecipientType("allUsers");
                                                }}
                                                title="All Event Users"
                                                description="Send to all users registered for the event"
                                                icon={<Users className="h-5 w-5" />}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {actionType === "statusChange" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="statusValue">Change Event Status To</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <SelectionCard
                                                selected={details.newStatus === "active"}
                                                onClick={() => setDetails({ ...details, newStatus: "active" })}
                                                title="Active"
                                                description="Live event"
                                            />
                                            <SelectionCard
                                                selected={details.newStatus === "cancelled"}
                                                onClick={() => setDetails({ ...details, newStatus: "cancelled" })}
                                                title="Cancelled"
                                                description="Event won't happen"
                                            />
                                            <SelectionCard
                                                selected={details.newStatus === "completed"}
                                                onClick={() => setDetails({ ...details, newStatus: "completed" })}
                                                title="Completed"
                                                description="Event has finished"
                                            />
                                            <SelectionCard
                                                selected={details.newStatus === "archived"}
                                                onClick={() => setDetails({ ...details, newStatus: "archived" })}
                                                title="Archived"
                                                description="Stored for reference"
                                            />
                                            <SelectionCard
                                                selected={details.newStatus === "draft"}
                                                onClick={() => setDetails({ ...details, newStatus: "draft" })}
                                                title="Draft"
                                                description="Work in progress"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The event status will be updated to this value when the flow runs
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === "fileShare" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fileId">File ID</Label>
                                        <Input
                                            id="fileId"
                                            value={details.fileId || ""}
                                            onChange={(e) => setDetails({ ...details, fileId: e.target.value })}
                                            placeholder="Enter file ID"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The ID of the file to modify sharing permissions for
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fileStatus">Share Status</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <SelectionCard
                                                selected={details.status === "private"}
                                                onClick={() => setDetails({ ...details, status: "private" })}
                                                title="Private"
                                                description="Only invited users can access"
                                                icon={<FileText className="h-5 w-5" />}
                                            />
                                            <SelectionCard
                                                selected={details.status === "public"}
                                                onClick={() => setDetails({ ...details, status: "public" })}
                                                title="Public"
                                                description="Anyone can access"
                                                icon={<Globe className="h-5 w-5" />}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The access level for the file
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === "imageChange" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newImage">New Image URL</Label>
                                        <Input
                                            id="newImage"
                                            value={details.newImage || ""}
                                            onChange={(e) => setDetails({ ...details, newImage: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The URL of the new image that will be used for the event
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === "titleChange" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newTitle">New Event Title</Label>
                                        <Input
                                            id="newTitle"
                                            value={details.newTitle || ""}
                                            onChange={(e) => setDetails({ ...details, newTitle: e.target.value })}
                                            placeholder="Enter new title for the event"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The event title will be updated to this value when the flow runs
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === "descriptionChange" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newDescription">New Event Description</Label>
                                        <Textarea
                                            id="newDescription"
                                            value={details.newDescription || ""}
                                            onChange={(e) => setDetails({ ...details, newDescription: e.target.value })}
                                            placeholder="Enter new description for the event"
                                            className="min-h-[120px]"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The event description will be updated to this text when the flow runs
                                        </p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
                
                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {actionType && activeTab === "config" && actionTypes.find(a => a.id === actionType)?.name}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {activeTab === "config" ? (
                            <Button 
                                onClick={handleAddAction}
                                disabled={
                                    (emailRecipientType === "registeredUser" && !details.selectedTriggerId) ||
                                    (notificationRecipientType === "registeredUser" && !details.selectedTriggerId) ||
                                    (actionType === "email" && (!details.subject || !details.body)) ||
                                    (actionType === "notification" && !details.message) ||
                                    (actionType === "statusChange" && !details.newStatus) ||
                                    (actionType === "fileShare" && (!details.fileId || !details.status)) ||
                                    (actionType === "imageChange" && !details.newImage) ||
                                    (actionType === "titleChange" && !details.newTitle) ||
                                    (actionType === "descriptionChange" && !details.newDescription)
                                }
                            >
                                Add Action
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => setActiveTab("config")}
                                disabled={!actionType}
                            >
                                Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}