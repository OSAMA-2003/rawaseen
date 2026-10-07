import { Types } from "mongoose";
import { FollowUp, ILeadDocument, IUserDocument, Lead, LeadSource, LeadStatus, UserRole } from "../models";
import { ApiError } from "../utils/apiError";
import { PaginationMeta } from "../utils/apiResponse";
import {
  CreateLeadInput,
  GetLeadsQuery,
  PublicLeadInquiryInput,
  UpdateLeadInput,
} from "../validators/lead.validator";

export interface PaginatedLeadsResult {
  leads: ILeadDocument[];
  meta: PaginationMeta;
}

export interface KanbanBoardResult {
  [key: string]: ILeadDocument[];
}

export class LeadService {
  /**
   * Public inquiry submission from website landing/catalog pages
   */
  static async submitPublicInquiry(data: PublicLeadInquiryInput): Promise<ILeadDocument> {
    const notes = data.message
      ? [
          {
            content: data.message,
            createdAt: new Date(),
          },
        ]
      : [];

    const lead = await Lead.create({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      projectId: data.projectId ? new Types.ObjectId(data.projectId) : undefined,
      unitId: data.unitId ? new Types.ObjectId(data.unitId) : undefined,
      budget: data.budget,
      source: data.source || LeadSource.WEBSITE_INQUIRY,
      status: LeadStatus.NEW,
      notes,
    });

    return lead;
  }

  /**
   * Internal staff creation of a lead (walk-ins, phone inquiries, referrals)
   */
  static async createLead(
    data: CreateLeadInput,
    currentUser: IUserDocument
  ): Promise<ILeadDocument> {
    let assignedTo = data.assignedTo
      ? new Types.ObjectId(data.assignedTo)
      : undefined;

    // If a sales agent creates a lead, default to assigning it to themselves
    if (currentUser.role === UserRole.SALES && !assignedTo) {
      assignedTo = currentUser._id as Types.ObjectId;
    }

    const notes = data.initialNote
      ? [
          {
            content: data.initialNote,
            createdBy: currentUser._id as Types.ObjectId,
            createdAt: new Date(),
          },
        ]
      : [];

    const lead = await Lead.create({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      projectId: data.projectId ? new Types.ObjectId(data.projectId) : undefined,
      unitId: data.unitId ? new Types.ObjectId(data.unitId) : undefined,
      budget: data.budget,
      source: data.source || LeadSource.DIRECT_CALL,
      status: data.status || LeadStatus.NEW,
      assignedTo,
      notes,
    });

    return lead;
  }

  /**
   * Query leads with role-based filtering and pagination
   */
  static async getLeads(
    query: GetLeadsQuery,
    currentUser: IUserDocument
  ): Promise<PaginatedLeadsResult> {
    const filter: Record<string, any> = {};

    // RBAC: Sales representatives can ONLY view their assigned leads
    if (currentUser.role === UserRole.SALES) {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = new Types.ObjectId(query.assignedTo);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.source) {
      filter.source = query.source;
    }

    if (query.projectId) {
      filter.projectId = new Types.ObjectId(query.projectId);
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { phone: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || "createdAt"]: query.sortOrder === "asc" ? 1 : -1,
    };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate("projectId", "name slug location coverImage status startingPrice")
        .populate("unitId", "unitNumber type price status")
        .populate("assignedTo", "name email phone role")
        .populate("notes.createdBy", "name email role")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      leads,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Kanban board aggregation for CRM pipelines
   */
  static async getKanbanBoard(currentUser: IUserDocument): Promise<KanbanBoardResult> {
    const filter: Record<string, any> = {};

    if (currentUser.role === UserRole.SALES) {
      filter.assignedTo = currentUser._id;
    }

    const allLeads = await Lead.find(filter)
      .populate("projectId", "name slug coverImage startingPrice")
      .populate("unitId", "unitNumber type price")
      .populate("assignedTo", "name email role")
      .sort({ updatedAt: -1 });

    const kanban: KanbanBoardResult = {
      [LeadStatus.NEW]: [],
      [LeadStatus.CONTACTED]: [],
      [LeadStatus.INTERESTED]: [],
      [LeadStatus.SITE_VISIT]: [],
      [LeadStatus.NEGOTIATION]: [],
      [LeadStatus.WON]: [],
      [LeadStatus.LOST]: [],
    };

    for (const lead of allLeads) {
      if (kanban[lead.status]) {
        kanban[lead.status].push(lead);
      }
    }

    return kanban;
  }

  /**
   * Get single lead by ID with access control
   */
  static async getLeadById(id: string, currentUser: IUserDocument): Promise<ILeadDocument> {
    const lead = await Lead.findById(id)
      .populate("projectId", "name slug location coverImage status startingPrice")
      .populate("unitId", "unitNumber type price area status")
      .populate("assignedTo", "name email phone role")
      .populate("notes.createdBy", "name email role");

    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${id}' not found`);
    }

    // Role check
    if (
      currentUser.role === UserRole.SALES &&
      lead.assignedTo?._id?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only view leads assigned to you");
    }

    return lead;
  }

  /**
   * Update lead with RBAC checks
   */
  static async updateLead(
    id: string,
    data: UpdateLeadInput,
    currentUser: IUserDocument
  ): Promise<ILeadDocument> {
    const lead = await Lead.findById(id);

    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${id}' not found`);
    }

    // Sales reps cannot update someone else's lead
    if (
      currentUser.role === UserRole.SALES &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only update leads assigned to you");
    }

    // Sales reps cannot reassign leads to another agent
    if (data.assignedTo !== undefined && currentUser.role === UserRole.SALES) {
      throw ApiError.forbidden("Sales representatives are not authorized to reassign leads");
    }

    if (data.name !== undefined) lead.name = data.name;
    if (data.phone !== undefined) lead.phone = data.phone;
    if (data.email !== undefined) lead.email = data.email || undefined;
    if (data.projectId !== undefined)
      lead.projectId = data.projectId ? new Types.ObjectId(data.projectId) : undefined;
    if (data.unitId !== undefined)
      lead.unitId = data.unitId ? new Types.ObjectId(data.unitId) : undefined;
    if (data.budget !== undefined) lead.budget = data.budget ?? undefined;
    if (data.source !== undefined) lead.source = data.source;
    if (data.status !== undefined) lead.status = data.status;
    if (data.lostReason !== undefined) lead.lostReason = data.lostReason;
    if (data.nextFollowUp !== undefined)
      lead.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : undefined;

    // Admins and managers can reassign
    if (data.assignedTo !== undefined) {
      lead.assignedTo = data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined;
    }

    await lead.save();

    return this.getLeadById(id, currentUser);
  }

  /**
   * Add interaction note to lead
   */
  static async addNote(
    id: string,
    content: string,
    currentUser: IUserDocument
  ): Promise<ILeadDocument> {
    const lead = await Lead.findById(id);

    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${id}' not found`);
    }

    if (
      currentUser.role === UserRole.SALES &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only add notes to leads assigned to you");
    }

    lead.notes.push({
      content,
      createdBy: currentUser._id as Types.ObjectId,
      createdAt: new Date(),
    });

    await lead.save();

    return this.getLeadById(id, currentUser);
  }

  /**
   * Delete lead and its associated follow-up tasks (Admin only)
   */
  static async deleteLead(id: string): Promise<{ deleted: boolean; id: string }> {
    const lead = await Lead.findById(id);

    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${id}' not found`);
    }

    // Cascade delete follow-ups
    await FollowUp.deleteMany({ leadId: lead._id });
    await lead.deleteOne();

    return { deleted: true, id };
  }
}
