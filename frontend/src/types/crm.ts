export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "SITE_VISIT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type LeadSource =
  | "WEBSITE_INQUIRY"
  | "WHATSAPP"
  | "DIRECT_CALL"
  | "CAMPAIGN"
  | "WALK_IN"
  | "REFERRAL";

export interface ILeadNote {
  _id?: string;
  content: string;
  createdBy?: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface ILead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  budget?: number;
  source: LeadSource;
  status: LeadStatus;
  projectId?: {
    _id: string;
    name: { en: string; ar: string };
    slug?: string;
    coverImage?: string;
    startingPrice?: number;
  };
  unitId?: {
    _id: string;
    unitNumber: string;
    type: string;
    price: number;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  };
  notes: ILeadNote[];
  nextFollowUp?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoardData {
  NEW: ILead[];
  CONTACTED: ILead[];
  INTERESTED: ILead[];
  SITE_VISIT: ILead[];
  NEGOTIATION: ILead[];
  WON: ILead[];
  LOST: ILead[];
}
