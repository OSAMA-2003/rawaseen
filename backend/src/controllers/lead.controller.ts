import { NextFunction, Request, Response } from "express";
import { LeadService } from "../services/lead.service";
import { sendSuccess } from "../utils/apiResponse";

export class LeadController {
  static async submitPublicInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.submitPublicInquiry(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Thank you for reaching out. A Rawasin property consultant will contact you shortly.",
        data: lead,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.createLead(req.body, req.user!);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Lead created successfully",
        data: lead,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { leads, meta } = await LeadService.getLeads(req.query as any, req.user!);
      return sendSuccess({
        res,
        message: "Leads retrieved successfully",
        data: leads,
        meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getKanbanBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const kanban = await LeadService.getKanbanBoard(req.user!);
      return sendSuccess({
        res,
        message: "Kanban board retrieved successfully",
        data: kanban,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lead = await LeadService.getLeadById(id as string, req.user!);
      return sendSuccess({
        res,
        message: "Lead details retrieved successfully",
        data: lead,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lead = await LeadService.updateLead(id as string, req.body, req.user!);
      return sendSuccess({
        res,
        message: "Lead updated successfully",
        data: lead,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lead = await LeadService.addNote(id as string, req.body.content, req.user!);
      return sendSuccess({
        res,
        message: "Note added to lead successfully",
        data: lead,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await LeadService.deleteLead(id as string);
      return sendSuccess({
        res,
        message: "Lead deleted successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
