import { IUserDocument, Lead, User, UserRole } from "../models";
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

  /**
   * Public directory of active team members for inquiry attribution
   */
  static async getPublicTeam() {
    let users = await User.find({ isActive: true })
      .select("_id name role phone email")
      .lean();

    // Ensure database has active staff accounts if currently unseeded
    if (users.length === 0) {
      const initialUsers = [
        {
          name: "Tarek Al-Mansoor",
          email: "sales@rawasin.sa",
          phone: "+201000000003",
          password: "SalesPassword123!",
          role: UserRole.SALES,
          isActive: true,
        },
        {
          name: "Sales Director",
          email: "manager@rawasin.sa",
          phone: "+201000000002",
          password: "ManagerPassword123!",
          role: UserRole.MANAGER,
          isActive: true,
        },
        {
          name: "Rawasin Executive",
          email: "admin@rawasin.sa",
          phone: "+201000000001",
          password: "AdminPassword123!",
          role: UserRole.ADMIN,
          isActive: true,
        },
      ];
      for (const u of initialUsers) {
        await User.create(u);
      }
      users = await User.find({ isActive: true })
        .select("_id name role phone email")
        .lean();
    }

    // Sort order: Sales Consultants first, then Managers, then Admins
    const rolePriority: Record<string, number> = {
      [UserRole.SALES]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3,
    };

    return users.sort((a, b) => {
      const prioA = rolePriority[a.role] || 99;
      const prioB = rolePriority[b.role] || 99;
      if (prioA !== prioB) return prioA - prioB;
      return a.name.localeCompare(b.name);
    });
  }
}
