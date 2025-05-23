"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, SaveIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlowForm } from "@/components/org/flows/flow-form";
import { SiteHeader } from "@/components/site-header";
import { QuickAction } from "@/components/dynamic-quick-actions";
import { Flow } from "@/lib/backend/types";
import { useSession } from "next-auth/react";
import { createOrgFlowTemplate, createOrgFlowTemplateAction, createOrgFlowTemplateTrigger, getOrgFlowTemplate } from "@/lib/backend/org-flows";
import LoadingSpinner from "@/components/loading-spinner";
import { createAction, createFlow, createTrigger } from "@/lib/backend/event-flows";

export default function CreateFlowPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');
    const eventId = searchParams.get('eventId');

    // State-Variablen
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(!!templateId);
    const [flow, setFlow] = useState<Flow | null>(null);

    // Initialisiere mit leerer Flow-Vorlage oder lade aus Vorlage
    useEffect(() => {
        // Standardmäßig eine neue leere Flow-Vorlage erstellen
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
            isTemplate: false,
            isActive: false,
            multipleRuns: false,
            stillPending: false,
        };

        // Falls templateId vorhanden, lade die Vorlage
        if (templateId && session?.user?.organization?.id) {
            setIsLoading(true);
            getOrgFlowTemplate(session.user.organization.id, templateId, session.user.jwt || "")
                .then(templateFlow => {
                    // Kopie der Vorlage mit angepassten Eigenschaften erstellen
                    const newFlow: Flow = {
                        ...templateFlow,
                        id: "", // ID leeren, da es ein neuer Flow ist
                        name: `Kopie von ${templateFlow.name}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        createdBy: session?.user?.id || "Unbekannt",
                        updatedBy: session?.user?.id || "Unbekannt",
                        existInDb: false,
                        eventId: eventId || "",
                        isTemplate: false,
                    };
                    setFlow(newFlow);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Fehler beim Laden der Vorlage:", error);
                    toast.error("Vorlage konnte nicht geladen werden", {
                        description: "Beim Laden der Vorlage ist ein Fehler aufgetreten. Es wird stattdessen ein leerer Flow erstellt.",
                        duration: 3000,
                    });
                    setFlow(emptyFlow);
                    setIsLoading(false);
                });
        } else {
            setFlow(emptyFlow);
        }
    }, [templateId, session]);

    // Funktion zum Erstellen eines Flows
    const handleCreateFlow = async (flow: Flow) => {
        setIsCreating(true);

        try {
            if (flow.isTemplate) {
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
                );

                // Alle Trigger gleichzeitig erstellen
                const createdTriggers = Promise.all(
                    (flow.triggers || []).map(trigger =>
                        createOrgFlowTemplateTrigger(
                            session?.user?.organization?.id || "",
                            createdFlow.id,
                            {
                                flowId: createdFlow.id,
                                type: trigger.type,
                                details: trigger.details,
                                name: trigger.name || "Kein Name",
                                summary: trigger.description || "Keine Beschreibung",
                            },
                            session?.user?.jwt || ""
                        )
                    )
                );

                // Alle Aktionen gleichzeitig erstellen
                const createdActions = Promise.all(
                    (flow.actions || []).map(action =>
                        createOrgFlowTemplateAction(
                            session?.user?.organization?.id || "",
                            createdFlow.id,
                            {
                                flowId: createdFlow.id,
                                type: action.type,
                                details: action.details,
                                name: action.name || "Kein Name",
                                summary: action.description || "Keine Beschreibung",
                            },
                            session?.user?.jwt || ""
                        )
                    )
                );

                await Promise.all([createdTriggers, createdActions]);

                toast.success("Flow erstellt", {
                    description: "Ihr Flow wurde erfolgreich erstellt und ist jetzt einsatzbereit.",
                    duration: 3000,
                });

                // Weiterleitung zur passenden Seite
                setTimeout(() => {
                    if (eventId) {
                        router.push(`/organization/events/${eventId}`);
                    } else {
                        router.push('/organization/flows');
                    }
                }, 1500);
            } else {
                const createdFlow = await createFlow(
                    session?.user?.organization?.id || "",
                    eventId || "",
                    {
                        createdBy: flow.createdBy,
                        description: flow.description || "",
                        name: flow.name,
                        multipleRuns: flow.multipleRuns || false,
                        stillPending: flow.stillPending || false,
                        // createdAt: flow.createdAt,
                        // updatedAt: flow.updatedAt,
                        // updatedBy: flow.updatedBy,
                        // organizationId: session?.user?.organization?.id || "",
                    },
                    session?.user?.jwt || "",
                );

                // Alle Trigger gleichzeitig erstellen
                const createdTriggers = Promise.all(
                    (flow.triggers || []).map(trigger =>
                        createTrigger(
                            session?.user?.organization?.id || "",
                            eventId || "",
                            createdFlow.id,
                            {
                                flowId: createdFlow.id,
                                type: trigger.type,
                                details: trigger.details,
                                name: trigger.name || "Kein Name",
                                summary: trigger.description || "Keine Beschreibung",
                            },
                            session?.user?.jwt || ""
                        )
                    )
                );

                // Alle Aktionen gleichzeitig erstellen
                const createdActions = Promise.all(
                    (flow.actions || []).map(action =>
                        createAction(
                            session?.user?.organization?.id || "",
                            eventId || "",
                            createdFlow.id,
                            {
                                flowId: createdFlow.id,
                                type: action.type,
                                details: action.details,
                                name: action.name || "Kein Name",
                                summary: action.description || "Keine Beschreibung",
                            },
                            session?.user?.jwt || ""
                        )
                    )
                );

                await Promise.all([createdTriggers, createdActions]);

                toast.success("Flow erstellt", {
                    description: "Ihr Flow wurde erfolgreich erstellt und ist jetzt einsatzbereit.",
                    duration: 3000,
                });

                // Weiterleitung zur passenden Seite
                setTimeout(() => {
                    if (eventId) {
                        router.push(`/organization/events/${eventId}`);
                    } else {
                        router.push('/organization/flows');
                    }
                }, 1500);
            }
        } catch (error) {
            toast.error("Flow konnte nicht erstellt werden", {
                description: "Beim Erstellen des Flows ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
                duration: 3000,
            });
        } finally {
            setIsCreating(false);
        }
    };

    const quickActions: QuickAction[] = [
        {
            label: "Zurück",
            onClick: () => eventId ? router.push(`/organization/events/${eventId}`) : router.push(`/organization/flows`),
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: "outline",
        },
        {
            label: "Flow speichern",
            onClick: () => { }, // Wird vom Formular gehandhabt
            icon: <SaveIcon className="h-4 w-4" />,
        },
    ];

    if (isLoading) {
        return (
            <>
                <SiteHeader actions={quickActions} />
                <div className="flex flex-1 flex-col items-center justify-center space-y-6 p-4 md:p-6">
                    <LoadingSpinner />
                    <p className="text-muted-foreground">Vorlage wird geladen...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <SiteHeader actions={quickActions} />

            <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
                {flow && (
                    <FlowForm
                        flow={flow}
                        isEditing={true}
                        onSave={handleCreateFlow}
                        isCreating={isCreating}
                    />
                )}
            </div>
        </>
    );
}