import { IUserDocument, Lead, User } from "../models";
import { ApiError } from "../utils/apiError";
import { CreateUserInput, GetUsersQuery, UpdateUserInput } from "../validators/user.validator";

export interface UserWithWorkload {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  activeLeadsCount: number;
  createdAt: Date;
}

export class UserService {
  /**
   * List all staff members with active CRM workload counts
   */
  static async getUsers(query: GetUsersQuery): Promise<UserWithWorkload[]> {
    const filter: Record<string, any> = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { phone: { $regex: query.search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    // Aggregate active leads workload per user
    const usersWithWorkload = await Promise.all(
      users.map(async (u) => {
        const activeLeadsCount = await Lead.countDocuments({
          assignedTo: u._id,
          status: { $nin: ["WON", "LOST"] },
        });

        return {
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive,
          activeLeadsCount,
          createdAt: u.createdAt,
        };
      })
    );

    return usersWithWorkload;
  }

  /**
   * Provision new staff account
   */
  static async createUser(data: CreateUserInput): Promise<IUserDocument> {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw ApiError.conflict(`A user with email '${data.email}' already exists`);
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      isActive: true,
    });

    return user;
  }

  /**
   * Update employee details, role, or active status
   */
  static async updateUser(
    id: string,
    data: UpdateUserInput,
    currentUserId: string
  ): Promise<IUserDocument> {
    if (id === currentUserId && data.isActive === false) {
      throw ApiError.badRequest("You cannot deactivate your own account");
    }

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    await user.save();
    return user;
  }

  /**
   * Delete employee account (Admin only)
   */
  static async deleteUser(
    id: string,
    currentUserId: string
  ): Promise<{ deleted: boolean; id: string }> {
    if (id === currentUserId) {
      throw ApiError.badRequest("You cannot delete your own account");
    }

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with ID '${id}' not found`);
    }

    // Unassign any leads currently assigned to this user
    await Lead.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: 1 } });

    await user.deleteOne();
    return { deleted: true, id };
  }
}
