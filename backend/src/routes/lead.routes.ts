import { Router } from "express";
import { LeadController } from "../controllers/lead.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../models";
import {
  addLeadNoteSchema,
  createLeadSchema,
  getLeadsQuerySchema,
  publicLeadInquirySchema,
  updateLeadSchema,
} from "../validators/lead.validator";

const router = Router();

// Public endpoint for website inquiries
router.post(
  "/public",
  validate(publicLeadInquirySchema),
  LeadController.submitPublicInquiry
);

// Protected endpoints for staff & CRM operations
router.use(authenticate);

// CRM Kanban pipeline view
router.get("/kanban", LeadController.getKanbanBoard);

// List leads with filters and pagination
router.get("/", validate(getLeadsQuerySchema), LeadController.getLeads);

// Direct lead creation by staff
router.post("/", validate(createLeadSchema), LeadController.createLead);

// Lead details by ID
router.get("/:id", LeadController.getLeadById);

// Update lead attributes, status, and reassignment
router.patch("/:id", validate(updateLeadSchema), LeadController.updateLead);

// Append note to lead timeline
router.post("/:id/notes", validate(addLeadNoteSchema), LeadController.addNote);

// Delete lead (Admin only)
router.delete("/:id", requireRoles(UserRole.ADMIN), LeadController.deleteLead);

export default router;
