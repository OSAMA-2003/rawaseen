import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import { ApiError } from "./utils/apiError";
import { sendSuccess } from "./utils/apiResponse";

export const createApp = (): Application => {
  const app = express();

  // Security HTTP Headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    "https://rawaseen.vercel.app",
    "http://rawaseen.vercel.app",
    "https://www.rawaseen.vercel.app",
    "http://localhost:3000",
    "http://localhost:5000",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          /\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Body and Cookie Parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Base Health Check Route
  app.get("/health", (req: Request, res: Response) => {
    return sendSuccess({
      res,
      message: "Rawasin Backend API is operating nominally",
      data: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  });

  // Mount API v1 router
  app.use("/api/v1", apiRoutes);

  // Base API v1 endpoint check
  app.get("/api/v1", (req: Request, res: Response) => {
    return sendSuccess({
      res,
      message: "Welcome to Rawasin Enterprise API v1",
      data: {
        version: "1.0.0",
        docs: "/api/v1/docs",
      },
    });
  });

  // Handle 404 - Unmatched Routes
  app.use((req: Request, res: Response, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
