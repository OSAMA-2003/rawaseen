import { z } from "zod";
import { FollowUpStatus, FollowUpType } from "../models";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createFollowUpSchema = z.object({
  body: z.object({
    leadId: z
      .string({ required_error: "Lead ID is required" })
      .regex(objectIdRegex, "Invalid Lead ID format"),
    scheduledDate: z
      .string({ required_error: "Scheduled date is required" })
      .datetime({ message: "Scheduled date must be a valid ISO datetime" })
      .or(z.date()),
    type: z
      .nativeEnum(FollowUpType)
      .optional()
      .default(FollowUpType.PHONE_CALL),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
    assignedTo: z
      .string()
      .regex(objectIdRegex, "Invalid Assigned User ID format")
      .optional(),
  }),
});

export const updateFollowUpSchema = z.object({
  body: z.object({
    scheduledDate: z
      .string()
      .datetime({ message: "Scheduled date must be a valid ISO datetime" })
      .or(z.date())
      .optional(),
    type: z
      .nativeEnum(FollowUpType)
      .optional(),
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
    status: z
      .nativeEnum(FollowUpStatus)
      .optional(),
    outcome: z
      .string()
      .trim()
      .max(1000, "Outcome cannot exceed 1000 characters")
      .optional(),
  }),
});

export const getFollowUpsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20)),
    leadId: z.string().regex(objectIdRegex).optional(),
    status: z.nativeEnum(FollowUpStatus).optional(),
    type: z.nativeEnum(FollowUpType).optional(),
    assignedTo: z.string().regex(objectIdRegex).optional(),
    timeframe: z.enum(["today", "upcoming", "overdue", "all"]).optional(),
    sortBy: z.enum(["scheduledDate", "createdAt"]).optional().default("scheduledDate"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  }),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>["body"];
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>["body"];
export type GetFollowUpsQuery = z.infer<typeof getFollowUpsQuerySchema>["query"];
