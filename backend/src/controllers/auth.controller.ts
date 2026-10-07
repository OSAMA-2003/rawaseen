import { CookieOptions, NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";

const getCookieOptions = (): CookieOptions => {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000, // 8 hours matching JWT duration
  };
};

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.login(req.body);

      // Serialize JWT into secure HTTP-only cookie
      res.cookie("token", token, getCookieOptions());

      return sendSuccess({
        res,
        message: "Login successful",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      });

      return sendSuccess({
        res,
        message: "Logged out successfully",
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess({
        res,
        message: "Current authenticated profile retrieved",
        data: req.user,
      });
    } catch (error) {
      return next(error);
    }
  }
}
