import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../models";
import {
  createUserSchema,
  getUsersQuerySchema,
  updateUserSchema,
} from "../validators/user.validator";

const router = Router();

// Staff management requires authentication and management authority
router.use(authenticate);

// List staff members (Admin & Manager)
router.get(
  "/",
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(getUsersQuerySchema),
  UserController.getUsers
);

// Provision new employee (Admin & Manager)
router.post(
  "/",
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(createUserSchema),
  UserController.createUser
);

// Update employee details or active status (Admin & Manager)
router.patch(
  "/:id",
  requireRoles(UserRole.ADMIN, UserRole.MANAGER),
  validate(updateUserSchema),
  UserController.updateUser
);

// Delete employee (Admin only)
router.delete("/:id", requireRoles(UserRole.ADMIN), UserController.deleteUser);

export default router;
