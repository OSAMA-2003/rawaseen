import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models";
import { ApiError } from "../utils/apiError";

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    return next();
  };
};
