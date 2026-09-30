import { Router } from "express";
import authRoutes from "./auth.routes";
import followUpRoutes from "./followUp.routes";
import leadRoutes from "./lead.routes";
import projectRoutes from "./project.routes";
import unitRoutes from "./unit.routes";
import userRoutes from "./user.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

// Mount modules
router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/units", unitRoutes);
router.use("/leads", leadRoutes);
router.use("/followups", followUpRoutes);
router.use("/users", userRoutes);
router.use("/upload", uploadRoutes);

export default router;
