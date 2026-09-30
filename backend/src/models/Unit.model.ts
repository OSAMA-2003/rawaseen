import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ILocalizedString } from "./Project.model";

export enum UnitType {
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

export enum UnitStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
}

export enum UnitFinishing {
  CORE_AND_SHELL = "CORE_AND_SHELL",
  SEMI_FINISHED = "SEMI_FINISHED",
  FULLY_FINISHED = "FULLY_FINISHED",
}

export enum UnitView {
  GARDEN = "GARDEN",
  POOL = "POOL",
  STREET = "STREET",
  SEA = "SEA",
  COMPOUND = "COMPOUND",
}

export interface IUnit {
  projectId: Types.ObjectId;
  unitNumber: string;
  type: UnitType;
  area: number; // in square meters
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  price: number;
  downPayment?: number;
  downPaymentPercentage?: number;
  installmentYears?: number;
  monthlyInstallment?: number;
  finishing?: UnitFinishing | string;
  view?: UnitView | string;
  status: UnitStatus;
  images: string[];
  floorPlan?: string;
  description?: ILocalizedString;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnitDocument extends IUnit, Document {}

export interface IUnitModel extends Model<IUnitDocument> {}

const localizedStringSchema = new Schema<ILocalizedString>(
  {
    en: { type: String, trim: true },
    ar: { type: String, trim: true },
  },
  { _id: false }
);

const unitSchema = new Schema<IUnitDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
      index: true,
    },
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(UnitType),
      required: [true, "Unit type is required"],
      index: true,
    },
    area: {
      type: Number,
      required: [true, "Area (SQM) is required"],
      min: [1, "Area must be at least 1 SQM"],
      index: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: [0, "Bathrooms cannot be negative"],
    },
    floor: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
      index: true,
    },
    downPayment: {
      type: Number,
      min: [0, "Down payment cannot be negative"],
    },
    downPaymentPercentage: {
      type: Number,
      min: [0, "Down payment percentage cannot be negative"],
      max: [100, "Down payment percentage cannot exceed 100"],
    },
    installmentYears: {
      type: Number,
      min: [0, "Installment years cannot be negative"],
    },
    monthlyInstallment: {
      type: Number,
      min: [0, "Monthly installment cannot be negative"],
    },
    finishing: {
      type: String,
      enum: Object.values(UnitFinishing),
      default: UnitFinishing.FULLY_FINISHED,
      index: true,
    },
    view: {
      type: String,
      enum: Object.values(UnitView),
      default: UnitView.COMPOUND,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UnitStatus),
      default: UnitStatus.AVAILABLE,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    floorPlan: {
      type: String,
    },
    description: {
      type: localizedStringSchema,
    },
    features: {
      type: [String],
      default: [],
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

// Compound unique index: prevents duplicate unit numbers within the same project
unitSchema.index({ projectId: 1, unitNumber: 1 }, { unique: true });

// Compound index for catalog querying
unitSchema.index({ status: 1, price: 1, type: 1, area: 1, finishing: 1, view: 1 });

export const Unit = mongoose.model<IUnitDocument, IUnitModel>("Unit", unitSchema);
