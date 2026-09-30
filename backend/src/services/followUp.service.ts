import { Types } from "mongoose";
import { FollowUp, FollowUpStatus, IFollowUpDocument, IUserDocument, Lead, UserRole } from "../models";
import { ApiError } from "../utils/apiError";
import { PaginationMeta } from "../utils/apiResponse";
import { CreateFollowUpInput, GetFollowUpsQuery, UpdateFollowUpInput } from "../validators/followUp.validator";

export interface PaginatedFollowUpsResult {
  followUps: IFollowUpDocument[];
  meta: PaginationMeta;
}

export class FollowUpService {
  /**
   * Helper to recalibrate lead's nextFollowUp date
   */
  private static async syncLeadNextFollowUp(leadId: Types.ObjectId) {
    const nextPending = await FollowUp.findOne({
      leadId,
      status: FollowUpStatus.PENDING,
      scheduledDate: { $gte: new Date() },
    }).sort({ scheduledDate: 1 });

    await Lead.findByIdAndUpdate(leadId, {
      nextFollowUp: nextPending ? nextPending.scheduledDate : null,
    });
  }

  /**
   * Schedule a new follow-up
   */
  static async createFollowUp(
    data: CreateFollowUpInput,
    currentUser: IUserDocument
  ): Promise<IFollowUpDocument> {
    const lead = await Lead.findById(data.leadId);
    if (!lead) {
      throw ApiError.notFound(`Lead with ID '${data.leadId}' not found`);
    }

    // Role check: sales reps can only create follow-ups for their own leads
    if (
      currentUser.role === UserRole.SALES &&
      lead.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden(
        "Access denied. You can only schedule follow-ups for leads assigned to you"
      );
    }

    let assignedTo = currentUser._id as Types.ObjectId;
    if (currentUser.role !== UserRole.SALES && data.assignedTo) {
      assignedTo = new Types.ObjectId(data.assignedTo);
    } else if (lead.assignedTo) {
      assignedTo = lead.assignedTo;
    }

    const scheduledDate = new Date(data.scheduledDate);

    const followUp = await FollowUp.create({
      leadId: lead._id,
      assignedTo,
      scheduledDate,
      type: data.type,
      notes: data.notes,
      status: FollowUpStatus.PENDING,
    });

    // Update parent lead's nextFollowUp date
    await this.syncLeadNextFollowUp(lead._id as Types.ObjectId);

    return (await FollowUp.findById(followUp._id)
      .populate("leadId", "name phone status source")
      .populate("assignedTo", "name email role")) as IFollowUpDocument;
  }

  /**
   * Get paginated follow-ups with timeframe & role filtering
   */
  static async getFollowUps(
    query: GetFollowUpsQuery,
    currentUser: IUserDocument
  ): Promise<PaginatedFollowUpsResult> {
    const filter: Record<string, any> = {};

    // RBAC: Sales reps can only view their own tasks
    if (currentUser.role === UserRole.SALES) {
      filter.assignedTo = currentUser._id;
    } else if (query.assignedTo) {
      filter.assignedTo = new Types.ObjectId(query.assignedTo);
    }

    if (query.leadId) {
      filter.leadId = new Types.ObjectId(query.leadId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.type) {
      filter.type = query.type;
    }

    // Timeframe filtering
    const now = new Date();
    if (query.timeframe === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (query.timeframe === "upcoming") {
      filter.scheduledDate = { $gte: now };
      if (!query.status) filter.status = FollowUpStatus.PENDING;
    } else if (query.timeframe === "overdue") {
      filter.scheduledDate = { $lt: now };
      filter.status = FollowUpStatus.PENDING;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || "scheduledDate"]: query.sortOrder === "desc" ? -1 : 1,
    };

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter)
        .populate("leadId", "name phone status source nextFollowUp")
        .populate("assignedTo", "name email role")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      FollowUp.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      followUps,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single follow-up by ID
   */
  static async getFollowUpById(
    id: string,
    currentUser: IUserDocument
  ): Promise<IFollowUpDocument> {
    const followUp = await FollowUp.findById(id)
      .populate("leadId", "name phone status source nextFollowUp")
      .populate("assignedTo", "name email role");

    if (!followUp) {
      throw ApiError.notFound(`Follow-up with ID '${id}' not found`);
    }

    if (
      currentUser.role === UserRole.SALES &&
      followUp.assignedTo?._id?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only view follow-ups assigned to you");
    }

    return followUp;
  }

  /**
   * Update follow-up status (e.g. mark completed with outcome) or reschedule
   */
  static async updateFollowUp(
    id: string,
    data: UpdateFollowUpInput,
    currentUser: IUserDocument
  ): Promise<IFollowUpDocument> {
    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      throw ApiError.notFound(`Follow-up with ID '${id}' not found`);
    }

    if (
      currentUser.role === UserRole.SALES &&
      followUp.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only update follow-ups assigned to you");
    }

    if (data.scheduledDate !== undefined) {
      followUp.scheduledDate = new Date(data.scheduledDate);
    }

    if (data.type !== undefined) {
      followUp.type = data.type;
    }

    if (data.notes !== undefined) {
      followUp.notes = data.notes;
    }

    if (data.status !== undefined) {
      followUp.status = data.status;
      if (data.status === FollowUpStatus.COMPLETED) {
        followUp.completedDate = new Date();
      }
    }

    if (data.outcome !== undefined) {
      followUp.outcome = data.outcome;
    }

    await followUp.save();

    // Recalibrate lead next follow up
    await this.syncLeadNextFollowUp(followUp.leadId as Types.ObjectId);

    return this.getFollowUpById(id, currentUser);
  }

  /**
   * Delete follow-up task
   */
  static async deleteFollowUp(
    id: string,
    currentUser: IUserDocument
  ): Promise<{ deleted: boolean; id: string }> {
    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      throw ApiError.notFound(`Follow-up with ID '${id}' not found`);
    }

    if (
      currentUser.role === UserRole.SALES &&
      followUp.assignedTo?.toString() !== currentUser._id.toString()
    ) {
      throw ApiError.forbidden("Access denied. You can only delete follow-ups assigned to you");
    }

    const leadId = followUp.leadId as Types.ObjectId;
    await followUp.deleteOne();

    // Recalibrate lead next follow up
    await this.syncLeadNextFollowUp(leadId);

    return { deleted: true, id };
  }
}
