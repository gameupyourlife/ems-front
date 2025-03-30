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
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  start: dateSchema,
  end: dateSchema,
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  image: z.string().optional(),
  status: z.string().optional(),
}).refine(
  (data) => {
    // Check if date+time combinations are valid
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
    return endDateTime > startDateTime;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"]
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
  startTime: dateSchema,
  endTime: dateSchema,
}).refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
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