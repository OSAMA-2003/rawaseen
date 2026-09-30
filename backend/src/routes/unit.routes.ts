import { Router } from "express";
import { UnitController } from "../controllers/unit.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../models";
import {
  createUnitSchema,
  getUnitsQuerySchema,
  updateUnitSchema,
} from "../validators/unit.validator";

const router = Router();

// Public Routes
router.get("/", validate(getUnitsQuerySchema), UnitController.getUnits);
router.get("/:id", UnitController.getUnitById);

// Protected Staff Routes (Managers and Admins)
router.post(
  "/",
  authenticate,
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(createUnitSchema),
  UnitController.createUnit
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(updateUnitSchema),
  UnitController.updateUnit
);

// Admin Only Route
router.delete(
  "/:id",
  authenticate,
  requireRoles(UserRole.ADMIN),
  UnitController.deleteUnit
);

export default router;
