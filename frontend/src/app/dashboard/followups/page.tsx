"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  MapPin,
  Users,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { FollowUpStatus, FollowUpType, IFollowUp } from "../../../types/followUp";
import { CompleteFollowUpModal } from "../../../components/followups/CompleteFollowUpModal";
import { ScheduleFollowUpModal } from "../../../components/followups/ScheduleFollowUpModal";

type TimeframeTab = "today" | "upcoming" | "overdue" | "all";

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TimeframeTab>("today");
  const [followUps, setFollowUps] = useState<IFollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<IFollowUp | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      let endpoint = `/followups?timeframe=${activeTab}&limit=50`;
      if (typeFilter !== "ALL") {
        endpoint += `&type=${typeFilter}`;
      }
      const res = await api.get<IFollowUp[]>(endpoint);
      setFollowUps(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeTab, typeFilter]);

  const handleTaskCompleted = (updatedTask: IFollowUp) => {
    fetchFollowUps();
  };

  const handleTaskScheduled = (newTask: IFollowUp) => {
    fetchFollowUps();
  };

  const getTypeIcon = (type: FollowUpType) => {
    switch (type) {
      case "PHONE_CALL":
        return <Phone className="h-3.5 w-3.5 text-blue-400" />;
      case "WHATSAPP":
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case "SITE_VISIT":
        return <MapPin className="h-3.5 w-3.5 text-amber-400" />;
      case "IN_PERSON_MEETING":
        return <Users className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <CalendarCheck className="h-3.5 w-3.5 text-[#c5a880]" />;
    }
  };

  const isOverdue = (dateString: string, status: FollowUpStatus) => {
    return status === "PENDING" && new Date(dateString) < new Date();
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^\d+]/g, "").replace("+", "");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Task Scheduler & Client Engagement</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-stone-900">
              Follow-Up Schedule & Tasks
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 border border-stone-200 bg-white text-[#9b7c52] shadow-xs">
              {followUps.length} Tasks
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem] shadow-xs"
          >
            <option value="ALL">All Task Types</option>
            <option value="PHONE_CALL">Phone Calls</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="SITE_VISIT">Site Visits</option>
            <option value="IN_PERSON_MEETING">Meetings</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchFollowUps}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Schedule New Task */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#9b7c52] transition-colors cursor-pointer shadow-sm"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Schedule Follow-Up</span>
          </button>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        {[
          { key: "today", label: "Today's Tasks" },
          { key: "upcoming", label: "Upcoming Schedule" },
          { key: "overdue", label: "Overdue Tasks" },
          { key: "all", label: "All Tasks & History" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TimeframeTab)}
              className={`pb-3 px-3 font-mono text-xs uppercase tracking-wider transition-colors relative cursor-pointer ${
                isActive
                  ? "text-stone-900 font-semibold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#9b7c52]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Task List Grid */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-stone-500">
          Loading scheduled tasks...
        </div>
      ) : followUps.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-300 bg-white p-8 space-y-3 shadow-xs">
          <CalendarCheck className="h-8 w-8 text-stone-400 mx-auto opacity-50" />
          <h3 className="text-sm font-medium text-stone-900">
            No tasks found in {activeTab} view
          </h3>
          <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
            Schedule a follow-up call, WhatsApp chat, or site visit with your active leads.
          </p>
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-[#9b7c52] text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            <span>Create Follow-Up</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followUps.map((task) => {
            const overdue = isOverdue(task.scheduledDate, task.status);
            const isCompleted = task.status === "COMPLETED";

            return (
              <div
                key={task._id}
                className={`p-5 bg-white border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                  overdue
                    ? "border-red-300 bg-red-50/40"
                    : isCompleted
                    ? "border-emerald-200 bg-emerald-50/30 opacity-90"
                    : "border-stone-200 hover:border-stone-400 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Bar: Type, Time, Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-[#9b7c52]">
                      {getTypeIcon(task.type)}
                      <span>{task.type.replace("_", " ")}</span>
                    </span>

                    {overdue ? (
                      <span className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 bg-red-50 border border-red-300 text-red-700">
                        <AlertTriangle className="h-3 w-3" /> Overdue
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div className="font-mono text-[0.7rem] text-stone-500 mb-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-stone-400" />
                    <span>{new Date(task.scheduledDate).toLocaleString()}</span>
                  </div>

                  {/* Client Info */}
                  <div className="p-3 bg-stone-50 border border-stone-200 space-y-1">
                    <div className="text-sm font-medium text-stone-900">
                      {task.leadId?.name || "Client"}
                    </div>
                    <div className="font-mono text-xs text-stone-600 flex items-center justify-between">
                      <span>{task.leadId?.phone || "—"}</span>
                      {task.leadId?.status && (
                        <span className="text-[0.6rem] uppercase text-[#9b7c52] px-1.5 py-0.5 border border-[#9b7c52]/30 bg-white">
                          {task.leadId.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Notes / Objectives */}
                  {task.notes && (
                    <p className="font-mono text-xs text-stone-600 mt-3 whitespace-pre-wrap leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  {/* Completed Outcome */}
                  {isCompleted && task.outcome && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 font-mono text-[0.68rem] text-emerald-800">
                      <span className="font-bold block mb-0.5 uppercase tracking-wider">
                        Outcome Log:
                      </span>
                      {task.outcome}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {task.leadId?.phone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${task.leadId.phone}`}
                          title="Call client"
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-blue-600" />
                        </a>
                        <a
                          href={`https://wa.me/${cleanPhoneForWhatsApp(task.leadId.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open WhatsApp chat"
                          className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
                        </a>
                      </div>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => setSelectedTaskForCompletion(task)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Done</span>
                      </button>
                    )}
                  </div>

                  {/* Assigned staff footer */}
                  <div className="font-mono text-[0.6rem] text-stone-400 flex items-center justify-between">
                    <span>
                      Agent: {task.assignedTo?.name || user?.name || "Staff"}
                    </span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Outcome Modal */}
      <CompleteFollowUpModal
        followUp={selectedTaskForCompletion}
        onClose={() => setSelectedTaskForCompletion(null)}
        onCompleted={handleTaskCompleted}
      />

      {/* Schedule Follow-Up Modal */}
      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduled={handleTaskScheduled}
      />
    </div>
  );
}
