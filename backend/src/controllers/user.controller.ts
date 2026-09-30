import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/apiResponse";

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsers(req.query as any);
      return sendSuccess({
        res,
        message: "Staff directory retrieved successfully",
        data: users,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Staff account provisioned successfully",
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(
        id as string,
        req.body,
        req.user!._id.toString()
      );
      return sendSuccess({
        res,
        message: "Staff member updated successfully",
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(
        id as string,
        req.user!._id.toString()
      );
      return sendSuccess({
        res,
        message: "Staff member deleted successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
