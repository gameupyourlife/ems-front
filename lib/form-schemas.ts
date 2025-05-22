import { z } from "zod";

// Common date validation
const dateSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: "Please enter a valid date and time" }
);

// Event Basic Info Schema
export const eventBasicInfoSchema = z.object({
  title: z.string().min(3, "Der Titel muss mindestens 3 Zeichen lang sein"),
  description: z.string().min(10, "Die Beschreibung muss mindestens 10 Zeichen lang sein"),
  category: z.string().min(1, "Bitte wählen Sie eine Kategorie aus"),
  capacity: z.coerce.number().int().min(1, "Die Kapazität muss mindestens 1 sein"),
  location: z.string().min(3, "Der Ort muss mindestens 3 Zeichen lang sein"),
  start: z.date(),
  end: z.date(),
  image: z.string().optional(),
  status: z.string().optional().default("bevorstehend"),
}).refine(
  (data) => {
    // Check if date combinations are valid
    return data.end > data.start;
  },
  {
    message: "End time must be after start time",
    path: ["end"]
  }
);

export type EventBasicInfoFormData = z.infer<typeof eventBasicInfoSchema>;

// Event Files Schema
export const eventFilesSchema = z.object({
  files: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })
  )
});

export type EventFilesFormData = z.infer<typeof eventFilesSchema>;

// Flow schema for automation
export const flowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  trigger: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum(["date", "numOfAttendees", "status", "registration"]),
      details: z.any(),
    })
  ).min(1, "At least one trigger is required"),
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
      ]),
      details: z.any(),
    })
  ).min(1, "At least one action is required"),
});

export type FlowFormData = z.infer<typeof flowSchema>;

// Event Agenda Step Schema
export const agendaStepSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
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
    message: "End time must be after start time",
    path: ["endTime"]
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


export const signInSchema = z.object({
  email: z.string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})