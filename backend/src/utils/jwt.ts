import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models";
import { ApiError } from "./apiError";

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const signToken = (payload: TokenPayload, expiresIn = env.JWT_EXPIRES_IN): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Authentication token has expired");
    }
    throw ApiError.unauthorized("Invalid authentication token");
  }
};
