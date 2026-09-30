"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { STATIC_PROJECTS, STATIC_UNITS } from "@/data/staticData";
import {
  Building2,
  KeyRound,
  Users,
  CalendarCheck,
  ArrowUpRight,
  Plus,
  Phone,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { CreateProjectModal } from "../../components/projects/CreateProjectModal";
import { CreateUnitModal } from "../../components/units/CreateUnitModal";

interface DashboardStats {
  projectsCount: number;
  unitsCount: number;
  availableUnitsCount: number;
  leadsCount: number;
  pendingFollowUpsCount: number;
}

interface RecentLead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  source: string;
  createdAt: string;
  projectId?: {
    name: { en: string; ar: string };
  };
}

interface UpcomingTask {
  _id: string;
  scheduledDate: string;
  type: string;
  notes?: string;
  leadId?: {
    name: string;
    phone: string;
  };
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    projectsCount: 0,
    unitsCount: 0,
    availableUnitsCount: 0,
    leadsCount: 0,
    pendingFollowUpsCount: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsRes, unitsRes, leadsRes, followUpsRes] = await Promise.allSettled([
        api.get<any[]>("/projects?limit=100"),
        api.get<any[]>("/units?limit=100"),
        api.get<any[]>("/leads?limit=5"),
        api.get<any[]>("/followups?timeframe=upcoming&limit=4"),
      ]);

      const projects =
        projectsRes.status === "fulfilled" && projectsRes.value.data && projectsRes.value.data.length > 0
          ? projectsRes.value.data
          : STATIC_PROJECTS;
      const units =
        unitsRes.status === "fulfilled" && unitsRes.value.data && unitsRes.value.data.length > 0
          ? unitsRes.value.data
          : STATIC_UNITS;
      const leads = leadsRes.status === "fulfilled" ? leadsRes.value.data || [] : [];
      const followUps = followUpsRes.status === "fulfilled" ? followUpsRes.value.data || [] : [];

      const availableUnits = units.filter((u: any) => u.status === "AVAILABLE").length;

      setStats({
        projectsCount: projects.length,
        unitsCount: units.length,
        availableUnitsCount: availableUnits,
        leadsCount: leadsRes.status === "fulfilled" && leadsRes.value.meta ? leadsRes.value.meta.total : leads.length,
        pendingFollowUpsCount: followUps.length,
      });

      setRecentLeads(leads);
      setUpcomingTasks(followUps);
    } catch (err) {
      console.warn("Could not retrieve some dashboard live metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "CONTACTED":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "INTERESTED":
        return "bg-[#c5a880]/15 text-[#8c6b3e] border-[#c5a880]/40";
      case "WON":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "LOST":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="space-y-8 text-stone-900">
      {/* Welcome & Live Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Rawasin Commercial Platform &bull; Egypt & KSA</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-normal text-stone-950">
            Welcome, {user?.name}
          </h1>
          <p className="font-mono text-xs text-stone-500 mt-1">
            Role: <span className="text-stone-800 font-semibold">{user?.role}</span> &bull;
            CRM data synced with MongoDB Atlas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-xs font-mono tracking-wider uppercase text-stone-700 hover:text-stone-950 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#182220] text-[#c5a880] hover:bg-[#9b7c52] hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>+ Launch Project</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUnitModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#9b7c52]" />
                <span>+ Add Unit</span>
              </button>
            </>
          )}

          <Link
            href="/dashboard/leads"
            className="flex items-center gap-2 px-3.5 py-2 bg-[#111110] text-white font-mono text-xs tracking-wider uppercase font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects KPI */}
        <div className="p-5 bg-white border border-stone-200 shadow-sm relative overflow-hidden group hover:border-[#c5a880] transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest">
              Active Projects
            </span>
            <Building2 className="h-4 w-4 text-[#9b7c52]" />
          </div>
          <div className="text-3xl font-light text-stone-950 mb-1">
            {loading ? "-" : stats.projectsCount}
          </div>
          <p className="font-mono text-[0.68rem] text-stone-500">
            Commercial & Residential Towers
          </p>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-[0.65rem] text-stone-600">
            <span>View Catalog</span>
            <Link
              href="/dashboard/projects"
              className="text-[#9b7c52] hover:underline flex items-center gap-1 font-semibold"
            >
              Browse <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Units KPI */}
        <div className="p-5 bg-white border border-stone-200 shadow-sm relative overflow-hidden group hover:border-[#c5a880] transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest">
              Units Inventory
            </span>
            <KeyRound className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-light text-stone-950 mb-1">
            {loading ? "-" : stats.unitsCount}
          </div>
          <p className="font-mono text-[0.68rem] text-emerald-700 font-medium">
            {stats.availableUnitsCount} Units Available
          </p>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-[0.65rem] text-stone-600">
            <span>Manage Inventory</span>
            <Link
              href="/dashboard/units"
              className="text-[#9b7c52] hover:underline flex items-center gap-1 font-semibold"
            >
              Details <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* CRM Leads KPI */}
        <div className="p-5 bg-white border border-stone-200 shadow-sm relative overflow-hidden group hover:border-[#c5a880] transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest">
              {user?.role === "SALES" ? "My Assigned Leads" : "Total Company Leads"}
            </span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-light text-stone-950 mb-1">
            {loading ? "-" : stats.leadsCount}
          </div>
          <p className="font-mono text-[0.68rem] text-stone-500">
            Active Customer Inquiries
          </p>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-[0.65rem] text-stone-600">
            <span>Kanban Pipeline</span>
            <Link
              href="/dashboard/leads"
              className="text-[#9b7c52] hover:underline flex items-center gap-1 font-semibold"
            >
              Open <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Follow-Ups KPI */}
        <div className="p-5 bg-white border border-stone-200 shadow-sm relative overflow-hidden group hover:border-[#c5a880] transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest">
              Scheduled Tasks
            </span>
            <CalendarCheck className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-light text-stone-950 mb-1">
            {loading ? "-" : stats.pendingFollowUpsCount}
          </div>
          <p className="font-mono text-[0.68rem] text-stone-500">
            Pending Calls & Meetings
          </p>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-[0.65rem] text-stone-600">
            <span>Task Calendar</span>
            <Link
              href="/dashboard/followups"
              className="text-[#9b7c52] hover:underline flex items-center gap-1 font-semibold"
            >
              Calendar <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Recent Leads & Scheduled Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent CRM Inquiries (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-medium text-stone-950">
                Recent CRM Inquiries
              </h2>
              <p className="font-mono text-[0.68rem] text-stone-500">
                Latest client interactions and status
              </p>
            </div>
            <Link
              href="/dashboard/leads"
              className="font-mono text-xs uppercase tracking-wider text-[#9b7c52] hover:underline flex items-center gap-1 font-semibold"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-400 font-mono text-xs">
              Loading recent inquiries...
            </div>
          ) : recentLeads.length === 0 ? (
            <div className="py-12 text-center text-stone-400 font-mono text-xs border border-dashed border-stone-200 p-6">
              No recent leads recorded yet. Public inquiries will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[0.65rem] text-stone-400 uppercase tracking-wider">
                    <th className="pb-3 font-normal">Client Name</th>
                    <th className="pb-3 font-normal">Phone</th>
                    <th className="pb-3 font-normal">Interest</th>
                    <th className="pb-3 font-normal">Status</th>
                    <th className="pb-3 font-normal text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 text-stone-950 font-sans text-xs font-semibold">
                        {lead.name}
                      </td>
                      <td className="py-3 text-stone-600">{lead.phone}</td>
                      <td className="py-3 text-stone-700">
                        {lead.projectId?.name?.en || "General Inquiry"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 border text-[0.6rem] uppercase tracking-wider font-medium ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-stone-400 text-[0.65rem]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Follow-Ups (1/3 width) */}
        <div className="bg-white border border-stone-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-stone-950">
                  Upcoming Tasks
                </h2>
                <p className="font-mono text-[0.68rem] text-stone-500">
                  Scheduled client calls & tours
                </p>
              </div>
              <Link
                href="/dashboard/followups"
                className="font-mono text-xs uppercase tracking-wider text-[#9b7c52] hover:underline font-semibold"
              >
                Schedule
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-stone-400 font-mono text-xs">
                Loading schedule...
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-stone-400 font-mono text-xs border border-dashed border-stone-200 p-6">
                No upcoming follow-ups scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 bg-stone-50 border border-stone-200 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[#8c6b3e] flex items-center gap-1.5 font-semibold">
                        <Phone className="h-3 w-3" />
                        {task.type.replace("_", " ")}
                      </span>
                      <span className="font-mono text-[0.6rem] text-stone-400">
                        {new Date(task.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-stone-900 font-medium">
                      {task.leadId?.name || "Client"}
                    </div>
                    {task.notes && (
                      <p className="font-mono text-[0.65rem] text-stone-500 truncate mt-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Prompt */}
          <div className="mt-6 pt-4 border-t border-stone-200">
            <Link
              href="/dashboard/followups"
              className="w-full block text-center py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-mono text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Open Follow-Up Manager
            </Link>
          </div>
        </div>
      </div>

      {/* Launch Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {
          fetchDashboardData();
          setIsProjectModalOpen(false);
        }}
      />

      {/* Add Unit Modal */}
      <CreateUnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        onUnitCreated={() => {
          fetchDashboardData();
          setIsUnitModalOpen(false);
        }}
      />
    </div>
  );
}
