"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMinutes } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Icons
import { AlertCircle, ClockIcon, ListTodo, Plus, Trash2, CheckCircle2 } from "lucide-react";

import { AgendaStepFormData, agendaStepSchema } from "@/lib/form-schemas";
import { AgendaEntry } from "@/lib/backend/agenda";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Helper to format date for datetime-local input with proper timezone handling
const formatDateForInput = (date: Date): string => {
  // Get local timezone offset in minutes
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  
  // Adjust the date to account for the local timezone
  const localDate = new Date(date.getTime() - tzOffset);
  
  // Format as YYYY-MM-DDThh:mm which datetime-local input expects
  // Slice the ISO string up to minutes only (removing seconds and milliseconds)
  return localDate.toISOString().slice(0, 16);
};

// Helper to get minimum date (current date/time)
const getMinDate = (): string => {
  return formatDateForInput(new Date());
};

// Helper to parse datetime-local input value to Date
const parseDateFromInput = (value: string): Date => {
  // Create a date from the input value
  const date = new Date(value);
  
  // Return the correct date with proper timezone handling
  return date;
};

interface EventAgendaFormProps {
  agendaItems: AgendaEntry[];
  onAgendaItemsChange: (items: AgendaEntry[]) => void;
  onTabChange?: (tab: string) => void;
  eventId?: string;
  isFinalStep?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  eventStart?: Date; // Add event start time
  eventEnd?: Date;   // Add event end time
}

export function EventAgendaForm({
  agendaItems,
  onAgendaItemsChange,
  onTabChange,
  eventId,
  isFinalStep = false,
  submitLabel = "Save Changes",
  isSubmitting = false,
  eventStart,
  eventEnd
}: EventAgendaFormProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationTriggered, setValidationTriggered] = useState(false);
  
  // Form definition using Zod schema
  const form = useForm<AgendaStepFormData>({
    resolver: zodResolver(agendaStepSchema),
    defaultValues: {
      title: "",
      description: "",
      start: new Date(),
      end: addMinutes(new Date(), 60)
    },
    mode: "onChange"
  });
  
  const { formState, reset, setValue, control, trigger, watch } = form;
  const { errors, isValid, isDirty } = formState;
  
  // Watch the start time to update end time accordingly
  const startValue = watch("start");

  // Check if we need to show form validation message
  const showValidationErrors = Object.keys(errors).length > 0;

  // Handle submit with improved feedback
  const handleSubmitWithFeedback = () => {
    setValidationTriggered(true);
    
    if (agendaItems.length === 0) {
      toast.error(
        <div className="space-y-2">
          <div className="font-medium">Bitte korrigieren Sie folgende Fehler:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Agenda: Bitte fügen Sie mindestens einen Agenda-Eintrag hinzu</li>
          </ul>
        </div>
      );
      return false;
    }
    
    if (timeConflicts.length > 0) {
      toast.warning(
        <div className="space-y-2">
          <div className="font-medium">Achtung: Zeitüberschneidungen gefunden</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Es gibt {timeConflicts.length} Zeitüberschneidung(en) zwischen Agenda-Einträgen</li>
            <li>Sie können fortfahren, aber dies könnte zu Planungsproblemen führen</li>
          </ul>
        </div>
      );
      // Allow to proceed even with conflicts, just warn
    }
    
    return true;
  };
  
  // Adding a new agenda entry
  const handleAddItem = (data: AgendaStepFormData) => {
    try {
      // Validate that start date is not in the past
      const now = new Date();
      if (data.start < now) {
        setFormError("Die Startzeit darf nicht in der Vergangenheit liegen");
        toast.error("Die Startzeit darf nicht in der Vergangenheit liegen");
        return;
      }
      
      // Validate that agenda item is within event timespan
      if (eventStart && data.start < eventStart) {
        setFormError("Die Startzeit muss innerhalb der Event-Zeitspanne liegen");
        toast.error("Die Startzeit muss nach dem Event-Start liegen");
        return;
      }
      
      if (eventEnd && data.end > eventEnd) {
        setFormError("Die Endzeit muss innerhalb der Event-Zeitspanne liegen");
        toast.error("Die Endzeit muss vor dem Event-Ende liegen");
        return;
      }

      // Create new agenda entry with random ID
      const newItem: AgendaEntry = {
        id: `agenda_${Math.random().toString(36).substr(2, 9)}`,
        title: data.title,
        description: data.description || "",
        start: data.start,
        end: data.end
      };
      
      // Check for time conflicts with existing items
      const hasConflict = agendaItems.some(item => 
        (data.start >= item.start && data.start < item.end) || 
        (data.end > item.start && data.end <= item.end)
      );
      
      if (hasConflict) {
        toast.warning("Dieser Eintrag überschneidet sich zeitlich mit einem bestehenden Eintrag. Sie können fortfahren, aber es kann zu Planungskonflikten kommen.");
      }
      
      onAgendaItemsChange([...agendaItems, newItem]);
      reset();
      setIsAddSheetOpen(false);
      toast.success("Agenda-Eintrag erfolgreich hinzugefügt");
    } catch (error) {
      console.error("Error adding agenda item:", error);
      setFormError("Fehler beim Hinzufügen des Agenda-Eintrags");
      toast.error("Fehler beim Hinzufügen des Agenda-Eintrags");
    }
  };
  
  // Update an existing agenda entry
  const handleUpdateItem = (data: AgendaStepFormData) => {
    if (editingItemIndex === null || editingId === null) return;
    
    try {
      // Validate that start date is not in the past
      const now = new Date();
      if (data.start < now) {
        setFormError("Die Startzeit darf nicht in der Vergangenheit liegen");
        toast.error("Die Startzeit darf nicht in der Vergangenheit liegen");
        return;
      }
      
      // Validate that agenda item is within event timespan
      if (eventStart && data.start < eventStart) {
        setFormError("Die Startzeit muss innerhalb der Event-Zeitspanne liegen");
        toast.error("Die Startzeit muss nach dem Event-Start liegen");
        return;
      }
      
      if (eventEnd && data.end > eventEnd) {
        setFormError("Die Endzeit muss innerhalb der Event-Zeitspanne liegen");
        toast.error("Die Endzeit muss vor dem Event-Ende liegen");
        return;
      }
      
      const updatedItems = [...agendaItems];
      updatedItems[editingItemIndex] = {
        id: editingId,
        title: data.title,
        description: data.description || "",
        start: data.start,
        end: data.end
      };
      
      onAgendaItemsChange(updatedItems);
      reset();
      setIsEditSheetOpen(false);
      setEditingItemIndex(null);
      setEditingId(null);
      toast.success("Agenda-Eintrag erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating agenda item:", error);
      setFormError("Fehler beim Aktualisieren des Agenda-Eintrags");
      toast.error("Fehler beim Aktualisieren des Agenda-Eintrags");
    }
  };
  
  // Prepare to edit an agenda entry
  const handleEditItem = (index: number) => {
    const item = agendaItems[index];
    setEditingItemIndex(index);
    setEditingId(item.id || null);
    
    setValue("title", item.title || "");
    setValue("description", item.description || "");
    setValue("start", item.start || new Date());
    setValue("end", item.end || addMinutes(new Date(), 60));
    
    setIsEditSheetOpen(true);
    setFormError(null);
  };
  
  // Delete an agenda item
  const handleDeleteItem = (index: number) => {
    try {
      const updatedItems = [...agendaItems];
      updatedItems.splice(index, 1);
      onAgendaItemsChange(updatedItems);
      toast.success("Agenda-Eintrag erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting agenda item:", error);
      toast.error("Fehler beim Löschen des Agenda-Eintrags");
    }
  };
  
  // Calculate duration in minutes between two dates
  const calculateDuration = (start: Date, end: Date) => {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };
  
  // Reset form when opening the add sheet with default times within event timespan
  const handleOpenAddSheet = () => {
    let defaultStart = new Date();
    let defaultEnd = addMinutes(defaultStart, 60);
    
    // If event start/end times are provided, use them to constrain the default times
    if (eventStart && eventEnd) {
      const now = new Date();
      
      // Set default start time to either now or event start, whichever is later
      defaultStart = now > eventStart ? now : new Date(eventStart);
      
      // Make sure defaultStart is not after event end
      if (defaultStart >= eventEnd) {
        // If current time is after event end, use event start instead
        defaultStart = new Date(eventStart);
      }
      
      // Set default end time to start + 1 hour, but not beyond event end
      defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
      if (defaultEnd > eventEnd) {
        defaultEnd = new Date(eventEnd);
      }
    }
    
    reset({
      title: "",
      description: "",
      start: defaultStart,
      end: defaultEnd
    });
    
    setIsAddSheetOpen(true);
    setFormError(null);
  };

  // Effect to update end time based on start time
  useEffect(() => {
    if (startValue) {
      const currentEnd = form.getValues("end");
      
      // Only auto-update end time if it's less than start time or very close to original default
      if (!currentEnd || currentEnd <= startValue) {
        form.setValue("end", new Date(startValue.getTime() + 60 * 60 * 1000));
      }
    }
  }, [startValue, form]);

  // Sort agenda items by start time
  const sortedAgendaItems = [...agendaItems].sort((a, b) => {
    if (!a.start || !b.start) return 0;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  // Check for time conflicts in agenda items
  const timeConflicts = sortedAgendaItems.reduce((conflicts, item, index, arr) => {
    if (index === 0) return conflicts;
    
    const prevItem = arr[index - 1];
    if (item.start && prevItem.end && new Date(item.start) < new Date(prevItem.end)) {
      conflicts.push({ itemIndex: index, conflictWith: index - 1 });
    }
    
    return conflicts;
  }, [] as { itemIndex: number, conflictWith: number }[]);
  
  // Group agenda items by date
  const agendaItemsByDate = sortedAgendaItems.reduce((groups, item) => {
    if (!item.start) return groups;
    
    const date = format(new Date(item.start), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(item);
    return groups;
  }, {} as Record<string, AgendaEntry[]>);

  // Get formatted dates for display
  const formattedDates = Object.keys(agendaItemsByDate).map(dateStr => ({
    value: dateStr,
    label: format(new Date(dateStr), "dd.MM.yyyy")
  }));

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
        {validationTriggered && agendaItems.length === 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validierungsfehler</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bitte fügen Sie mindestens einen Agenda-Eintrag hinzu</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
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
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Agenda-Zeitstrahl</h3>
                <p className="text-sm text-muted-foreground">
                  {agendaItems.length} {agendaItems.length === 1 ? 'Eintrag' : 'Einträge'} • {formattedDates.length} {formattedDates.length === 1 ? 'Tag' : 'Tage'}
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

            {timeConflicts.length > 0 && (
              <Alert className="border-amber-500">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Zeitüberschneidungen gefunden</AlertTitle>
                <AlertDescription>
                  Es wurden Zeitüberschneidungen zwischen Agenda-Einträgen entdeckt. 
                  Bitte überprüfen Sie die Zeiten der markierten Einträge.
                </AlertDescription>
              </Alert>
            )}
            
            <Separator className="my-2" />

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Group by date headings if there are multiple days */}
                {formattedDates.length > 0 && formattedDates.map(dateInfo => (
                  <div key={dateInfo.value} className="space-y-4">
                    {formattedDates.length > 1 && (
                      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
                        <h4 className="text-md font-medium">{dateInfo.label}</h4>
                        <Separator className="mt-2" />
                      </div>
                    )}
                    
                    {/* Zeit-Header */}
                    <div className="flex items-center justify-between px-4">
                      <p className="text-sm font-medium text-muted-foreground">Startzeit</p>
                      <p className="text-sm font-medium text-muted-foreground">Dauer</p>
                    </div>
                    
                    {/* Agenda items for this date */}
                    {agendaItemsByDate[dateInfo.value].map((item, index) => {
                      if (!item.start || !item.end) return null;
                      
                      // Check if this item has time conflicts
                      const hasConflict = timeConflicts.some(conflict => 
                        conflict.itemIndex === index || conflict.conflictWith === index
                      );
                      
                      const duration = calculateDuration(new Date(item.start), new Date(item.end));
                      return (
                        <div 
                          key={item.id || index}
                          className={`relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow group
                            ${hasConflict ? 'border-amber-500' : 'hover:border-primary/50'}`}
                        >
                          <div className={`absolute top-0 left-0 h-full w-1 ${hasConflict ? 'bg-amber-500' : 'bg-primary'}`}></div>
                          
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
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-medium">{item.title}</h4>
                                    {hasConflict && (
                                      <Badge variant="outline" className="text-amber-500 border-amber-500">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Zeitüberschneidung
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {item.description && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                      {item.description}
                                    </div>
                                  )}
                                  
                                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                    <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
                                    onClick={() => handleEditItem(sortedAgendaItems.findIndex(i => i.id === item.id))}
                                  >
                                    <Plus className="h-4 w-4 rotate-45" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteItem(sortedAgendaItems.findIndex(i => i.id === item.id))}
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
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
      
      {/* Sheet zum Hinzufügen eines Agenda-Eintrags */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Agenda-Eintrag hinzufügen</SheetTitle>
            <SheetDescription>
              Füge einen neuen Eintrag zur Agenda deiner Veranstaltung hinzu. Jeder Eintrag steht für einen Programmpunkt.
            </SheetDescription>
          </SheetHeader>
          
          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-6 py-6">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="title">Titel <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        placeholder="z.B. Begrüßung & Einführung"
                        {...field}
                        className="focus-within:ring-1 focus-within:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Kurze Beschreibung dieses Agenda-Punktes"
                        className="min-h-[100px] focus-within:ring-1 focus-within:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="start">Startzeit <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          id="start"
                          type="datetime-local"
                          min={getMinDate()}
                          value={field.value instanceof Date ? formatDateForInput(field.value) : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : new Date();
                            field.onChange(date);
                          }}
                          className="focus-within:ring-1 focus-within:ring-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        Die Startzeit darf nicht in der Vergangenheit liegen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="end">Endzeit <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          id="end"
                          type="datetime-local"
                          min={startValue instanceof Date ? formatDateForInput(startValue) : getMinDate()}
                          value={field.value instanceof Date ? formatDateForInput(field.value) : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : 
                                       (startValue ? new Date(startValue.getTime() + 60 * 60 * 1000) : new Date());
                            field.onChange(date);
                          }}
                          className="focus-within:ring-1 focus-within:ring-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        Die Endzeit muss nach der Startzeit liegen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Abbrechen</Button>
                </SheetClose>
                <Button 
                  type="submit"
                  disabled={!isValid || !isDirty}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Zur Agenda hinzufügen
                </Button>
              </SheetFooter>
            </form>
          </Form>
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
          
          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateItem)} className="space-y-6 py-6">
              <FormField
                control={control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="edit-title">Titel <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        id="edit-title"
                        placeholder="z.B. Begrüßung & Einführung"
                        {...field}
                        className="focus-within:ring-1 focus-within:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="edit-description">Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea
                        id="edit-description"
                        placeholder="Kurze Beschreibung dieses Agenda-Punktes"
                        className="min-h-[100px] focus-within:ring-1 focus-within:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="edit-start">Startzeit <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          id="edit-start"
                          type="datetime-local"
                          min={getMinDate()}
                          value={field.value instanceof Date ? formatDateForInput(field.value) : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : new Date();
                            field.onChange(date);
                          }}
                          className="focus-within:ring-1 focus-within:ring-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        Die Startzeit darf nicht in der Vergangenheit liegen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="edit-end">Endzeit <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          id="edit-end"
                          type="datetime-local"
                          min={startValue instanceof Date ? formatDateForInput(startValue) : getMinDate()}
                          value={field.value instanceof Date ? formatDateForInput(field.value) : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : 
                                       (startValue ? new Date(startValue.getTime() + 60 * 60 * 1000) : new Date());
                            field.onChange(date);
                          }}
                          className="focus-within:ring-1 focus-within:ring-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        Die Endzeit muss nach der Startzeit liegen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Abbrechen</Button>
                </SheetClose>
                <Button 
                  type="submit"
                  disabled={!isValid || !isDirty}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Eintrag aktualisieren
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </Card>
  );
}