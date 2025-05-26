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
import { Action, ActionType, EventStatus, Flow, Mail, Trigger, TriggerType } from "@/lib/backend/types";

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
                    <DialogTitle className="text-xl">Trigger hinzufügen</DialogTitle>
                    <DialogDescription>
                        Definiere, wann dieser Automatisierungs-Flow ausgeführt werden soll
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-6 py-4">
                    {/* Left side - Trigger type selection */}
                    <div className="w-1/3 space-y-4 border-r pr-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Trigger-Typ</div>
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
                                <p>Wähle einen Trigger-Typ zur Konfiguration aus</p>
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
                                            <Label>Datumsreferenz</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectionCard
                                                    selected={triggerType === TriggerType.Date}
                                                    onClick={() => {
                                                        setTriggerType(TriggerType.Date);
                                                        setDetails({});
                                                    }}
                                                    icon={<Calendar className="h-5 w-5" />}
                                                    title="Bestimmtes Datum und Uhrzeit"
                                                    description="Trigger an einem exakten Datum"
                                                />
                                                <SelectionCard
                                                    selected={triggerType === TriggerType.RelativeDate}
                                                    onClick={() => {
                                                        setTriggerType(TriggerType.RelativeDate);
                                                        setDetails({});
                                                    }}
                                                    icon={<Clock className="h-5 w-5" />}
                                                    title="Relativ zum Event-Datum"
                                                    description="Trigger vor/nach Event"
                                                />
                                            </div>
                                        </div>

                                        {triggerType === TriggerType.Date ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="dateOperator">Wann soll dieser Trigger ausgelöst werden?</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <SelectionCard
                                                            selected={details.operator === "before"}
                                                            onClick={() => setDetails({ ...details, operator: "before" })}
                                                            title="Vor"
                                                            description="Auslösen vor dem Datum"
                                                        />
                                                        <SelectionCard
                                                            selected={details.operator === "after"}
                                                            onClick={() => setDetails({ ...details, operator: "after" })}
                                                            title="Nach"
                                                            description="Auslösen nach dem Datum"
                                                        />
                                                        <SelectionCard
                                                            selected={details.operator === "on"}
                                                            onClick={() => setDetails({ ...details, operator: "on" })}
                                                            title="Genau am"
                                                            description="Auslösen zum Zeitpunkt"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="dateValue">Zieldatum und -uhrzeit</Label>
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
                                                        Wähle das Datum und die Uhrzeit, die diesen Flow auslösen sollen
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="eventDateReference">Referenzpunkt</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <SelectionCard
                                                            selected={details.reference === "start"}
                                                            onClick={() => setDetails({ ...details, reference: "start" })}
                                                            title="Event-Startdatum"
                                                            description="Verwendet das Startdatum des Events"
                                                        />
                                                        <SelectionCard
                                                            selected={details.reference === "end"}
                                                            onClick={() => setDetails({ ...details, reference: "end" })}
                                                            title="Event-Enddatum"
                                                            description="Verwendet das Enddatum des Events"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="timeDirection">Zeitpunkt</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <SelectionCard
                                                            selected={details.direction === "before"}
                                                            onClick={() => setDetails({ ...details, direction: "before" })}
                                                            title="Vor"
                                                            description="Auslösen vor diesem Datum"
                                                        />
                                                        <SelectionCard
                                                            selected={details.direction === "after"}
                                                            onClick={() => setDetails({ ...details, direction: "after" })}
                                                            title="Nach"
                                                            description="Auslösen nach diesem Datum"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor="timeAmount">Menge</Label>
                                                        <Input
                                                            id="timeAmount"
                                                            type="number"
                                                            min="1"
                                                            value={details.amount || ""}
                                                            onChange={(e) => setDetails({ ...details, amount: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor="timeUnit">Einheit</Label>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            <SelectionCard
                                                                selected={details.unit === "minutes"}
                                                                onClick={() => setDetails({ ...details, unit: "minutes" })}
                                                                title="Minuten"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "hours"}
                                                                onClick={() => setDetails({ ...details, unit: "hours" })}
                                                                title="Stunden"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "days"}
                                                                onClick={() => setDetails({ ...details, unit: "days" })}
                                                                title="Tage"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                            <SelectionCard
                                                                selected={details.unit === "weeks"}
                                                                onClick={() => setDetails({ ...details, unit: "weeks" })}
                                                                title="Wochen"
                                                                size="sm"
                                                                className="flex items-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Beispiel: 2 Tage vor Event-Start
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {triggerType === TriggerType.NumOfAttendees && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Werttyp</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectionCard
                                                    selected={attendeesValueType === "absolute"}
                                                    onClick={() => {
                                                        setAttendeesValueType("absolute");
                                                        setDetails({});
                                                    }}
                                                    icon={<Users className="h-5 w-5" />}
                                                    title="Absolute Anzahl"
                                                    description="Anzahl der tatsächlichen Teilnehmer"
                                                />
                                                <SelectionCard
                                                    selected={attendeesValueType === "percentage"}
                                                    onClick={() => {
                                                        setAttendeesValueType("percentage");
                                                        setDetails({});
                                                    }}
                                                    icon={<Percent className="h-5 w-5" />}
                                                    title="Prozent der Kapazität"
                                                    description="Prozentsatz der maximalen Kapazität"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="attendeesOperator">Bedingung</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <SelectionCard
                                                    selected={details.operator === "equals"}
                                                    onClick={() => setDetails({ ...details, operator: "equals" })}
                                                    title="Gleich"
                                                    description="Exakt übereinstimmend"
                                                />
                                                <SelectionCard
                                                    selected={details.operator === "less"}
                                                    onClick={() => setDetails({ ...details, operator: "less" })}
                                                    title="Weniger als"
                                                    description="Niedriger als Wert"
                                                />
                                                <SelectionCard
                                                    selected={details.operator === "greater"}
                                                    onClick={() => setDetails({ ...details, operator: "greater" })}
                                                    title="Größer als"
                                                    description="Höher als Wert"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="attendeesValue">
                                                {attendeesValueType === "absolute" ? "Anzahl der Teilnehmer" : "Prozentsatz der Kapazität"}
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
                                                    ? "Dieser Flow wird ausgelöst, wenn die Teilnehmerzahl Ihrer Bedingung entspricht"
                                                    : "Dieser Flow wird ausgelöst, wenn der Teilnahmeprozentsatz Ihrer Bedingung entspricht"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {triggerType === TriggerType.Status && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="statusValue">Wenn Status ändert zu</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                         
                                                {Array.from(Object.values(EventStatus)).map((status) => (
                                                    typeof status === "string" && (
                                                        <SelectionCard
                                                            key={status}
                                                            selected={details.newStatus === status}
                                                            onClick={() => setDetails({ ...details, status: status })}
                                                            title={status.charAt(0).toUpperCase() + status.slice(1)}

                                                            // description={`Event-Status auf ${status} ändern`}
                                                        />
                                                    )
                                                ))}
                                                            
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Dieser Flow wird ausgelöst, wenn sich der Event-Status zu Ihrem ausgewählten Wert ändert
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
                                                <h4 className="font-medium">Neue Registrierung</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Dieser Trigger wird aktiviert, wenn sich jemand für Ihr Event registriert.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {triggerType !== null && `Füge einen ${triggerTypes.find(t => t.id === triggerType)?.name} Trigger hinzu`}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
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
                            Trigger hinzufügen
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
            if (!("sendToNewAttendee" in details)) finalDetails.sendToNewAttendee = false;
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
                    <DialogTitle className="text-xl">Aktion hinzufügen</DialogTitle>
                    <DialogDescription>
                        Definiere, was passieren soll, wenn dieser Flow ausgeführt wird
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="my-2">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="" onClick={handleBackToActionTypes}>Aktionstyp auswählen</TabsTrigger>
                        <TabsTrigger value="config" disabled={actionType === null}>Aktion konfigurieren</TabsTrigger>
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
                                Zurück zu den Aktionstypen
                            </Button>
                            <div className="flex-1 text-sm font-medium">
                                Konfiguriere: {actionTypes.find(a => a.id === actionType)?.name}
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
                                        <Label htmlFor="mailId">E-Mail-Vorlage auswählen</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Wählen Sie eine E-Mail-Vorlage aus, die gesendet werden soll, wenn dieser Flow ausgeführt wird
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
                                        <Label htmlFor="statusValue">Event-Status ändern zu</Label>
                                        <div className="grid grid-cols-3 gap-2">

                                            {Array.from(Object.values(EventStatus)).map((status) => (
                                                typeof status === "string" && (
                                                    <SelectionCard
                                                        key={status}
                                                        selected={details.newStatus === status}
                                                        onClick={() => setDetails({ ...details, newStatus: status })}
                                                        title={status.charAt(0).toUpperCase() + status.slice(1)}

                                                        description={`Event-Status auf ${status} ändern`}
                                                    />
                                                )
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Der Event-Status wird auf diesen Wert aktualisiert, wenn der Flow ausgeführt wird
                                        </p>
                                    </div>
                                </div>
                            )}


                            {actionType === ActionType.ChangeImage && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newImage">Neue Bild-URL</Label>
                                        <Input
                                            id="newImage"
                                            value={details.newImage || ""}
                                            onChange={(e) => setDetails({ ...details, newImage: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Die URL des neuen Bildes, das für das Event verwendet wird
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === ActionType.ChangeTitle && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newTitle">Neuer Event-Titel</Label>
                                        <Input
                                            id="newTitle"
                                            value={details.newTitle || ""}
                                            onChange={(e) => setDetails({ ...details, newTitle: e.target.value })}
                                            placeholder="Neuen Titel für das Event eingeben"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Der Event-Titel wird auf diesen Wert aktualisiert, wenn der Flow ausgeführt wird
                                        </p>
                                    </div>
                                </div>
                            )}

                            {actionType === ActionType.ChangeDescription && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newDescription">Neue Event-Beschreibung</Label>
                                        <Textarea
                                            id="newDescription"
                                            value={details.newDescription || ""}
                                            onChange={(e) => setDetails({ ...details, newDescription: e.target.value })}
                                            placeholder="Neue Beschreibung für das Event eingeben"
                                            className="min-h-[120px]"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Die Event-Beschreibung wird auf diesen Text aktualisiert, wenn der Flow ausgeführt wird
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
                            Abbrechen
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
                                Aktion hinzufügen
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setActiveTab("config")}
                                disabled={!actionType}
                            >
                                Fortfahren <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}