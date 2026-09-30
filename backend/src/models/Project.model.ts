import mongoose, { Document, Model, Schema } from "mongoose";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMING_SOON = "COMING_SOON",
  SOLD_OUT = "SOLD_OUT",
  INACTIVE = "INACTIVE",
  PLANNING = "PLANNING",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  COMPLETED = "COMPLETED",
  OFF_PLAN = "OFF_PLAN",
  READY = "READY",
  NEAR_DELIVERY = "NEAR_DELIVERY",
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  TOWNHOUSE = "TOWNHOUSE",
  TWIN_HOUSE = "TWIN_HOUSE",
  DUPLEX = "DUPLEX",
  CHALET = "CHALET",
  COMMERCIAL = "COMMERCIAL",
  LAND = "LAND",
  PENTHOUSE = "PENTHOUSE",
  OFFICE = "OFFICE",
}

export type InstallmentFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUAL"
  | "ANNUAL";

export interface IPaymentPlan {
  title: string;
  downPaymentPercentage: number;
  installmentYears: number;
  monthlyInstallment?: number;
  installmentFrequency?: InstallmentFrequency;
  discountPercentage?: number;
  deliveryPaymentPercentage?: number;
  description?: string;
}

export interface ILocalizedString {
  en: string;
  ar: string;
}

export interface IProjectLocation {
  address: string;
  city: string;
  governorate: string;
  area?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
}

export interface IProject {
  name: ILocalizedString;
  slug: string;
  description: ILocalizedString;
  developer: string;
  projectType?: PropertyType | string;
  projectTypes?: PropertyType[];
  status: ProjectStatus;
  coverImage: string;
  images?: string[];
  gallery: string[];
  masterPlan?: string;
  location: IProjectLocation;
  startingPrice: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  deliveryDate?: string | Date;
  amenities: string[];
  paymentPlans: IPaymentPlan[];
  unitsCount?: number;
  totalUnits?: number;
  availableUnits?: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject, Document {}

export interface IProjectModel extends Model<IProjectDocument> {}

const localizedStringSchema = new Schema<ILocalizedString>(
  {
    en: { type: String, required: [true, "English text is required"], trim: true },
    ar: { type: String, required: [true, "Arabic text is required"], trim: true },
  },
  { _id: false }
);

const projectLocationSchema = new Schema<IProjectLocation>(
  {
    address: { type: String, required: [true, "Address is required"], trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    governorate: { type: String, required: [true, "Governorate is required"], trim: true },
    area: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const paymentPlanSchema = new Schema<IPaymentPlan>(
  {
    title: {
      type: String,
      required: [true, "Payment plan title is required"],
      trim: true,
    },
    downPaymentPercentage: {
      type: Number,
      required: [true, "Down payment percentage is required"],
      min: [0, "Down payment percentage cannot be negative"],
      max: [100, "Down payment percentage cannot exceed 100"],
    },
    installmentYears: {
      type: Number,
      required: [true, "Installment years is required"],
      min: [0, "Installment years cannot be negative"],
      max: [30, "Installment years cannot exceed 30"],
    },
    monthlyInstallment: {
      type: Number,
      min: [0, "Monthly installment cannot be negative"],
    },
    installmentFrequency: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"],
      default: "MONTHLY",
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100"],
      default: 0,
    },
    deliveryPaymentPercentage: {
      type: Number,
      min: [0, "Delivery payment percentage cannot be negative"],
      max: [100, "Delivery payment percentage cannot exceed 100"],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const projectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: localizedStringSchema,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    developer: {
      type: String,
      default: "Rawasin Real Estate",
      trim: true,
    },
    projectType: {
      type: String,
      enum: Object.values(PropertyType),
      index: true,
    },
    projectTypes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
      index: true,
    },
    coverImage: {
      type: String,
      required: [true, "Cover image URL is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    masterPlan: {
      type: String,
    },
    location: {
      type: projectLocationSchema,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Starting price must be positive"],
      index: true,
    },
    maxPrice: {
      type: Number,
      min: [0, "Max price must be positive"],
    },
    minArea: {
      type: Number,
      min: [0, "Min area must be positive"],
    },
    maxArea: {
      type: Number,
      min: [0, "Max area must be positive"],
    },
    deliveryDate: {
      type: Schema.Types.Mixed,
    },
    amenities: {
      type: [String],
      default: [],
    },
    paymentPlans: {
      type: [paymentPlanSchema],
      default: [],
    },
    unitsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for bilingual search
projectSchema.index({
  "name.en": "text",
  "name.ar": "text",
  "description.en": "text",
  "description.ar": "text",
  "location.city": "text",
  "location.governorate": "text",
  "location.area": "text",
});

// Auto slug generation helper pre-validation
projectSchema.pre("validate", function (next) {
  if (!this.slug && this.name?.en) {
    this.slug = this.name.en
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

export const Project = mongoose.model<IProjectDocument, IProjectModel>("Project", projectSchema);
