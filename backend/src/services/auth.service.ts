import { IUserDocument, User } from "../models";
import { ApiError } from "../utils/apiError";
import { signToken } from "../utils/jwt";
import { LoginInput } from "../validators/auth.validator";

export interface AuthResult {
  user: IUserDocument;
  token: string;
}

export class AuthService {
  static async login(input: LoginInput): Promise<AuthResult> {
    // 1. Fetch user by email including the password hash
    const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw ApiError.unauthorized("Your user account has been deactivated. Please contact an administrator.");
    }

    // 2. Validate password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // 3. Generate JWT Token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return { user, token };
  }

  static async getMe(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User profile not found");
    }
    return user;
  }
}
