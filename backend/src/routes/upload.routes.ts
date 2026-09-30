import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Protected route for authenticated staff members
router.post("/", authenticate, UploadController.uploadImage);

export default router;
