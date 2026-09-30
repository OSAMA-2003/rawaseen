import { NextFunction, Request, Response } from "express";
import { IUserDocument, User } from "../models";
import { ApiError } from "../utils/apiError";
import { verifyToken } from "../utils/jwt";

// Augment Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Bearer header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(ApiError.unauthorized("Authentication required to access this resource"));
    }

    // 3. Verify JWT signature and expiration
    const payload = verifyToken(token);

    // 4. Verify user exists and is active
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(ApiError.unauthorized("User account no longer exists"));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized("Your user account has been deactivated"));
    }

    // 5. Attach hydrated user to request
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
