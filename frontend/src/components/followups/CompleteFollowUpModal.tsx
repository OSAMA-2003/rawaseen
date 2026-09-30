"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { X, CheckCircle2, Phone, Calendar } from "lucide-react";
import { api } from "../../lib/api";
import { IFollowUp } from "../../types/followUp";

interface CompleteFollowUpModalProps {
  followUp: IFollowUp | null;
  onClose: () => void;
  onCompleted: (updated: IFollowUp) => void;
}

export function CompleteFollowUpModal({
  followUp,
  onClose,
  onCompleted,
}: CompleteFollowUpModalProps) {
  const [outcome, setOutcome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!followUp) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) {
      toast.error("Please record the outcome or discussion summary before completing");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.patch<IFollowUp>(`/followups/${followUp._id}`, {
        status: "COMPLETED",
        outcome: outcome.trim(),
      });

      toast.success("Follow-up marked as completed");
      onCompleted(res.data);
      onClose();
      setOutcome("");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete follow-up");
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
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-normal text-stone-900">
              Complete Follow-Up Task
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

        {/* Task Summary Card */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-stone-50 border border-stone-200 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#9b7c52] uppercase tracking-wider text-[0.68rem] font-semibold">
                {followUp.type.replace("_", " ")}
              </span>
              <span className="text-stone-500 text-[0.65rem]">
                {new Date(followUp.scheduledDate).toLocaleString()}
              </span>
            </div>
            <div className="text-stone-900 font-sans text-sm font-medium">
              Client: {followUp.leadId?.name || "Client"}
            </div>
            <div className="text-stone-600 text-[0.7rem]">
              Phone: {followUp.leadId?.phone || "—"}
            </div>
            {followUp.notes && (
              <p className="text-stone-500 text-[0.68rem] pt-1 border-t border-stone-200">
                Target: {followUp.notes}
              </p>
            )}
          </div>

          {/* Outcome Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Interaction Outcome & Summary <span className="text-[#9b7c52]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="Detail what was discussed, client reaction, next agreed steps, or unit preferences..."
                className="w-full bg-stone-50 border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white resize-none"
              />
            </div>

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
                disabled={isSubmitting || !outcome.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmitting ? "Logging..." : "Confirm & Complete"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
