import { NextFunction, Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { sendSuccess } from "../utils/apiResponse";

export class ProjectController {
  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { projects, meta } = await ProjectService.getProjects(req.query as any);
      return sendSuccess({
        res,
        message: "Projects retrieved successfully",
        data: projects,
        meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getProjectBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await ProjectService.getProjectBySlug(slug as string);
      return sendSuccess({
        res,
        message: "Project details retrieved successfully",
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id as string);
      return sendSuccess({
        res,
        message: "Project retrieved successfully",
        data: project,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await ProjectService.updateProject(id as string, req.body);
      return sendSuccess({
        res,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProjectService.deleteProject(id as string);
      return sendSuccess({
        res,
        message: "Project deleted successfully",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
