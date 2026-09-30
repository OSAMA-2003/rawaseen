export type FollowUpType =
  | "PHONE_CALL"
  | "WHATSAPP"
  | "IN_PERSON_MEETING"
  | "SITE_VISIT";

export type FollowUpStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface IFollowUp {
  _id: string;
  leadId: {
    _id: string;
    name: string;
    phone: string;
    status: string;
    source: string;
    nextFollowUp?: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  scheduledDate: string;
  completedDate?: string;
  type: FollowUpType;
  notes?: string;
  status: FollowUpStatus;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}
