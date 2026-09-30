import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../models";
import {
  createProjectSchema,
  getProjectsQuerySchema,
  updateProjectSchema,
} from "../validators/project.validator";

const router = Router();

// Public Routes
router.get("/", validate(getProjectsQuerySchema), ProjectController.getProjects);
router.get("/:slug", ProjectController.getProjectBySlug);
router.get("/id/:id", ProjectController.getProjectById);

// Protected Staff Routes (Managers and Admins)
router.post(
  "/",
  authenticate,
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(createProjectSchema),
  ProjectController.createProject
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(updateProjectSchema),
  ProjectController.updateProject
);

// Admin Only Route
router.delete(
  "/:id",
  authenticate,
  requireRoles(UserRole.ADMIN),
  ProjectController.deleteProject
);

export default router;
