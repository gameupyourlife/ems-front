import { z } from "zod";

// Improved date validation with more specific error messages
const dateSchema = z.date({
  required_error: "Datum ist erforderlich",
  invalid_type_error: "Bitte geben Sie ein gültiges Datum ein",
}).refine(
  (date) => !isNaN(date.getTime()),
  { message: "Bitte geben Sie ein gültiges Datum und Uhrzeit ein" }
);

// Current date for validation
const currentDate = new Date();

// Event Basic Info Schema with improved validation
export const eventBasicInfoSchema = z.object({
  title: z
    .string({ required_error: "Titel ist erforderlich" })
    .min(3, "Der Titel muss mindestens 3 Zeichen lang sein")
    .max(100, "Der Titel darf maximal 100 Zeichen lang sein"),
  description: z
    .string({ required_error: "Beschreibung ist erforderlich" })
    .min(10, "Die Beschreibung muss mindestens 10 Zeichen lang sein"),
  category: z
    .string({ required_error: "Kategorie ist erforderlich" })
    .min(1, "Bitte wählen Sie eine Kategorie aus"),
  capacity: z
    .coerce.number({ required_error: "Kapazität ist erforderlich" })
    .int("Die Kapazität muss eine ganze Zahl sein")
    .min(1, "Die Kapazität muss mindestens 1 sein")
    .max(100000, "Die Kapazität darf maximal 100.000 sein"),
  location: z
    .string({ required_error: "Ort ist erforderlich" })
    .min(3, "Der Ort muss mindestens 3 Zeichen lang sein"),
  start: dateSchema.refine(
    (date) => date > currentDate,
    { message: "Das Startdatum darf nicht in der Vergangenheit liegen" }
  ),
  end: dateSchema,
  image: z.string().optional(),
  status: z.string().optional().default("bevorstehend"),
}).refine(
  (data) => {
    return data.end > data.start;
  },
  {
    message: "Das Enddatum muss nach dem Startdatum liegen",
    path: ["end"]
  }
);

export type EventBasicInfoFormData = z.infer<typeof eventBasicInfoSchema>;

// Event Files Schema with improved validation
export const eventFilesSchema = z.object({
  files: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Dateiname ist erforderlich"),
      type: z.string().min(1, "Dateityp ist erforderlich"),
      url: z.string().url("Bitte geben Sie eine gültige URL ein"),
    })
  ).optional().default([])
});

export type EventFilesFormData = z.infer<typeof eventFilesSchema>;

// Flow schema for automation with better feedback
export const flowSchema = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: "Name ist erforderlich" })
    .min(3, "Name muss mindestens 3 Zeichen lang sein"),
  description: z.string({ required_error: "Beschreibung ist erforderlich" })
    .min(10, "Beschreibung muss mindestens 10 Zeichen lang sein"),
  trigger: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum(["date", "numOfAttendees", "status", "registration"], {
        required_error: "Triggertyp ist erforderlich",
        invalid_type_error: "Ungültiger Triggertyp",
      }),
      details: z.any(),
    })
  ).min(1, "Mindestens ein Auslöser ist erforderlich"),
  actions: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum([
        "email",
        "notification",
        "statusChange",
        "fileShare",
        "imageChange",
        "titleChange",
        "descriptionChange"
      ], {
        required_error: "Aktionstyp ist erforderlich",
        invalid_type_error: "Ungültiger Aktionstyp",
      }),
      details: z.any(),
    })
  ).min(1, "Mindestens eine Aktion ist erforderlich"),
});

export type FlowFormData = z.infer<typeof flowSchema>;

// Event Agenda Step Schema with improved validation
export const agendaStepSchema = z.object({
  id: z.string().optional(),
  title: z
    .string({ required_error: "Titel ist erforderlich" })
    .min(3, "Titel muss mindestens 3 Zeichen lang sein"),
  description: z.string().optional(),
  start: dateSchema,
  end: dateSchema,
}).refine(
  (data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return end > start;
  },
  {
    message: "Die Endzeit muss nach der Startzeit liegen",
    path: ["end"]
  }
);

export type AgendaStepFormData = z.infer<typeof agendaStepSchema>;

// Full Event Schema (combines all sections)
export const eventFullSchema = z.object({
  basicInfo: eventBasicInfoSchema,
  files: eventFilesSchema.optional(),
  flows: z.array(flowSchema).optional(),
  agenda: z.array(agendaStepSchema).optional(),
});

export type EventFullFormData = z.infer<typeof eventFullSchema>;

// Event Creation Schema combines all steps into a single schema
export const eventCreationSchema = z.object({
  basic: eventBasicInfoSchema,
  agenda: z.array(agendaStepSchema).min(1, "Mindestens ein Agenda-Eintrag ist erforderlich")
    .optional().default([]),
  flows: z.array(flowSchema).optional().default([]),
});

export type EventCreationFormData = z.infer<typeof eventCreationSchema>;

// Auth schemas
export const signInSchema = z.object({
  email: z.string({ required_error: "Email ist erforderlich" })
    .min(1, "Email ist erforderlich")
    .email("Ungültige Email-Adresse"),
  password: z.string({ required_error: "Passwort ist erforderlich" })
    .min(1, "Passwort ist erforderlich")
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .max(32, "Passwort darf maximal 32 Zeichen lang sein"),
});