"use client";;
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMinutes } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

// Icons
import {
  ArrowLeftIcon,
  Clock,
  ListTodo,
  Plus,
  Save,
  Trash2
} from "lucide-react";

import { AgendaStepFormData, agendaStepSchema } from "@/lib/form-schemas";
import { AgendaEntry } from "@/lib/backend/agenda";

interface EventAgendaFormProps {
  agendaItems: AgendaEntry[];
  onAgendaItemsChange: (items: AgendaEntry[]) => void;
  onTabChange?: (tab: string) => void;
  eventId?: string;
  isFinalStep?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function EventAgendaForm({
  agendaItems,
  onAgendaItemsChange,
  onTabChange,
  eventId,
  isFinalStep = false,
  submitLabel = "Save Changes",
  isSubmitting = false
}: EventAgendaFormProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  
  // Form definition using Zod schema
  const form = useForm<AgendaStepFormData>({
    resolver: zodResolver(agendaStepSchema),
    defaultValues: {
      title: "",
      description: "",
      start: new Date().toISOString(),
      end: addMinutes(new Date(), 60).toISOString()
    }
  });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = form;
  
  // Hinzufügen eines neuen Agenda-Eintrags
  const handleAddItem = (data: AgendaStepFormData) => {
    // Erstelle neuen Agenda-Eintrag mit zufälliger ID
    const newItem: AgendaEntry = {
      id: `${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description || "",
      start: new Date(data.start),
      end: new Date(data.end)
    };
    
    onAgendaItemsChange([...agendaItems, newItem]);
    reset();
    setIsAddSheetOpen(false);
  };
  
  // Aktualisieren eines bestehenden Agenda-Eintrags
  const handleUpdateItem = (data: AgendaStepFormData) => {
    if (editingItemIndex === null || editingId === null) return;
    
    const updatedItems = [...agendaItems];
    updatedItems[editingItemIndex] = {
      ...updatedItems[editingItemIndex],
      id: editingId,
      title: data.title,
      description: data.description || "",
      start: new Date(data.start),
      end: new Date(data.end)
    };
    
    onAgendaItemsChange(updatedItems);
    reset();
    setIsEditSheetOpen(false);
    setEditingItemIndex(null);
    setEditingId(null);
  };
  
  // Bearbeiten eines Agenda-Eintrags vorbereiten
  const handleEditItem = (index: number) => {
    const item = agendaItems[index];
    setEditingItemIndex(index);
    setEditingId(item.id || null);
    
    setValue("title", item.title || "");
    setValue("description", item.description || "");
    setValue("start", item.start ? item.start.toISOString() : new Date().toISOString());
    setValue("end", item.end ? item.end.toISOString() : addMinutes(new Date(), 60).toISOString());
    
    setIsEditSheetOpen(true);
  };
  
  // Handle deleting an agenda item
  const handleDeleteItem = (index: number) => {
    const updatedItems = [...agendaItems];
    updatedItems.splice(index, 1);
    onAgendaItemsChange(updatedItems);
  };
  
  // Calculate duration in minutes between two dates
  const calculateDuration = (start: Date, end: Date) => {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };
  
  // Reset form when opening the add sheet
  const handleOpenAddSheet = () => {
    reset({
      title: "",
      description: "",
      start: new Date().toISOString(),
      end: addMinutes(new Date(), 60).toISOString()
    });
    setIsAddSheetOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          Event-Agenda
        </CardTitle>
        <CardDescription>
          Erstelle einen Zeitplan für die Aktivitäten deiner Veranstaltung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Agenda-Zeitstrahl</h3>
            <p className="text-sm text-muted-foreground">
              Füge Aktivitäten hinzu und ordne sie für deine Veranstaltung an
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenAddSheet}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        </div>
        
        <Separator className="my-2" />
        
        {agendaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/50">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Noch keine Agenda-Einträge</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Füge Einträge hinzu, um einen Zeitplan für deine Veranstaltung zu erstellen
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenAddSheet}>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Eintrag hinzufügen
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {/* Zeit-Header */}
              <div className="flex items-center justify-between px-4">
                <p className="text-sm font-medium text-muted-foreground">Startzeit</p>
                <p className="text-sm font-medium text-muted-foreground">Dauer</p>
              </div>
              
              {/* Agenda-Einträge – sortiert nach Startzeit */}
              {agendaItems
                .sort((a, b) => {
                  if (!a.start || !b.start) return 0;
                  return new Date(a.start).getTime() - new Date(b.start).getTime();
                })
                .map((item, index) => {
                  if (!item.start || !item.end) return null;
                  
                  const duration = calculateDuration(new Date(item.start), new Date(item.end));
                  return (
                    <div 
                      key={item.id || index}
                      className="relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow hover:border-primary/50 group"
                    >
                      <div className="absolute top-0 left-0 h-full w-1 bg-primary"></div>
                      
                      <div className="flex items-stretch">
                        {/* Zeit-Spalte */}
                        <div className="w-28 shrink-0 bg-muted/30 flex flex-col items-center justify-center px-3 py-4 border-r">
                          <div className="text-xl font-semibold">
                            {format(new Date(item.start), "H:mm")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(item.start), "a")}
                          </div>
                        </div>
                        
                        {/* Inhalt-Spalte */}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-medium">{item.title}</h4>
                              
                              {item.description && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {item.description}
                                </div>
                              )}
                              
                              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{duration} Minuten</span>
                                <span className="mx-1">•</span>
                                <span>
                                  {format(new Date(item.start), "H:mm")} - {format(new Date(item.end), "H:mm")}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditItem(index)}
                              >
                                <Plus className="h-4 w-4 rotate-45" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" type="button" onClick={() => onTabChange && onTabChange("flows")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Zurück: Abläufe
        </Button>
        {isFinalStep ? (
          <Button
            type="button"
            onClick={form.handleSubmit(() => { console.log("Letzter Schritt") })}
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Speichern...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </div>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
          >
            {submitLabel}
          </Button>
        )}
      </CardFooter>
      
      {/* Sheet zum Hinzufügen eines Agenda-Eintrags */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Agenda-Eintrag hinzufügen</SheetTitle>
            <SheetDescription>
              Füge einen neuen Eintrag zur Agenda deiner Veranstaltung hinzu. Jeder Eintrag steht für einen Programmpunkt.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit(handleAddItem)} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="z.B. Begrüßung & Einführung"
                {...register("title", { required: "Titel ist erforderlich" })}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung dieses Agenda-Punktes"
                className="min-h-[100px] focus-within:ring-1 focus-within:ring-primary"
                {...register("description")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Startzeit <span className="text-red-500">*</span></Label>
                <Input
                  id="start"
                  type="datetime-local"
                  className="focus-within:ring-1 focus-within:ring-primary"
                  {...register("start", { required: "Startzeit ist erforderlich" })}
                />
                {errors.start && (
                  <p className="text-sm text-red-500">{errors.start.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end">Endzeit <span className="text-red-500">*</span></Label>
                <Input
                  id="end"
                  type="datetime-local"
                  className="focus-within:ring-1 focus-within:ring-primary"
                  {...register("end", { required: "Endzeit ist erforderlich" })}
                />
                {errors.end && (
                  <p className="text-sm text-red-500">{errors.end.message}</p>
                )}
              </div>
            </div>
            
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">Abbrechen</Button>
              </SheetClose>
              <Button type="submit">Zur Agenda hinzufügen</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      
      {/* Sheet zum Bearbeiten eines Agenda-Eintrags */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Agenda-Eintrag bearbeiten</SheetTitle>
            <SheetDescription>
              Bearbeite die Details dieses Agenda-Eintrags.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit(handleUpdateItem)} className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel <span className="text-red-500">*</span></Label>
              <Input
                id="edit-title"
                placeholder="z.B. Begrüßung & Einführung"
                {...register("title", { required: "Titel ist erforderlich" })}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                placeholder="Kurze Beschreibung dieses Agenda-Punktes"
                className="min-h-[100px] focus-within:ring-1 focus-within:ring-primary"
                {...register("description")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Startzeit <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-start"
                  type="datetime-local"
                  className="focus-within:ring-1 focus-within:ring-primary"
                  {...register("start", { required: "Startzeit ist erforderlich" })}
                />
                {errors.start && (
                  <p className="text-sm text-red-500">{errors.start.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-end">Endzeit <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-end"
                  type="datetime-local"
                  className="focus-within:ring-1 focus-within:ring-primary"
                  {...register("end", { required: "Endzeit ist erforderlich" })}
                />
                {errors.end && (
                  <p className="text-sm text-red-500">{errors.end.message}</p>
                )}
              </div>
            </div>
            
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">Abbrechen</Button>
              </SheetClose>
              <Button type="submit">Eintrag aktualisieren</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </Card>
  );
}