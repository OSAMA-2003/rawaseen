import { UserRole } from "./auth";

export interface ITeamMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  activeLeadsCount: number;
  createdAt: string;
}
