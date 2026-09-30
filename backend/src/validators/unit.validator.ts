import { z } from "zod";
import { UnitFinishing, UnitStatus, UnitType, UnitView } from "../models";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const localizedStringSchema = z
  .object({
    en: z.string().trim().optional(),
    ar: z.string().trim().optional(),
  })
  .optional();

export const createUnitSchema = z.object({
  body: z.object({
    projectId: z
      .string({ required_error: "Project ID is required" })
      .regex(objectIdRegex, "Invalid Project ID format"),
    unitNumber: z.string({ required_error: "Unit number is required" }).trim().min(1),
    type: z.nativeEnum(UnitType, { required_error: "Unit type is required" }),
    area: z.number({ required_error: "Area is required" }).min(1, "Area must be at least 1 SQM"),
    bedrooms: z.number().min(0).optional().default(0),
    bathrooms: z.number().min(0).optional().default(1),
    floor: z.number().optional(),
    price: z.number({ required_error: "Price is required" }).min(0, "Price must be positive"),
    downPayment: z.number().min(0).optional(),
    downPaymentPercentage: z.number().min(0).max(100).optional(),
    installmentYears: z.number().min(0).optional(),
    monthlyInstallment: z.number().min(0).optional(),
    finishing: z.nativeEnum(UnitFinishing).optional().default(UnitFinishing.FULLY_FINISHED),
    view: z.nativeEnum(UnitView).optional().default(UnitView.COMPOUND),
    status: z.nativeEnum(UnitStatus).optional().default(UnitStatus.AVAILABLE),
    images: z.array(z.string()).optional().default([]),
    floorPlan: z.string().trim().optional(),
    floorPlanUrl: z.string().trim().optional(),
    description: localizedStringSchema,
    features: z.array(z.string()).optional().default([]),
  }),
});

export const updateUnitSchema = z.object({
  body: createUnitSchema.shape.body.partial(),
});

export const getUnitsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 12)),
    search: z.string().trim().optional(),
    projectId: z.string().regex(objectIdRegex).optional(),
    city: z.string().trim().optional(),
    governorate: z.string().trim().optional(),
    area: z.string().trim().optional(),
    type: z.nativeEnum(UnitType).or(z.string()).optional(),
    status: z.nativeEnum(UnitStatus).or(z.string()).optional(),
    finishing: z.nativeEnum(UnitFinishing).or(z.string()).optional(),
    view: z.nativeEnum(UnitView).or(z.string()).optional(),
    floor: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    minArea: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxArea: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    installmentYears: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    minDownPayment: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxDownPayment: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    downPaymentPercentage: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    monthlyInstallment: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    sortBy: z.enum(["createdAt", "price", "area", "unitNumber"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>["body"];
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>["body"];
export type GetUnitsQuery = z.infer<typeof getUnitsQuerySchema>["query"];
