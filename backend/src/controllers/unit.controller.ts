import { NextFunction, Request, Response } from "express";
import { UnitService } from "../services/unit.service";
import { sendSuccess } from "../utils/apiResponse";

export class UnitController {
  static async getUnits(req: Request, res: Response, next: NextFunction) {
    try {
      const { units, meta } = await UnitService.getUnits(req.query as any);
      return sendSuccess({
        res,
        message: "Units retrieved successfully",
        data: units,
        meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getUnitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unit = await UnitService.getUnitById(id as string);
      return sendSuccess({
        res,
        message: "Unit details retrieved successfully",
        data: unit,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const unit = await UnitService.createUnit(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Unit created successfully",
        data: unit,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unit = await UnitService.updateUnit(id as string, req.body);
      return sendSuccess({
        res,
        message: "Unit updated successfully",
        data: unit,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await UnitService.deleteUnit(id as string);
      return sendSuccess({
        res,
        message: "Unit deleted successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
