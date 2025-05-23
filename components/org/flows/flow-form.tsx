"use client";;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddActionDialog, AddTriggerDialog } from "@/components/org/flows/flow-dialogs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
    formatDetailsLabel,
    formatDetailsValue,
    getActionIcon,
    getActionSummary,
    getActionTitle,
    getTriggerIcon,
    getTriggerSummary,
    getTriggerTitle,
} from "@/lib/flows/utils";
import { Action, ActionType, Flow, Trigger, TriggerType } from "@/lib/backend/types";
import { deleteOrgFlowTemplateTrigger } from "@/lib/backend/org-flows";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTrigger } from "@/lib/backend/event-flows";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useMails } from "@/lib/backend/hooks/use-mails";
import { useMailTemplates } from "@/lib/backend/hooks/use-mail-templates";









interface FlowFormProps {
    flow: Flow;
    isEditing: boolean;
    onSave: (flow: Flow) => void;
    isCreating?: boolean;
}

// Hauptformular-Komponente für Flows
export function FlowForm({ flow, isEditing, onSave, isCreating = false }: FlowFormProps) {
    const [editedFlow, setEditedFlow] = useState<Flow>(flow);
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const { data: mails } = flow.isTemplate ? useMailTemplates(session?.user?.organization.id || "", session?.user?.jwt || "") : useMails(session?.user?.organization.id || "", flow.eventId || "", session?.user?.jwt || "")

    // State for dialog control
    const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);
    const [isAddActionOpen, setIsAddActionOpen] = useState(false);
    const [editItemId, setEditItemId] = useState<string | null>(null);
    const [editItemType, setEditItemType] = useState<'trigger' | 'action' | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean,
        itemId: string | null,
        itemType: 'trigger' | 'action' | null
    }>({ open: false, itemId: null, itemType: null });

    // Handler zum Hinzufügen eines neuen Triggers oder Bearbeiten eines bestehenden
    const handleAddTrigger = (triggerType: TriggerType, details: any) => {
        if (editItemId && editItemType === 'trigger') {
            setEditedFlow(prev => ({
                ...prev,
                triggers: prev.triggers?.map(item =>
                    item.id === editItemId
                        ? { ...item, type: triggerType as any, details: details }
                        : item
                )
            }));

            setEditItemId(null);
            setEditItemType(null);
        } else {
            // Neuen Trigger hinzufügen
            const newTrigger: Trigger = {
                id: `trigger-${Date.now()}`,
                type: triggerType,
                details: details,
                createdAt: new Date().toString(),
                flowId: editedFlow.id,
                existInDb: false,
                description: 'Keine Beschreibung',
                name: 'Kein Name',
            };

            setEditedFlow(prev => ({
                ...prev,
                triggers: [...(prev.triggers || []), newTrigger]
            }));
        }
    };

    // Handler zum Hinzufügen einer neuen Action oder Bearbeiten einer bestehenden
    const handleAddAction = (actionType: ActionType, details: any) => {
        if (editItemId && editItemType === 'action') {
            setEditedFlow(prev => ({
                ...prev,
                actions: prev.actions?.map(item =>
                    item.id === editItemId
                        ? { ...item, type: actionType as any, details: details }
                        : item
                )
            }));
            setEditItemId(null);
            setEditItemType(null);
        } else {
            // Neue Action hinzufügen
            const newAction: Action = {
                id: `action-${Date.now()}`,
                type: actionType as ActionType,
                details: details,
                createdAt: new Date().toString(),
                flowId: editedFlow.id,
                existInDb: false,
                description: '',
                name: '',
            };

            setEditedFlow(prev => ({
                ...prev,
                actions: [...(prev.actions || []), newAction]
            }));
        }
    };

    // Handler zum Bearbeiten eines bestehenden Elements (Trigger oder Action)
    const handleEditItem = (id: string, type: 'trigger' | 'action') => {
        setEditItemId(id);
        setEditItemType(type);

        // Öffnet den passenden Dialog zum Bearbeiten
        const existingItem = type === 'trigger'
            ? editedFlow.triggers?.find(item => item.id === id)
            : editedFlow.actions?.find(item => item.id === id);

        if (existingItem) {
            if (type === 'trigger') {
                setIsAddTriggerOpen(true);
            } else {
                setIsAddActionOpen(true);
            }
        }
    };

    // Handler zum Löschen eines Elements (öffnet Bestätigungsdialog)
    const handleDeleteItem = (id: string, type: 'trigger' | 'action') => {
        setDeleteDialog({
            open: true,
            itemId: id,
            itemType: type
        });
    };

    // Handler zur Bestätigung des Löschens
    const confirmDelete = async () => {
        const { itemId, itemType } = deleteDialog;

        if (itemId && itemType) {
            if (itemType === 'trigger') {
                const toDeleteTrigger = editedFlow.triggers?.find(item => item.id === itemId);

                if (toDeleteTrigger) {
                    if (editedFlow.isTemplate) {
                        try {
                            await deleteOrgFlowTemplateTrigger(
                                session?.user?.orgId || '',
                                editedFlow.id,
                                itemId,
                                session?.user?.jwt || ''
                            )

                            setEditedFlow(prev => ({
                                ...prev,
                                triggers: prev.triggers?.filter(item => item.id !== itemId)
                            }));
                            queryClient.invalidateQueries({ queryKey: [flow.id] });

                            toast.success("Trigger erfolgreich gelöscht");
                        } catch (error) {
                            console.error("Fehler beim Löschen des Triggers:", error);
                        }
                    } else {
                        try {
                            await deleteTrigger(
                                session?.user?.orgId || '',
                                flow.eventId || '',
                                editedFlow.id,
                                itemId,
                                session?.user?.jwt || ''
                            )

                            setEditedFlow(prev => ({
                                ...prev,
                                triggers: prev.triggers?.filter(item => item.id !== itemId)
                            }));
                            queryClient.invalidateQueries({ queryKey: [flow.id] });

                            toast.success("Trigger erfolgreich gelöscht");
                        } catch (error) {
                            console.error("Fehler beim Löschen des Triggers:", error);
                        }
                    }
                }

            } else {
                setEditedFlow(prev => ({
                    ...prev,
                    actions: prev.actions?.filter(item => item.id !== itemId)
                }));
            }
        }

        setDeleteDialog({ open: false, itemId: null, itemType: null });
    };

    // Handler zum Speichern der Änderungen
    const handleSave = () => {
        onSave(editedFlow);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {/* Flow-Informationen */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Flow-Informationen</CardTitle>
                        <CardDescription>Grundlegende Details zu diesem Automatisierungs-Flow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Flow-Name</Label>
                                <Input
                                    id="name"
                                    value={editedFlow.name || ''}
                                    onChange={(e) => setEditedFlow({ ...editedFlow, name: e.target.value })}
                                    disabled={!isEditing}
                                    placeholder="Flow-Namen eingeben"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Beschreibung</Label>
                                <Textarea
                                    id="description"
                                    value={editedFlow.description || ''}
                                    onChange={(e) => setEditedFlow({ ...editedFlow, description: e.target.value })}
                                    className="min-h-[100px]"
                                    disabled={!isEditing}
                                    placeholder="Beschreibe, was dieser Flow macht"
                                />
                            </div>

                            {editedFlow.eventId && <div className="space-y-2">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mehrfache Ausführung</Label>
                                    <p className="text-sm text-muted-foreground">Erlaube, dass dieser Flow mehrfach für dasselbe Event ausgeführt werden kann</p>

                                    <Switch
                                        id="multipleRuns"
                                        checked={editedFlow.multipleRuns || false}
                                        onCheckedChange={(checked) => setEditedFlow({ ...editedFlow, multipleRuns: checked })}
                                        disabled={!isEditing}
                                    />

                                </div>

                                <Label htmlFor="event">Event</Label>
                                <Input
                                    id="event"
                                    value={editedFlow.eventId || ''}
                                    disabled
                                    placeholder="Event-ID"
                                />
                                <Link href={`/organization/events/${editedFlow.eventId}`} className="text-sm text-muted-foreground">
                                    Dieser Flow ist mit dem Event verknüpft: {editedFlow.eventId}
                                </Link>
                            </div>}


                        </div>
                    </CardContent>
                </Card>

                {/* Trigger */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <span>Trigger</span>
                            {(editedFlow.triggers?.length || 0) > 0 && (
                                <Badge variant="outline" className="ml-2">
                                    {editedFlow.triggers?.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Bedingungen, die diesen Flow auslösen</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[250px] pr-4">
                            {(editedFlow.triggers?.length || 0) > 0 ? (
                                <div className="space-y-3">
                                    {editedFlow.triggers?.map((trigger) => (
                                        <div
                                            key={trigger.id}
                                            className={cn(
                                                "group relative rounded-md border bg-card shadow-sm transition-all hover:shadow",
                                                isEditing && "hover:border-primary/50"
                                            )}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                                        "bg-primary/10 text-primary"
                                                    )}>
                                                        {getTriggerIcon(trigger.type)}
                                                    </div>

                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium">{getTriggerTitle(trigger.type)}</h4>

                                                            {isEditing && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleEditItem(trigger.id, 'trigger')}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Bearbeiten
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteItem(trigger.id, 'trigger')}
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Löschen
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>

                                                        {getTriggerSummary(trigger.type, trigger.details) && (
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {getTriggerSummary(trigger.type, trigger.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {trigger.details && Object.keys(trigger.details).length > 0 && (
                                                    <div className="mt-3 pt-3 border-t text-xs space-y-1.5 text-muted-foreground">
                                                        {Object.entries(trigger.details)
                                                            .filter(([key]) => key !== 'selectedTriggerId')
                                                            .slice(0, 3) // Zeige nur die ersten 3 Eigenschaften
                                                            .map(([key, value]) => (
                                                                <div key={key} className="flex items-center">
                                                                    <span className="font-medium min-w-24">{formatDetailsLabel(key)}:</span>
                                                                    <span className="truncate">{formatDetailsValue(key, value)}</span>
                                                                </div>
                                                            ))}
                                                        {Object.keys(trigger.details).length > 3 && (
                                                            <div className="text-xs text-muted-foreground/70 italic">
                                                                + {Object.keys(trigger.details).length - 3} weitere Eigenschaften
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[100px] items-center justify-center text-center text-muted-foreground">
                                    <div>
                                        <p>Bis jetzt kein Trigger</p>
                                        <p className="text-sm">Füge eine Bedingung hinzu, um zu bestimmen, wann dieser Flow ausgeführt werden soll</p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="pt-0">
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                onClick={() => {
                                    setEditItemId(null);
                                    setEditItemType(null);
                                    setIsAddTriggerOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Bedingung hinzufügen
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Aktionen */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <span>Aktionen</span>
                            {(editedFlow.actions?.length || 0) > 0 && (
                                <Badge variant="outline" className="ml-2">
                                    {editedFlow.actions?.length || 0}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Aktionen, die ausgeführt werden, wenn dieser Flow ausgelöst wird</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[250px] pr-4">
                            {(editedFlow.actions?.length || 0) > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {editedFlow.actions?.map((action) => (
                                        <div
                                            key={action.id}
                                            className={cn(
                                                "group relative rounded-md border bg-card shadow-sm transition-all hover:shadow",
                                                isEditing && "hover:border-primary/50"
                                            )}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                                        "bg-primary/10 text-primary"
                                                    )}>
                                                        {getActionIcon(action.type)}
                                                    </div>

                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium">{getActionTitle(action.type)}</h4>

                                                            {isEditing && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleEditItem(action.id, 'action')}>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Bearbeiten
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDeleteItem(action.id, 'action')}
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Löschen
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>

                                                        {getActionSummary(action.type, action.details) && (
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {getActionSummary(action.type, action.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {action.details && Object.keys(action.details).length > 0 && (
                                                    <div className="mt-3 pt-3 border-t text-xs space-y-1.5 text-muted-foreground">
                                                        {Object.entries(action.details)
                                                            .filter(([key]) =>
                                                                key !== 'selectedTriggerId' &&
                                                                key !== 'body' &&
                                                                key !== 'message' &&
                                                                key !== 'newDescription'
                                                            )
                                                            .slice(0, 3) // Zeige nur die ersten 3 Eigenschaften
                                                            .map(([key, value]) => (
                                                                <div key={key} className="flex items-center">
                                                                    <span className="font-medium min-w-24">{formatDetailsLabel(key)}:</span>
                                                                    <span className="truncate">{formatDetailsValue(key, value)}</span>
                                                                </div>
                                                            ))}
                                                        {Object.keys(action.details).length > 3 && (
                                                            <div className="text-xs text-muted-foreground/70 italic">
                                                                + {Object.keys(action.details).length - 3} weitere Eigenschaften
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[100px] items-center justify-center text-center text-muted-foreground">
                                    <div>
                                        <p>Bis jetzt keine Aktionen</p>
                                        <p className="text-sm">Füge Aktionen hinzu, um zu bestimmen, was passieren soll, wenn dieser Flow ausgeführt wird</p>
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="pt-0">
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                                onClick={() => {
                                    setEditItemId(null);
                                    setEditItemType(null);
                                    setIsAddActionOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Aktion hinzufügen
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {isEditing && (
                <div className="flex justify-end">
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        {isCreating ? 'Flow speichern' : 'Änderungen speichern'}
                    </Button>
                </div>
            )}

            {/* Dialog zum Hinzufügen eines Triggers */}
            <AddTriggerDialog
                open={isAddTriggerOpen}
                onOpenChange={(open) => {
                    setIsAddTriggerOpen(open);
                    if (!open) {
                        setEditItemId(null);
                        setEditItemType(null);
                    }
                }}
                onAdd={handleAddTrigger}
                existingFlow={editedFlow}
                itemToEdit={editItemId && editItemType === 'trigger'
                    ? editedFlow.triggers?.find(item => item.id === editItemId)
                    : undefined}
            />

            {/* Dialog zum Hinzufügen einer Aktion */}
            <AddActionDialog
                open={isAddActionOpen}
                onOpenChange={(open) => {
                    setIsAddActionOpen(open);
                    if (!open) {
                        setEditItemId(null);
                        setEditItemType(null);
                    }
                }}
                onAdd={handleAddAction}
                existingFlow={editedFlow}
                itemToEdit={editItemId && editItemType === 'action'
                    ? editedFlow.actions?.find(item => item.id === editItemId)
                    : undefined}
                mails={mails}
            />

            {/* Bestätigungsdialog für das Löschen */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Dies wird diesen {deleteDialog.itemType === 'trigger' ? 'Trigger' : 'Aktion'} dauerhaft löschen. Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}