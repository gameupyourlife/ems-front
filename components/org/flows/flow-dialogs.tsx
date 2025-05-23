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
    Mail as MailIcon,
    Clock,
    AlertCircle,
    ChevronRight,
    Percent,
    ChevronLeft,
    LayoutList,
    PencilLine,
    Image,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SelectionCard } from "@/components/selection-card";
import { Action, ActionType, Flow, Mail, Trigger, TriggerType } from "@/lib/backend/types";

// Aktionen-Typen mit Icons und Beschreibungen
const actionTypes = [
    {
        id: ActionType.SendEmail,
        name: "E-Mail senden",
        description: "Versendet eine E-Mail-Benachrichtigung",
        icon: <MailIcon className="h-5 w-5" />
    },
    {
        id: ActionType.ChangeStatus,
        name: "Status ändern",
        description: "Aktualisiert den Event-Status",
        icon: <Tag className="h-5 w-5" />
    },
    {
        id: ActionType.ChangeImage,
        name: "Bild aktualisieren",
        description: "Ändert das Event-Bild",
        icon: <Image className="h-5 w-5" />
    },
    {
        id: ActionType.ChangeTitle,
        name: "Titel ändern",
        description: "Aktualisiert den Event-Titel",
        icon: <LayoutList className="h-5 w-5" />
    },
    {
        id: ActionType.ChangeDescription,
        name: "Beschreibung ändern",
        description: "Aktualisiert die Event-Beschreibung",
        icon: <PencilLine className="h-5 w-5" />
    }
];



// Komponente zum Hinzufügen eines neuen Triggers (Bedingung)
export function AddTriggerDialog({
    open,
    onOpenChange,
    onAdd,
    existingFlow,
    itemToEdit
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (triggerType: TriggerType, details: any) => void;
    existingFlow?: Flow;
    itemToEdit?: Trigger;
}) {
    const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
    const [details, setDetails] = useState<any>({});
    const [attendeesValueType, setAttendeesValueType] = useState<string>("absolute");

    // Prüft, ob bereits ein Registrierungstrigger existiert
    const registrationTriggerExists = useMemo(() => {
        return existingFlow?.triggers?.some(t => t.type === TriggerType.Registration && (!itemToEdit || t.id !== itemToEdit.id));
    }, [existingFlow, itemToEdit]);

    // Trigger-Typen mit Icons und Beschreibungen
    const triggerTypes = [
        {
            id: TriggerType.Date,
            name: "Datum & Uhrzeit",
            description: "Löst zu einem bestimmten Datum und Uhrzeit aus",
            icon: <Calendar className="h-5 w-5" />
        },
        {
            id: TriggerType.RelativeDate,
            name: "Relatives Datum & Uhrzeit",
            description: "Löst relativ zum Event-Datum aus",
            icon: <Calendar className="h-5 w-5" />
        },
        {
            id: TriggerType.NumOfAttendees,
            name: "Teilnehmeranzahl",
            description: "Löst aus, wenn eine bestimmte Teilnehmerzahl erreicht wird",
            icon: <Users className="h-5 w-5" />
        },
        {
            id: TriggerType.Status,
            name: "Statusänderung",
            description: "Löst aus, wenn sich der Event-Status ändert",
            icon: <Tag className="h-5 w-5" />
        },
        {
            id: TriggerType.Registration,
            name: "Neue Registrierung",
            description: "Löst aus, wenn sich jemand für das Event registriert",
            icon: <Check className="h-5 w-5" />,
            disabled: registrationTriggerExists,
        }
    ];

    // Initialisiert das Formular beim Bearbeiten eines bestehenden Triggers
    useEffect(() => {
        if (open && itemToEdit) {
            setTriggerType(itemToEdit.type);
            setDetails(itemToEdit.details || {});

            if (itemToEdit.type === TriggerType.NumOfAttendees && itemToEdit.details) {
                // Bestimmt den Werttyp (Prozent oder absolut)
                const isPercentage = itemToEdit.details.value <= 100 &&
                    (itemToEdit.details.valueType === "percentage" ||
                        itemToEdit.details.unit === "%");
                setAttendeesValueType(isPercentage ? "percentage" : "absolute");
            }
        }
    }, [open, itemToEdit]);

    // Setzt den Zustand zurück, wenn der Dialog geschlossen wird
    useEffect(() => {
        if (!open && !itemToEdit) {
            setTimeout(() => {
                setTriggerType(null);
                setDetails({});
                setAttendeesValueType("absolute");
            }, 300); // Kleine Verzögerung, um visuelle Fehler bei der Animation zu vermeiden
        }
    }, [open, itemToEdit]);

    // Fügt einen neuen Trigger hinzu
    const handleAddTrigger = () => {
        if (triggerType === null) return;

        onAdd(triggerType, details);
        onOpenChange(false);
        // Das Formular wird beim Schließen des Dialogs zurückgesetzt
    };

    // Setzt Details zurück, wenn sich der Trigger-Typ ändert
    useEffect(() => {
        setDetails({});

        if (triggerType === TriggerType.NumOfAttendees) {
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
                        {triggerType === null && (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                                <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground/70" />
                                <p>Select a trigger type to configure</p>
                            </div>
                        )}

                        {triggerType !== null && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {triggerTypes.find(t => t.id === triggerType)?.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {triggerTypes.find(t => t.id === triggerType)?.description}
                                    </p>
                                </div>

                                {triggerType}

                                <Separator />

                                {(triggerType === TriggerType.Date || triggerType === TriggerType.RelativeDate) && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Date Reference</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectionCard
                                                    selected={triggerType === TriggerType.Date}
                                                    onClick={() => {
                                                        setTriggerType(TriggerType.Date);
                                                        setDetails({});
                                                    }}
                                                    icon={<Calendar className="h-5 w-5" />}
                                                    title="Specific date and time"
                                                    description="Trigger on an exact date"
                                                />
                                                <SelectionCard
                                                    selected={triggerType === TriggerType.RelativeDate}
                                                    onClick={() => {
                                                        setTriggerType(TriggerType.RelativeDate);
                                                        setDetails({});
                                                    }}
                                                    icon={<Clock className="h-5 w-5" />}
                                                    title="Relative to event date"
                                                    description="Trigger before/after event"
                                                />
                                            </div>
                                        </div>

                                        {triggerType === TriggerType.Date ? (
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

                                {triggerType === TriggerType.NumOfAttendees && (
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

                                {triggerType === TriggerType.Status && (
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

                                {triggerType === TriggerType.Registration && (
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
                        {triggerType !== null && `Adding a ${triggerTypes.find(t => t.id === triggerType)?.name} trigger`}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTrigger}
                            disabled={
                                triggerType === null ||
                                (triggerType !== TriggerType.Registration && Object.keys(details).length === 0) ||
                                (triggerType === TriggerType.Date && (!details.operator || !details.value)) ||
                                (triggerType === TriggerType.RelativeDate && (!details.reference || !details.direction || !details.amount || !details.unit)) ||
                                (triggerType === TriggerType.NumOfAttendees && (!details.operator || details.value === undefined))
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
    existingFlow,
    itemToEdit,
    mails
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (actionType: ActionType, details: any) => void;
    existingFlow?: Flow;
    itemToEdit?: Action | undefined | null;
    mails: Mail[] | undefined;
}) {
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [details, setDetails] = useState<any>({});
    const [availableTriggerVariables, setAvailableTriggerVariables] = useState<{ id: string, type: TriggerType, label: string, variables?: string[] }[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");

    // Parse existing triggers to create available variables
    useEffect(() => {
        if (existingFlow?.triggers) {
            const variables = existingFlow.triggers.map(trigger => {
                let label = '';
                switch (trigger.type) {
                    case TriggerType.Registration:
                        label = 'New Registered User';
                        return {
                            id: trigger.id,
                            type: trigger.type,
                            label: label,
                            variables: ['email', 'name', 'userId']
                        };
                    case TriggerType.Date:
                    case TriggerType.RelativeDate:
                        label = 'Date Trigger';
                        return {
                            id: trigger.id,
                            type: trigger.type,
                            label: label
                        };
                    case TriggerType.NumOfAttendees:
                        label = 'Attendees Count Trigger';
                        return {
                            id: trigger.id,
                            type: trigger.type,
                            label: label
                        };
                    case TriggerType.Status:
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

    // Initialize form when editing an existing action6
    useEffect(() => {
        if (open && itemToEdit) {
            setActionType(itemToEdit.type);
            setDetails(itemToEdit.details || {});
            setActiveTab("config");
        }
    }, [open, itemToEdit]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open && !itemToEdit) {
            // Reset all states when dialog is closed
            setTimeout(() => {
                setActionType(null);
                setDetails({});
                setActiveTab("");
            }, 300); // Small delay to avoid visual glitches during animation
        }
    }, [open, itemToEdit]);

    // Effect to update titles and buttons when editing
    useEffect(() => {
        // Only reset details when action type changes if we're not editing an item
        if (!itemToEdit) {
            // Reset details when action type changes
            setDetails({});

        }

        // Set active tab based on action type
        if (actionType !== null) {
            setActiveTab("config");
        } else {
            setActiveTab("");
        }
    }, [actionType, itemToEdit]);

    // Handle going back to action type selection
    const handleBackToActionTypes = () => {
        setActiveTab("");
        // Don't reset the action type yet to keep it visually selected
    };

    const handleAddAction = () => {
        if (actionType === null) return;

        // Prepare the details based on recipient types for email and notification
        let finalDetails = { ...details };

        if (actionType === ActionType.SendEmail) {
            if(!("sendToNewAttendee" in details)) finalDetails.sendToNewAttendee = false;
        }

        onAdd(actionType, finalDetails);
        onOpenChange(false);
    };

    // Helper to check if a registration trigger exists
    const hasRegistrationTrigger = useMemo(() => {
        return availableTriggerVariables.some(v => v.type === TriggerType.Registration);
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
                        <TabsTrigger value="config" disabled={actionType === null}>Configure Action</TabsTrigger>
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

                    <TabsContent value="config" className="py-4 ">
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

                        <ScrollArea className="max-h-[calc(100vh-370px)] overflow-auto">
                            {actionType === ActionType.SendEmail && (
                                <>
                                    {existingFlow?.triggers?.some(t => t.type === TriggerType.Registration) && <div className="space-y-2">
                                        <Label htmlFor="mailId">Neuer Teilnehmer als Empfänger?</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Wählen Sie diese Option, wenn Sie diese E-Mail an den neuen Teilnehmer senden möchten, der sich für die Veranstaltung registriert hat.
                                        </p>

                                        <SelectionCard
                                            selected={details.sendToNewAttendee}
                                            onClick={() => setDetails({ ...details, sendToNewAttendee: true })}
                                            title="Ja"
                                            description="E-Mail an den neuen Teilnehmer senden. Die in der Mail-Vorlage angegebenen Empfänger werden ignoriert."
                                        />
                                        <SelectionCard
                                            selected={!details.sendToNewAttendee}
                                            onClick={() => setDetails({ ...details, sendToNewAttendee: false })}
                                            title="Nein"
                                            description="E-Mail standart Empfänger verwenden"
                                        />
                                    </div>}


                                    <div className="space-y-2">
                                        <Label htmlFor="mailId">Select Mail Template</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Choose a mail template to send when this flow runs
                                        </p>


                                        {mails?.map((mail) => (
                                            <Card
                                                key={mail.id}
                                                className={cn(
                                                    "border cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                                                    details.mailId === mail.id && "border-primary bg-primary/5"
                                                )}
                                                onClick={() => {
                                                    setDetails((old: any) => ({ ...old, mailId: mail.id }));
                                                }}
                                            >
                                                <CardContent className="p-4 space-y-2">
                                                    <div className={cn(
                                                        "p-2 w-10 h-10 rounded-full flex items-center justify-center",
                                                        "bg-muted"
                                                    )}>
                                                        <MailIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-sm">{mail.name}</h3>
                                                        <p className="text-xs text-muted-foreground">{mail.description}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                        ))}
                                    </div>

                                </>
                            )}

                            {actionType === ActionType.ChangeStatus && (
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


                            {actionType === ActionType.ChangeImage && (
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

                            {actionType === ActionType.ChangeTitle && (
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

                            {actionType === ActionType.ChangeDescription && (
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
                                    (actionType === ActionType.SendEmail && !details.mailId) ||
                                    (actionType === ActionType.ChangeStatus && !details.newStatus) ||
                                    (actionType === ActionType.ChangeImage && !details.newImage) ||
                                    (actionType === ActionType.ChangeTitle && !details.newTitle) ||
                                    (actionType === ActionType.ChangeDescription && !details.newDescription)
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