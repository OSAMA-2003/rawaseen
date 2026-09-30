import { Router } from "express";
import { FollowUpController } from "../controllers/followUp.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createFollowUpSchema,
  getFollowUpsQuerySchema,
  updateFollowUpSchema,
} from "../validators/followUp.validator";

const router = Router();

// All follow-up actions require authentication
router.use(authenticate);

// List follow-up tasks (sales sees assigned, managers/admins see all)
router.get("/", validate(getFollowUpsQuerySchema), FollowUpController.getFollowUps);

// Schedule a follow-up task
router.post("/", validate(createFollowUpSchema), FollowUpController.createFollowUp);

// Get single follow-up
router.get("/:id", FollowUpController.getFollowUpById);

// Update status, outcome, or reschedule
router.patch("/:id", validate(updateFollowUpSchema), FollowUpController.updateFollowUp);

// Delete follow-up
router.delete("/:id", FollowUpController.deleteFollowUp);

export default router;
