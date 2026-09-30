import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum FollowUpType {
  PHONE_CALL = "PHONE_CALL",
  WHATSAPP = "WHATSAPP",
  IN_PERSON_MEETING = "IN_PERSON_MEETING",
  SITE_VISIT = "SITE_VISIT",
}

export enum FollowUpStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IFollowUp {
  leadId: Types.ObjectId;
  assignedTo: Types.ObjectId;
  scheduledDate: Date;
  completedDate?: Date;
  type: FollowUpType;
  notes?: string;
  status: FollowUpStatus;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFollowUpDocument extends IFollowUp, Document {}

export interface IFollowUpModel extends Model<IFollowUpDocument> {}

const followUpSchema = new Schema<IFollowUpDocument>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned employee is required"],
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
      index: true,
    },
    completedDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: Object.values(FollowUpType),
      default: FollowUpType.PHONE_CALL,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(FollowUpStatus),
      default: FollowUpStatus.PENDING,
      index: true,
    },
    outcome: {
      type: String,
      trim: true,
      maxlength: [1000, "Outcome cannot exceed 1000 characters"],
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

// Compound index for employee daily schedule & overdue task views
followUpSchema.index({ assignedTo: 1, scheduledDate: 1, status: 1 });
followUpSchema.index({ leadId: 1, scheduledDate: -1 });

export const FollowUp = mongoose.model<IFollowUpDocument, IFollowUpModel>("FollowUp", followUpSchema);
