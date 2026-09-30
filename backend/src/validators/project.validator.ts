import { z } from "zod";
import { ProjectStatus, PropertyType } from "../models";

const localizedStringSchema = z.object({
  en: z.string({ required_error: "English text is required" }).min(2).trim(),
  ar: z.string({ required_error: "Arabic text is required" }).min(2).trim(),
});

const projectLocationSchema = z.object({
  address: z.string({ required_error: "Address is required" }).trim(),
  city: z.string({ required_error: "City is required" }).trim(),
  governorate: z.string({ required_error: "Governorate is required" }).trim(),
  area: z.string().trim().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const paymentPlanInputSchema = z.object({
  title: z.string({ required_error: "Payment plan title is required" }).min(1).trim(),
  downPaymentPercentage: z
    .number({ required_error: "Down payment percentage is required" })
    .min(0, "Down payment percentage cannot be negative")
    .max(100, "Down payment percentage cannot exceed 100"),
  installmentYears: z
    .number({ required_error: "Installment years is required" })
    .min(0, "Installment years cannot be negative")
    .max(30, "Installment years cannot exceed 30"),
  monthlyInstallment: z.number().min(0).optional(),
  installmentFrequency: z
    .enum(["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"])
    .optional()
    .default("MONTHLY"),
  discountPercentage: z
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100")
    .optional()
    .default(0),
  deliveryPaymentPercentage: z
    .number()
    .min(0, "Delivery payment percentage cannot be negative")
    .max(100, "Delivery payment percentage cannot exceed 100")
    .optional()
    .default(0),
  description: z.string().trim().optional(),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: localizedStringSchema,
    slug: z.string().trim().toLowerCase().optional(),
    description: localizedStringSchema,
    developer: z.string().trim().optional().default("Rawasin Real Estate"),
    projectType: z.nativeEnum(PropertyType).or(z.string()).optional(),
    projectTypes: z.array(z.nativeEnum(PropertyType).or(z.string())).optional().default([]),
    status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.ACTIVE),
    coverImage: z.string({ required_error: "Cover image is required" }).min(1, "Cover image is required"),
    images: z.array(z.string()).optional().default([]),
    gallery: z.array(z.string()).optional().default([]),
    masterPlan: z.string().trim().optional(),
    location: projectLocationSchema,
    startingPrice: z.number({ required_error: "Starting price is required" }).min(0),
    maxPrice: z.number().min(0).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),
    deliveryDate: z.string().or(z.date()).optional(),
    amenities: z.array(z.string()).optional().default([]),
    paymentPlans: z.array(paymentPlanInputSchema).optional().default([]),
    unitsCount: z.number().min(0).optional(),
    totalUnits: z.number().min(0).optional(),
    availableUnits: z.number().min(0).optional(),
    isFeatured: z.boolean().optional().default(false),
  }),
});

export const updateProjectSchema = z.object({
  body: createProjectSchema.shape.body.partial(),
});

export const getProjectsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 10)),
    search: z.string().trim().optional(),
    city: z.string().trim().optional(),
    governorate: z.string().trim().optional(),
    area: z.string().trim().optional(),
    status: z.nativeEnum(ProjectStatus).or(z.string()).optional(),
    projectStatus: z.string().optional(),
    propertyType: z.string().trim().optional(),
    isFeatured: z.string().optional().transform((v) => (v === undefined ? undefined : v === "true")),
    minPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxPrice: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    minArea: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxArea: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    installmentDuration: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    installmentYears: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    minDownPayment: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxDownPayment: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    downPaymentPercentage: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    finishing: z.string().optional(),
    view: z.string().optional(),
    amenity: z.string().optional(),
    amenities: z.string().or(z.array(z.string())).optional(),
    availableUnitsOnly: z.string().optional().transform((v) => v === "true"),
    sortBy: z.enum(["createdAt", "startingPrice", "name.en", "minArea"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

export type PaymentPlanInput = z.infer<typeof paymentPlanInputSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
export type GetProjectsQuery = z.infer<typeof getProjectsQuerySchema>["query"];
