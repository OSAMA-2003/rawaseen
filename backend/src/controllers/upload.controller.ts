import { NextFunction, Request, Response } from "express";
import { UploadService } from "../services/upload.service";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

export class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { image, file, folder } = req.body;
      const targetData = image || file;

      if (!targetData) {
        throw ApiError.badRequest("Please provide 'image' data URI or URL in request body");
      }

      const result = await UploadService.uploadImage(
        targetData,
        folder || "rawasin/developments"
      );

      return sendSuccess({
        res,
        statusCode: 201,
        message: "Image uploaded successfully to cloud storage",
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
