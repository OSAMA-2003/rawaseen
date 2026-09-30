import { NextFunction, Request, Response } from "express";
import { FollowUpService } from "../services/followUp.service";
import { sendSuccess } from "../utils/apiResponse";

export class FollowUpController {
  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const followUp = await FollowUpService.createFollowUp(req.body, req.user!);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Follow-up scheduled successfully",
        data: followUp,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const { followUps, meta } = await FollowUpService.getFollowUps(
        req.query as any,
        req.user!
      );
      return sendSuccess({
        res,
        message: "Follow-up tasks retrieved successfully",
        data: followUps,
        meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getFollowUpById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUp = await FollowUpService.getFollowUpById(id as string, req.user!);
      return sendSuccess({
        res,
        message: "Follow-up retrieved successfully",
        data: followUp,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUp = await FollowUpService.updateFollowUp(
        id as string,
        req.body,
        req.user!
      );
      return sendSuccess({
        res,
        message: "Follow-up updated successfully",
        data: followUp,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await FollowUpService.deleteFollowUp(id as string, req.user!);
      return sendSuccess({
        res,
        message: "Follow-up deleted successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
