"use client";
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
import { createAction, createTrigger, deleteFlow, updateAction, updateFlow, updateTrigger } from "@/lib/backend/event-flows";
import { useEventFlow } from "@/lib/backend/hooks/event-flows";

export default function FlowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Hole die Flow-ID aus den URL-Parametern
    const flowId = Array.isArray(params.flowId) ? params.flowId[0] : params.flowId as string;
    const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId as string;

    const { data: flow, isLoading, error } = eventId ? useEventFlow(session?.user?.organization?.id || "", eventId, flowId, session?.user?.jwt || "") : useOrgFlowTemplate(session?.user?.organization?.id || "", flowId, session?.user?.jwt || "");

    const [isEditing, setIsEditing] = useState(false);

    console.log("error", error);

    // Zeige eine Fehlermeldung, falls der Flow nicht gefunden wurde
    if (!flow && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Flow nicht gefunden</h1>
                <p className="text-muted-foreground mb-6">Der gesuchte Flow existiert nicht.</p>
                <Button asChild>
                    <Link href={`/organization/flows`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zu den Flows
                    </Link>
                </Button>
            </div>
        );
    }

    // Speichert Änderungen am Flow
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
                                name: action.name || "Kein Name",
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
                await Promise.all([metadataPromise, ...triggerPromises, ...actionPromises]);

                updatedFlow.triggers = updatedFlow.triggers?.map(trigger => ({ ...trigger, existInDb: true }));
                updatedFlow.actions = updatedFlow.actions?.map(action => ({ ...action, existInDb: true }));

                queryClient.invalidateQueries({ queryKey: [flowId] });

                toast.success("Flow aktualisiert", {
                    description: "Alle Komponenten des Flows wurden erfolgreich aktualisiert.",
                    duration: 3000,
                });
            } else {
                const metadataPromise = updateFlow(
                    session?.user?.organization?.id || "",
                    flow?.eventId || "",
                    updatedFlow.id,
                    {
                        name: updatedFlow.name,
                        description: updatedFlow.description,
                        updatedBy: session?.user?.id || "",
                        multipleRuns: updatedFlow.multipleRuns,
                    },
                    session?.user?.jwt || ""
                );

                const triggerPromises = (updatedFlow.triggers || []).map(trigger => {
                    if (trigger.existInDb) {
                        return updateTrigger(
                            session?.user?.organization?.id || "",
                            flow?.eventId || "",
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
                        return createTrigger(
                            session?.user?.organization?.id || "",
                            flow?.eventId || "",
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
                        return updateAction(
                            session?.user?.organization?.id || "",
                            flow?.eventId || "",
                            updatedFlow.id,
                            action.id,
                            {
                                name: action.name || "Kein Name",
                                type: action.type,
                                details: action.details,
                                summary: action.description,
                                id: action.id,
                            },
                            session?.user?.jwt || ""
                        );
                    } else {
                        return createAction(
                            session?.user?.organization?.id || "",
                            flow?.eventId || "",
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

                await Promise.all([metadataPromise, ...triggerPromises, ...actionPromises]);

                updatedFlow.triggers = updatedFlow.triggers?.map(trigger => ({ ...trigger, existInDb: true }));
                updatedFlow.actions = updatedFlow.actions?.map(action => ({ ...action, existInDb: true }));

                queryClient.invalidateQueries({ queryKey: [flowId] });

                toast.success("Flow aktualisiert", {
                    description: "Alle Komponenten des Flows wurden erfolgreich aktualisiert.",
                    duration: 3000,
                });
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Fehler beim Aktualisieren des Flows:", error);
            toast.error("Flow konnte nicht aktualisiert werden", {
                description: "Beim Speichern der Änderungen ist ein Fehler aufgetreten. Bitte versuche es erneut.",
                duration: 5000,
            });
        }
    };

    const handleRunFlow = () => {
        toast.error("Flow kann nicht manuell ausgeführt werden", { description: "Diese Funktion ist in Arbeit und bald verfügbar." })
        // toast.info("Flow ausgelöst", {
        //     description: "Der Flow wurde manuell ausgelöst und wird nun ausgeführt.",
        //     duration: 3000,
        // });
    };

    // Löscht den Flow
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

                queryClient.invalidateQueries({ queryKey: [flow.id] })

                toast.success("Flow erfolgreich gelöscht")
                router.push(`/organization/flows`);

            } catch (error) {
                console.error("Fehler beim Löschen des Flows:", error);
                toast.error("Flow konnte nicht gelöscht werden", {
                    description: "Beim Löschen des Flows ist ein Fehler aufgetreten. Bitte versuche es erneut.",
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

                queryClient.invalidateQueries({ queryKey: [flow.eventId] })

                toast.success("Flow erfolgreich gelöscht")
                router.push(`/organization/events/${flow.eventId}?tab=flows`);

            } catch (error) {
                console.error("Fehler beim Löschen des Flows:", error);
                toast.error("Flow konnte nicht gelöscht werden", {
                    description: "Beim Löschen des Flows ist ein Fehler aufgetreten. Bitte versuche es erneut.",
                    duration: 5000,
                });
            }
        }
    };

    // Dupliziert den Flow (noch nicht implementiert)
    const handleDuplicate = () => {
        toast.error("Flow kann nicht dupliziert werden", { description: "Diese Funktion ist in Arbeit und bald verfügbar." })
        // toast.success("Flow dupliziert", {
        //     description: "Eine Kopie dieses Flows wurde erstellt.",
        //     duration: 3000,
        // });
    };

    const createdAtFormatted = format(new Date(flow?.createdAt || 0), "dd. MMMM yyyy 'um' HH:mm");
    const updatedAtFormatted = format(new Date(flow?.updatedAt || 0), "dd. MMMM yyyy 'um' HH:mm");

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
                <BreadcrumbItem>
                    {flow ?
                        <BreadcrumbPage>{flow?.name}</BreadcrumbPage> :
                        <BreadcrumbPage><Skeleton className="w-60 h-6" /></BreadcrumbPage>}
                </BreadcrumbItem>
            </SiteHeader>

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">

                {flow ?
                    <Tabs defaultValue="overview" className="space-y-4 ">
                        <TabsList className="grid grid-cols-3 w-full mx-auto bg-muted">
                            <TabsTrigger value="overview">Übersicht</TabsTrigger>
                            <TabsTrigger value="logs">Ausführungsprotokolle</TabsTrigger>
                            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
                        </TabsList>

                        {/* Übersicht-Tab – Gemeinsames Flow-Formular */}
                        <TabsContent value="overview" className="space-y-4">
                            <FlowForm
                                flow={flow}
                                isEditing={isEditing}
                                onSave={handleSave}
                            />
                        </TabsContent>

                        {/* Protokolle-Tab */}
                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ausführungsprotokolle</CardTitle>
                                    <CardDescription>Verlauf der Flow-Ausführungen und deren Ergebnisse</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <div className="font-medium">Letzte Ausführungen</div>
                                            <Button variant="outline" size="sm">
                                                <HistoryIcon className="mr-2 h-4 w-4" />
                                                Alle anzeigen
                                            </Button>
                                        </div>
                                        <div className="p-4 text-center text-muted-foreground">
                                            Keine aktuellen Ausführungen für diesen Flow gefunden.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Einstellungen-Tab */}
                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Flow-Einstellungen
                                        <Badge variant="outline" className="mt-0.5 text-xs cursor-pointer" onClick={(e) => {
                                            e.stopPropagation();
                                            // Kopiere Flow-ID in die Zwischenablage
                                            navigator.clipboard.writeText(flow.id).then(() => {
                                                toast.success("Flow-ID in die Zwischenablage kopiert", {
                                                    description: "Du kannst sie jetzt überall einfügen.",
                                                    duration: 3000,
                                                });
                                            });
                                        }}>
                                            ID: {flow.id}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>Erweiterte Einstellungen für diesen Flow konfigurieren</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">

                                    <div className="space-y-2">
                                        <Label htmlFor="retention">Protokoll-Aufbewahrung (Tage)</Label>
                                        <Input
                                            id="retention"
                                            type="number"
                                            defaultValue="30"
                                            disabled={!isEditing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Ausführungsprotokolle werden so viele Tage gespeichert.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeout">Ausführungs-Timeout (Sekunden)</Label>
                                        <Input
                                            id="timeout"
                                            type="number"
                                            defaultValue="60"
                                            disabled={!isEditing}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximale Ausführungszeit für den Flow, bevor abgebrochen wird.
                                        </p>
                                    </div>

                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <div className="font-medium text-destructive mb-2">Gefahrenzone</div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Die folgenden Aktionen sind destruktiv und können nicht rückgängig gemacht werden.
                                        </p>
                                        <ConfirmationButton
                                            variant="destructive"
                                            onConfirm={handleDelete}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Flow löschen
                                        </ConfirmationButton>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <p className="text-muted-foreground">
                                        Erstellt von {flow.createdBy} • Zuletzt geändert am {updatedAtFormatted}
                                    </p>
                                    <Button
                                        variant="default"
                                        disabled={!isEditing}
                                        onClick={() => handleSave(flow)}
                                        className="ml-auto"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Einstellungen speichern
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