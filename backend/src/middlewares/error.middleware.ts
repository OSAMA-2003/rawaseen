import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details;

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Request validation failed";
    details = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Database validation failed";
    details = Object.values(err.errors).map((val: any) => ({
      path: val.path,
      message: val.message,
    }));
  }

  // Log server errors for observability
  if (statusCode >= 500) {
    console.error(`💥 [ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: err.name || "Error",
    message,
    ...(details && { details }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
