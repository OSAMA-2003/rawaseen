import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

// Public Authentication Endpoints
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);

// Protected Authentication Endpoints
router.get("/me", authenticate, AuthController.getMe);

export default router;
