"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  Lock,
  MessageSquare,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ITeamMember } from "../../../types/user";
import { CreateUserModal } from "../../../components/team/CreateUserModal";

export default function TeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState<ITeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ITeamMember[]>("/users");
      setTeam(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load team directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      fetchTeam();
    }
  }, [user]);

  const handleToggleStatus = async (targetUser: ITeamMember) => {
    if (targetUser._id === user?._id) {
      toast.error("You cannot deactivate your own active session");
      return;
    }

    try {
      const res = await api.patch(`/users/${targetUser._id}`, {
        isActive: !targetUser.isActive,
      });
      toast.success(
        `${targetUser.name} is now ${!targetUser.isActive ? "Active" : "Deactivated"}`
      );
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to update account status");
    }
  };

  const handleDeleteMember = async (targetUser: ITeamMember) => {
    if (targetUser._id === user?._id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${targetUser.name}? All assigned leads will be unassigned.`)) {
      return;
    }

    try {
      await api.delete(`/users/${targetUser._id}`);
      toast.success(`${targetUser.name} has been removed from the platform`);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete employee account");
    }
  };

  const filteredTeam = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return team.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q);

      const matchesRole = roleFilter === "ALL" || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [team, searchQuery, roleFilter]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "MANAGER":
        return "bg-purple-50 text-purple-800 border-purple-300";
      case "SALES":
      default:
        return "bg-blue-50 text-blue-800 border-blue-300";
    }
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^\d+]/g, "").replace("+", "");
  };

  // RBAC Access Guard Check
  if (user?.role === "SALES") {
    return (
      <div className="py-20 text-center border border-dashed border-stone-300 bg-white p-8 space-y-4 max-w-md mx-auto my-12 shadow-xs">
        <Lock className="h-10 w-10 text-[#9b7c52] mx-auto opacity-70" />
        <h2 className="text-base font-normal text-stone-900">
          Administrative Access Required
        </h2>
        <p className="font-mono text-xs text-stone-500">
          Only System Administrators and Sales Directors are authorized to manage team credentials and platform roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Staff Administration & Workload Allocation</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-stone-900">
              Team & Staff Management
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 border border-stone-200 bg-white text-[#9b7c52] shadow-xs">
              {team.length} Members
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-56 bg-white border border-stone-300 px-3 py-1.5 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] shadow-xs"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem] shadow-xs"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="MANAGER">Sales Managers</option>
            <option value="SALES">Sales Agents</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchTeam}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Add Employee */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#9b7c52] transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white border border-stone-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-stone-500">
            Loading staff directory...
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-stone-200 p-8 space-y-3">
            <Users className="h-8 w-8 text-stone-400 mx-auto opacity-50" />
            <h3 className="text-sm font-medium text-stone-900">No team members match criteria</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-[0.65rem] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-normal">Team Member</th>
                  <th className="py-3 px-4 font-normal">Work Email</th>
                  <th className="py-3 px-4 font-normal">Phone</th>
                  <th className="py-3 px-4 font-normal">Role</th>
                  <th className="py-3 px-4 font-normal">Active Leads</th>
                  <th className="py-3 px-4 font-normal">Account Status</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTeam.map((member) => (
                  <tr key={member._id} className="hover:bg-stone-50 transition-colors">
                    {/* Member Name + Initials */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-none bg-stone-100 text-stone-900 border border-stone-200 font-mono text-xs flex items-center justify-center font-bold">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-sans font-medium text-stone-900 text-xs">
                            {member.name}
                          </div>
                          {member._id === user?._id && (
                            <span className="font-mono text-[0.6rem] text-[#9b7c52]">
                              (Current You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-stone-600">{member.email}</td>

                    {/* Phone + Action */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-stone-600">
                        <span>{member.phone}</span>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(member.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open WhatsApp"
                          className="p-1 hover:text-[#25D366] transition-colors"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </a>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 border text-[0.62rem] uppercase tracking-wider ${getRoleBadge(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </td>

                    {/* Active Workload */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-stone-900 font-medium">
                        {member.activeLeadsCount} Leads
                      </span>
                    </td>

                    {/* Account Status Button */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member)}
                        disabled={member._id === user?._id}
                        className={`flex items-center gap-1.5 px-2 py-1 border font-mono text-[0.62rem] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          member.isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                        }`}
                      >
                        {member.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-red-600" /> Deactivated
                          </>
                        )}
                      </button>
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {user?.role === "ADMIN" && member._id !== user?._id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          title="Delete staff account"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => fetchTeam()}
      />
    </div>
  );
}
