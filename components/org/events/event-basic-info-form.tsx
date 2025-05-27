"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Fix import to use sonner instead of react-hot-toast

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Icons
import { AlertCircle, Info } from "lucide-react";

import type { EventBasicInfoFormData } from "@/lib/form-schemas";
import { type UseFormReturn } from "react-hook-form";

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
  
  // Return the corrected date with proper timezone
  return date;
};

// Categories for the event
const CATEGORIES = [
  "Konferenz",
  "Workshop",
  "Seminar",
  "Networking",
  "Webinar",
  "Training",
  "Teambuilding",
  "Sonstiges"
]

// Image options
const IMAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "Technik", value: "https://www.trendsderzukunft.de/wp-content/uploads/2021/04/Computerchip-620x414.jpg" },
  {
    label: "Weiterbildung & Training",
    value:
      "https://www.nach-dem-abitur.de/wp-content/uploads/2021/11/junge-leute-in-einer-schulung-zur-existenzgrndung-1024x537.jpg",
  },
  {
    label: "Innovation & Kreativität",
    value: "https://crestcom.com/de/wp-content/uploads/sites/8/2021/08/September-Blog-2-1080x675.jpeg",
  },
  {
    label: "Strategie & Planung",
    value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3-3M_aZdqd-WxN-G3xMlLzH_a0mBZ90ry7Q&s",
  },
  {
    label: "Feier & Anerkennung",
    value: "https://img.freepik.com/fotos-kostenlos/feiern-des-neuen-jahres_1098-12620.jpg",
  },
  {
    label: "Networking & Austausch",
    value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWno4Y5ojZ2fieK_hiQFZQ3mKy3zATNuMtrw&s",
  },
  {
    label: "Gesundheit & Sport",
    value: "https://www.sportordination.com/wp-content/uploads/2021/03/Ist-Sport-gefaehrlich-Sportordination.jpg",
  },
]

interface EventBasicInfoFormProps {
  eventId?: string
  form: UseFormReturn<EventBasicInfoFormData>
  isFinalStep?: boolean
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit?: (data: EventBasicInfoFormData) => void
  onTabChange?: (tab: string) => void
}

// Form for basic event information
export function EventBasicInfoForm({
  eventId,
  form,
  isFinalStep = false,
  isSubmitting = false,
  submitLabel = "Nächster Schritt",
  onSubmit,
  onTabChange,
}: EventBasicInfoFormProps) {
  const {
    control,
    formState: { errors, isValid, isDirty },
    getValues,
    setValue,
    handleSubmit,
    watch,
    trigger, // Add trigger to validate form fields on demand
  } = form
  
  // Validate props based on isFinalStep
  if (isFinalStep && !onSubmit) {
    throw new Error("Die onSubmit-Funktion ist für den letzten Schritt erforderlich.")
  } else if (!isFinalStep && !onTabChange) {
    throw new Error("Die onTabChange-Funktion ist für nicht-letzte Schritte erforderlich.")
  }
  
  const startValue = watch("start");
  const hasFormErrors = Object.keys(errors).length > 0;
  const [validationTriggered, setValidationTriggered] = useState(false); // Track when validation is triggered

  // Handle next button click with feedback
  const handleNextClick = async () => {
    setValidationTriggered(true);
    const isValid = await trigger();
    
    if (!isValid) {
      // Show toast with specific error messages
      const errorList = Object.entries(errors)
        .map(([field, error]) => `${getFieldLabel(field)}: ${error.message}`)
        .join(', ');
      
      toast.error(
        <div className="space-y-2">
          <div className="font-medium">Bitte korrigieren Sie folgende Fehler:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{getFieldLabel(field)}: {error.message}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }
    
    // If valid, proceed to next tab
    onTabChange && onTabChange("agenda");
  };
  
  // Helper to get human-readable field labels
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      title: 'Titel',
      description: 'Beschreibung',
      category: 'Kategorie',
      capacity: 'Kapazität',
      location: 'Ort',
      start: 'Startdatum',
      end: 'Enddatum',
      image: 'Titelbild'
    };
    return labels[field] || field;
  };

  // Effect to update end time when start time changes
  useEffect(() => {
    if (startValue) {
      // Set end time to +1h after start, but only if end hasn't been manually changed
      const currentEnd = form.getValues("end");
      if (!currentEnd || currentEnd <= startValue) {
        form.setValue("end", new Date(startValue.getTime() + 60 * 60 * 1000));
      }
    }
  }, [startValue, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Event-Details
        </CardTitle>
        <CardDescription>
          Trage hier die grundlegenden Informationen zu deinem Event ein. Diese Informationen sind wichtig, um dein Event zu erstellen und zu verwalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasFormErrors && validationTriggered && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validierungsfehler</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{getFieldLabel(field)}: {error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form id="basic-info-form" className="space-y-6" onSubmit={handleSubmit(onSubmit || (() => {}))}>
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event-Titel <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Gib einen aussagekräftigen Titel für dein Event ein"
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
                  <FormLabel>Beschreibung <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibe dein Event"
                      className="min-h-[120px] focus-within:ring-1 focus-within:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="category"
                render={({ field }) => {
                  const isCustom = !CATEGORIES.includes(field.value || "")
                  return (
                    <FormItem>
                      <FormLabel>Kategorie <span className="text-red-500">*</span></FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormControl>
                          <Select
                            value={isCustom ? "" : field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value)
                              setValue("category", value)
                            }}
                          >
                            <SelectTrigger className="focus-within:ring-1 focus-within:ring-primary">
                              <SelectValue placeholder="Kategorie auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <Input
                            placeholder="Oder eigene Kategorie eingeben"
                            value={field.value || ""}
                            onChange={(e) => {
                              const input = e.target.value
                              field.onChange(input)
                              setValue("category", input)
                            }}
                            className="focus-within:ring-1 focus-within:ring-primary"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Wähle eine bestehende Kategorie oder gib deine eigene Kategorie ein.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapazität <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Maximale Teilnehmerzahl"
                        {...field}
                        className="focus-within:ring-1 focus-within:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ort <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Gib den Veranstaltungsort ein"
                      {...field}
                      className="focus-within:ring-1 focus-within:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdatum & Uhrzeit <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
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
                      Das Startdatum darf nicht in der Vergangenheit liegen
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
                    <FormLabel>Enddatum & Uhrzeit <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
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
                      Das Enddatum muss nach dem Startdatum liegen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titelbild</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormControl>
                      <Select
                        defaultValue={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value)
                          setValue("image", value)
                        }}
                      >
                        <SelectTrigger className="focus-within:ring-1 focus-within:ring-primary">
                          <SelectValue placeholder="Titelbild auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="Oder eigene Bild-URL eingeben"
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          setValue("image", e.target.value)
                        }}
                        className="focus-within:ring-1 focus-within:ring-primary"
                      />
                    </FormControl>
                  </div>
                  {field.value && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img
                        src={field.value || "/placeholder.svg"}
                        alt="Vorschau Titelbild"
                        className="w-full max-h-40 object-cover"
                      />
                    </div>
                  )}
                  <FormDescription>
                    Wähle eines der vorgegebenen Bilder als Titelbild für dein Event oder gib eine eigene Bild-URL ein.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
