import { z } from "zod";
import { UserRole } from "../models";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .trim()
      .min(7, "Phone number must be at least 7 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    role: z
      .nativeEnum(UserRole)
      .optional()
      .default(UserRole.SALES),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number must be at least 7 characters")
      .optional(),
    role: z
      .nativeEnum(UserRole)
      .optional(),
    isActive: z
      .boolean()
      .optional(),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    role: z.nativeEnum(UserRole).optional(),
    search: z.string().trim().optional(),
    isActive: z
      .string()
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>["query"];
