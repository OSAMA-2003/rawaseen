import cloudinary from "../config/cloudinary";
import { ApiError } from "../utils/apiError";

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
}

export class UploadService {
  /**
   * Upload an image (base64 data URI or remote URL) to Cloudinary
   */
  static async uploadImage(
    fileData: string,
    folder: string = "rawasin/general"
  ): Promise<UploadResult> {
    if (!fileData) {
      throw ApiError.badRequest("No image data provided for upload");
    }

    try {
      const result = await cloudinary.uploader.upload(fileData, {
        folder,
        resource_type: "auto",
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      throw ApiError.badRequest(
        error.message || "Failed to upload image to cloud storage"
      );
    }
  }

  /**
   * Delete an image from Cloudinary by public ID
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.warn("Failed to delete image from Cloudinary:", error);
      return false;
    }
  }
}
