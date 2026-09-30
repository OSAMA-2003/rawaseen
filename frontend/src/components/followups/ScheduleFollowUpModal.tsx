"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, CalendarPlus, Phone, Calendar, Clock, MessageSquare, MapPin } from "lucide-react";
import { api } from "../../lib/api";
import { FollowUpType, IFollowUp } from "../../types/followUp";
import { ILead } from "../../types/crm";

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: (followUp: IFollowUp) => void;
}

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  onScheduled,
}: ScheduleFollowUpModalProps) {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [type, setType] = useState<FollowUpType>("PHONE_CALL");
  const [notes, setNotes] = useState("");
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default scheduled date to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledDate(isoLocal);

      // Fetch active leads
      setIsLoadingLeads(true);
      api
        .get<ILead[]>("/leads?limit=50")
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setLeads(res.data);
            setSelectedLeadId(res.data[0]._id);
          }
        })
        .catch((err) => {
          console.warn("Could not load leads for follow-up picker:", err);
        })
        .finally(() => {
          setIsLoadingLeads(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      toast.error("Please select a client for this follow-up");
      return;
    }
    if (!scheduledDate) {
      toast.error("Please choose a scheduled date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<IFollowUp>("/followups", {
        leadId: selectedLeadId,
        scheduledDate: new Date(scheduledDate).toISOString(),
        type,
        notes: notes.trim() || undefined,
      });

      toast.success("Follow-up scheduled successfully");
      onScheduled(res.data);
      onClose();
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white text-stone-900 border border-stone-200 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarPlus className="h-5 w-5 text-[#9b7c52]" />
            <h2 className="text-base font-normal text-stone-900">
              Schedule Client Follow-Up
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Selector */}
          <div className="space-y-1">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
              Select Client <span className="text-[#9b7c52]">*</span>
            </label>
            {isLoadingLeads ? (
              <div className="py-2 text-xs font-mono text-stone-400">
                Loading available clients...
              </div>
            ) : leads.length === 0 ? (
              <div className="py-2 text-xs font-mono text-amber-600">
                No active leads found. Please register a lead first.
              </div>
            ) : (
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              >
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} — {l.phone} ({l.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time and Interaction Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Date & Time <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Interaction Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FollowUpType)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              >
                <option value="PHONE_CALL">Phone Call</option>
                <option value="WHATSAPP">WhatsApp Follow-up</option>
                <option value="SITE_VISIT">Site Visit / Tour</option>
                <option value="IN_PERSON_MEETING">In-Person Meeting</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
              Task Objective / Call Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Present revised payment terms and confirm appointment at New Cairo site..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-wider">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || leads.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-semibold hover:bg-[#9b7c52] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>{isSubmitting ? "Scheduling..." : "Schedule Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
