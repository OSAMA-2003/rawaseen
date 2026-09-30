import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  SITE_VISIT = "SITE_VISIT",
  NEGOTIATION = "NEGOTIATION",
  WON = "WON",
  LOST = "LOST",
}

export enum LeadSource {
  WEBSITE_INQUIRY = "WEBSITE_INQUIRY",
  WHATSAPP = "WHATSAPP",
  DIRECT_CALL = "DIRECT_CALL",
  CAMPAIGN = "CAMPAIGN",
  WALK_IN = "WALK_IN",
  REFERRAL = "REFERRAL",
}

export interface ILeadNote {
  _id?: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface ILead {
  name: string;
  phone: string;
  email?: string;
  projectId?: Types.ObjectId;
  unitId?: Types.ObjectId;
  budget?: number;
  source: LeadSource;
  status: LeadStatus;
  assignedTo?: Types.ObjectId;
  notes: ILeadNote[];
  nextFollowUp?: Date;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeadDocument extends ILead, Document {}

export interface ILeadModel extends Model<ILeadDocument> {}

const leadNoteSchema = new Schema<ILeadNote>(
  {
    content: {
      type: String,
      required: [true, "Note content cannot be empty"],
      trim: true,
      maxlength: [2000, "Note cannot exceed 2000 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const leadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      index: true,
    },
    budget: {
      type: Number,
      min: [0, "Budget must be positive"],
    },
    source: {
      type: String,
      enum: Object.values(LeadSource),
      default: LeadSource.WEBSITE_INQUIRY,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    notes: {
      type: [leadNoteSchema],
      default: [],
    },
    nextFollowUp: {
      type: Date,
      index: true,
    },
    lostReason: {
      type: String,
      trim: true,
      maxlength: [500, "Lost reason cannot exceed 500 characters"],
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

// Compound indexes for CRM queries and Kanban board rendering
leadSchema.index({ status: 1, assignedTo: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model<ILeadDocument, ILeadModel>("Lead", leadSchema);
