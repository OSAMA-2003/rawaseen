import { z } from "zod";
import { LeadSource, LeadStatus } from "../models";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const publicLeadInquirySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .max(20, "Phone number cannot exceed 20 characters"),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .optional()
      .or(z.literal("")),
    projectId: z
      .string()
      .regex(objectIdRegex, "Invalid Project ID format")
      .optional(),
    unitId: z
      .string()
      .regex(objectIdRegex, "Invalid Unit ID format")
      .optional(),
    budget: z
      .number()
      .min(0, "Budget must be positive")
      .optional(),
    message: z
      .string()
      .trim()
      .max(2000, "Message cannot exceed 2000 characters")
      .optional(),
    source: z
      .nativeEnum(LeadSource)
      .optional()
      .default(LeadSource.WEBSITE_INQUIRY),
  }),
});

export const createLeadSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .max(20, "Phone number cannot exceed 20 characters"),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .optional()
      .or(z.literal("")),
    projectId: z
      .string()
      .regex(objectIdRegex, "Invalid Project ID format")
      .optional(),
    unitId: z
      .string()
      .regex(objectIdRegex, "Invalid Unit ID format")
      .optional(),
    budget: z
      .number()
      .min(0, "Budget must be positive")
      .optional(),
    source: z
      .nativeEnum(LeadSource)
      .optional()
      .default(LeadSource.DIRECT_CALL),
    status: z
      .nativeEnum(LeadStatus)
      .optional()
      .default(LeadStatus.NEW),
    assignedTo: z
      .string()
      .regex(objectIdRegex, "Invalid Assigned User ID format")
      .optional(),
    initialNote: z
      .string()
      .trim()
      .max(2000, "Note cannot exceed 2000 characters")
      .optional(),
  }),
});

export const updateLeadSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .max(20, "Phone number cannot exceed 20 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .optional()
      .or(z.literal("")),
    projectId: z
      .string()
      .regex(objectIdRegex, "Invalid Project ID format")
      .nullable()
      .optional(),
    unitId: z
      .string()
      .regex(objectIdRegex, "Invalid Unit ID format")
      .nullable()
      .optional(),
    budget: z
      .number()
      .min(0, "Budget must be positive")
      .nullable()
      .optional(),
    source: z
      .nativeEnum(LeadSource)
      .optional(),
    status: z
      .nativeEnum(LeadStatus)
      .optional(),
    assignedTo: z
      .string()
      .regex(objectIdRegex, "Invalid Assigned User ID format")
      .nullable()
      .optional(),
    lostReason: z
      .string()
      .trim()
      .max(500, "Lost reason cannot exceed 500 characters")
      .optional(),
    nextFollowUp: z
      .string()
      .datetime()
      .or(z.date())
      .nullable()
      .optional(),
  }),
});

export const addLeadNoteSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: "Note content is required" })
      .trim()
      .min(1, "Note content cannot be empty")
      .max(2000, "Note content cannot exceed 2000 characters"),
  }),
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 15)),
    search: z.string().trim().optional(),
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    projectId: z.string().regex(objectIdRegex).optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "name", "nextFollowUp", "budget"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export type PublicLeadInquiryInput = z.infer<typeof publicLeadInquirySchema>["body"];
export type CreateLeadInput = z.infer<typeof createLeadSchema>["body"];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>["body"];
export type AddLeadNoteInput = z.infer<typeof addLeadNoteSchema>["body"];
export type GetLeadsQuery = z.infer<typeof getLeadsQuerySchema>["query"];
