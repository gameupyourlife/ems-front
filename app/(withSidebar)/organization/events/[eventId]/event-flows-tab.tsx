"use client";;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, FunctionSquare, Zap, Plus, Copy } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { EventDetails } from "@/lib/types-old";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getActionDescription, getActionIcon, getTriggerDescription, getTriggerIcon } from "@/lib/flows/utils";
import { useEventFlows } from "@/lib/backend/hooks/event-flows";
import { useSession } from "next-auth/react";
import { useOrgFlowTemplates } from "@/lib/backend/hooks/org-flows";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { FlowTemplateResponseDto } from "@/lib/backend/types";

// Schnittstelle für Flow-Ausführungen (Runs)
interface FlowRun {
    id: string;
    flowId: string;
    flowName: string;
    status: "success" | "failed" | "running";
    startedAt: Date;
    completedAt?: Date;
    triggerType: string;
    actions: {
        type: string;
        status: "success" | "failed" | "skipped" | "running";
        details: string;
    }[];
    error?: string;
}

// Beispiel-Daten für Flow-Ausführungen
const mockFlowRuns: FlowRun[] = [
    {
        id: "run-1",
        flowId: "flow-1",
        flowName: "Registration Confirmation",
        status: "success",
        startedAt: new Date("2023-10-18T14:23:12"),
        completedAt: new Date("2023-10-18T14:23:15"),
        triggerType: "registration",
        actions: [
            {
                type: "email",
                status: "success",
                details: "Email sent to john.doe@example.com"
            }
        ]
    },
    {
        id: "run-2",
        flowId: "flow-2",
        flowName: "Reminder Before Event",
        status: "success",
        startedAt: new Date("2023-10-19T08:00:03"),
        completedAt: new Date("2023-10-19T08:00:08"),
        triggerType: "schedule",
        actions: [
            {
                type: "email",
                status: "success",
                details: "Reminder emails sent to 24 recipients"
            }
        ]
    },
    {
        id: "run-3",
        flowId: "flow-3",
        flowName: "Post-Event Feedback",
        status: "failed",
        startedAt: new Date("2023-10-20T17:00:01"),
        completedAt: new Date("2023-10-20T17:00:04"),
        triggerType: "event",
        actions: [
            {
                type: "email",
                status: "failed",
                details: "Failed to send emails"
            }
        ],
        error: "Email server error: Connection refused"
    },
    {
        id: "run-4",
        flowId: "flow-1",
        flowName: "Registration Confirmation",
        status: "running",
        startedAt: new Date(),
        triggerType: "registration",
        actions: [
            {
                type: "email",
                status: "running",
                details: "Sending email to new registrant"
            }
        ]
    }
];

export default function EventFlowsTab({ eventDetails }: { eventDetails: EventDetails }) {
    const eventId = eventDetails.metadata.id;
    console.log("Event-ID:", eventId);

    const [activeTab, setActiveTab] = useState<string>("instances");
    // const [flowRuns, setFlowRuns] = useState<FlowRun[]>(mockFlowRuns);
    const [createFlowDialogOpen, setCreateFlowDialogOpen] = useState(false);
    const router = useRouter();

    const { data: session } = useSession();
    const { data: flows, isLoading, isError } = useEventFlows(session?.user?.organization.id || "", eventId, session?.user?.jwt || "");
    const { data: flowTemplates } = useOrgFlowTemplates(session?.user?.organization.id || "", session?.user?.jwt || "");

    console.log("Flows:", flows);
    console.log("Flow-Vorlagen:", flowTemplates);

    // Handler für das Erstellen eines Flows aus einer Vorlage
    const handleCreateFromTemplate = (templateId: string) => {
        router.push(`/organization/events/${eventId}/flows/create?eventId=${eventId}&templateId=${templateId}`);
        setCreateFlowDialogOpen(false);
    };

    // Handler für das Erstellen eines neuen Flows von Grund auf
    const handleCreateFromScratch = () => {
        router.push(`/organization/events/${eventId}/flows/create?eventId=${eventId}`);
        setCreateFlowDialogOpen(false);
    };

    // Gibt ein Status-Badge für den Flow-Status zurück
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="outline" className="bg-green-50 text-green-800">Erfolgreich</Badge>;
            case 'failed':
                return <Badge variant="outline" className="bg-red-50 text-red-800">Fehlgeschlagen</Badge>;
            case 'running':
                return <Badge variant="outline" className="bg-blue-50 text-blue-800">Läuft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <FunctionSquare className="h-5 w-5 text-primary" />
                    Event-Automatisierung
                </CardTitle>
                <CardDescription>
                    Flows für diese Veranstaltung
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* <TabsList className="mb-4">
                        <TabsTrigger value="instances" className="flex items-center gap-2">
                            <FunctionSquare className="h-4 w-4" />
                            Flows
                        </TabsTrigger>
                        <TabsTrigger value="runs" className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          Flow-Ausführungen
                      </TabsTrigger>
                    </TabsList> */}

                    <TabsContent value="instances" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">Flows ({flows?.length || 0})</h3>
                                <p className="text-sm text-muted-foreground">Automatisierungen, die auf Event-Auslösern basieren</p>
                            </div>
                            <CreateNewFlowButton
                                createFlowDialogOpen={createFlowDialogOpen}
                                setCreateFlowDialogOpen={setCreateFlowDialogOpen}
                                handleCreateFromScratch={handleCreateFromScratch}
                                flowTemplates={flowTemplates}
                                handleCreateFromTemplate={handleCreateFromTemplate}
                            />
                        </div>

                        <Separator className="my-2" />

                        {(flows?.length || 0) > 0 ? (
                            <div className="space-y-6">
                                {flows?.map((flow) => (
                                    <div
                                        key={flow.id}
                                        className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-4 bg-primary/5 border-b flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <FunctionSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{flow.name}</h4>
                                                    <p className="text-xs text-muted-foreground">{flow.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-background">
                                                    {flow.triggers?.length} {flow.triggers?.length === 1 ? 'Auslöser' : 'Auslöser'}
                                                </Badge>
                                                <Badge variant="outline" className="bg-background">
                                                    {flow.actions?.length} {flow.actions?.length === 1 ? 'Aktion' : 'Aktionen'}
                                                </Badge>
                                                <Button variant="ghost" size="sm" asChild className="ml-2">
                                                    <Link href={`/organization/events/${eventId}/flows/${flow.id}?eventId=${eventId}`}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Bearbeiten
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Auslöser-Spalte */}
                                                <div className="space-y-3">
                                                    <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                                                        <Zap className="h-4 w-4" />
                                                        WENN DIESE AUSLÖSER AUFTRETEN
                                                    </h5>

                                                    <div className="space-y-3">
                                                        {flow.triggers?.map((trigger) => (
                                                            <div
                                                                key={trigger.id}
                                                                className="flex items-start gap-3 p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                                                            >
                                                                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                                    {getTriggerIcon(trigger.type)}
                                                                </div>
                                                                <div>
                                                                    <h6 className="font-medium capitalize">{trigger.type} Auslöser</h6>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {getTriggerDescription(trigger.type, trigger.details)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Aktionen-Spalte */}
                                                <div className="space-y-3">
                                                    <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3 pb-1 border-b">
                                                        <FunctionSquare className="h-4 w-4" />
                                                        DANN FÜHRE DIESE AKTIONEN AUS
                                                    </h5>

                                                    <div className="space-y-3">
                                                        {flow.actions?.map((action) => (
                                                            <div
                                                                key={action.id}
                                                                className="flex items-start gap-3 p-3 border rounded-md bg-muted/20 hover:bg-muted/30 transition-colors"
                                                            >
                                                                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                                    {getActionIcon(action.type)}
                                                                </div>
                                                                <div>
                                                                    <h6 className="font-medium capitalize">{action.type} Aktion</h6>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {getActionDescription(action.type, action.details)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (

                            isLoading ? (
                                <div className="flex items-center justify-center py-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 animate-spin">
                                        <FunctionSquare className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                </div>
                            ) : (

                                isError ? (
                                    <div className="flex items-center justify-center py-8 text-center">
                                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                            <FunctionSquare className="h-6 w-6 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-medium">Fehler beim Laden der Flows</h3>
                                        <p className="text-sm text-red-600 max-w-sm mt-1">
                                            Bitte versuche es später erneut
                                        </p>
                                    </div>
                                ) :

                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <FunctionSquare className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium">Noch keine Flows hinzugefügt</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                                            Erstelle Automatisierungs-Flows, um E-Mails zu versenden, den Event-Status zu ändern und mehr
                                        </p>
                                        <CreateNewFlowButton
                                            createFlowDialogOpen={createFlowDialogOpen}
                                            setCreateFlowDialogOpen={setCreateFlowDialogOpen}
                                            handleCreateFromScratch={handleCreateFromScratch}
                                            flowTemplates={flowTemplates}
                                            handleCreateFromTemplate={handleCreateFromTemplate}
                                        />
                                    </div>
                            ))}
                    </TabsContent>
                    {/* ...auskommentierter Bereich bleibt unverändert... */}
                </Tabs>
            </CardContent>
        </Card>
    );
}

// Button-Komponente zum Erstellen eines neuen Flows
function CreateNewFlowButton({ createFlowDialogOpen, setCreateFlowDialogOpen, handleCreateFromScratch, flowTemplates, handleCreateFromTemplate }: { createFlowDialogOpen: boolean, setCreateFlowDialogOpen: (open: boolean) => void, handleCreateFromScratch: () => void, flowTemplates: FlowTemplateResponseDto[] | undefined, handleCreateFromTemplate: (templateId: string) => void }) {

    return (

        <Dialog open={createFlowDialogOpen} onOpenChange={setCreateFlowDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="mt-4">
                    <FunctionSquare className="h-4 w-4 mr-2" />
                    Flow hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Neuen Flow erstellen</DialogTitle>
                    <DialogDescription>
                        Wähle aus, wie du deinen neuen Automatisierungsflow erstellen möchtest
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                    <Button
                        onClick={handleCreateFromScratch}
                        variant="outline"
                        className="flex items-start justify-start gap-3 h-auto p-4 text-left"
                    >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">Von Grund auf neu erstellen</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Beginne mit einem leeren Flow und baue ihn selbst auf
                            </p>
                        </div>
                    </Button>

                    {flowTemplates && flowTemplates.length > 0 ? (
                        <>
                            <Separator />
                            <div className="text-sm font-medium">Oder verwende eine Vorlage:</div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {flowTemplates.map((template) => (
                                    <Button
                                        key={template.id}
                                        onClick={() => handleCreateFromTemplate(template.id)}
                                        variant="outline"
                                        className="flex items-start justify-start gap-3 h-auto p-4 text-left w-full"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Copy className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{template.name}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {template.description || "Keine Beschreibung vorhanden"}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {(template.triggers?.length || 0) > 0 && (
                                                    <Badge variant="outline" className="bg-background text-xs">
                                                        {template.triggers?.length} {template.triggers?.length === 1 ? 'Auslöser' : 'Auslöser'}
                                                    </Badge>
                                                )}
                                                {(template.actions?.length || 0) > 0 && (
                                                    <Badge variant="outline" className="bg-background text-xs">
                                                        {template.actions?.length} {template.actions?.length === 1 ? 'Aktion' : 'Aktionen'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    )
}
