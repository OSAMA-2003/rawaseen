"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
  ExternalLink,
  Shield,
  Coins,
  ChevronRight,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ILead, LeadStatus } from "../../types/crm";

interface LeadDetailDrawerProps {
  lead: ILead | null;
  onClose: () => void;
  onLeadUpdated: (updatedLead: ILead) => void;
}

const STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "NEW", label: "New Lead", color: "border-blue-300 text-blue-800 bg-blue-50" },
  { key: "CONTACTED", label: "Contacted", color: "border-purple-300 text-purple-800 bg-purple-50" },
  { key: "INTERESTED", label: "Interested", color: "border-amber-300 text-amber-800 bg-amber-50" },
  { key: "SITE_VISIT", label: "Site Visit", color: "border-sky-300 text-sky-800 bg-sky-50" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-indigo-300 text-indigo-800 bg-indigo-50" },
  { key: "WON", label: "Won Deal", color: "border-emerald-300 text-emerald-800 bg-emerald-50" },
  { key: "LOST", label: "Lost", color: "border-rose-300 text-rose-800 bg-rose-50" },
];

export function LeadDetailDrawer({
  lead,
  onClose,
  onLeadUpdated,
}: LeadDetailDrawerProps) {
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!lead) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch<ILead>(`/leads/${lead._id}`, {
        status: newStatus,
      });
      toast.success(`Stage updated to ${newStatus}`);
      onLeadUpdated(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead stage");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await api.post<ILead>(`/leads/${lead._id}/notes`, {
        content: newNote.trim(),
      });
      toast.success("Note added to timeline");
      setNewNote("");
      onLeadUpdated(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Budget Not Specified";
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^\d+]/g, "").replace("+", "");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-full bg-white text-stone-900 border-l border-stone-200 flex flex-col justify-between overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-stone-200 text-stone-900 border border-stone-300 font-mono text-xs flex items-center justify-center font-bold">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-normal text-stone-900">{lead.name}</h2>
              <div className="flex items-center gap-2 font-mono text-[0.65rem] text-stone-500">
                <span>Source: {lead.source.replace("_", " ")}</span>
                <span>&bull;</span>
                <span>Added {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-mono tracking-wider uppercase text-stone-900 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-blue-600" />
              <span>Call Client</span>
            </a>

            <a
              href={`https://wa.me/${cleanPhoneForWhatsApp(lead.phone)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-mono tracking-wider uppercase text-stone-900 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Pipeline Stage Selector */}
          <div className="space-y-2">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-500">
              Pipeline Stage
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {STAGES.map((s) => {
                const isActive = lead.status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(s.key)}
                    className={`p-2 font-mono text-[0.65rem] uppercase tracking-wider border transition-all text-center cursor-pointer ${
                      isActive
                        ? s.color + " font-semibold ring-1 ring-[#9b7c52]"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Details Card */}
          <div className="p-4 bg-stone-50 border border-stone-200 space-y-3 font-mono text-xs shadow-xs">
            <div className="font-mono text-[0.65rem] uppercase tracking-wider text-[#9b7c52] pb-2 border-b border-stone-200">
              Client & Property Preferences
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[0.65rem] text-stone-500 block">PHONE</span>
                <span className="text-stone-900">{lead.phone}</span>
              </div>
              <div>
                <span className="text-[0.65rem] text-stone-500 block">EMAIL</span>
                <span className="text-stone-900 truncate block">
                  {lead.email || "Not Provided"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200">
              <div>
                <span className="text-[0.65rem] text-stone-500 block">INTERESTED ITEM</span>
                <span className="text-stone-900 font-sans text-xs">
                  {lead.unitId
                    ? `Unit ${lead.unitId.unitNumber} (${lead.unitId.type})`
                    : lead.projectId?.name?.en || "General Portfolio Inquiry"}
                </span>
              </div>
              <div>
                <span className="text-[0.65rem] text-stone-500 block">PRICE</span>
                <span className="text-[#9b7c52] font-semibold">
                  {formatCurrency(
                    lead.unitId?.price ||
                    lead.projectId?.startingPrice ||
                    lead.budget
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <span className="text-[0.65rem] text-stone-500 block">ASSIGNED REPRESENTATIVE</span>
              <span className="text-stone-900">
                {lead.assignedTo?.name
                  ? `${lead.assignedTo.name} (${lead.assignedTo.role})`
                  : "Unassigned"}
              </span>
            </div>
          </div>

          {/* Interaction Notes Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Interaction Timeline ({lead.notes?.length || 0})
              </label>
              <span className="font-mono text-[0.62rem] text-stone-400">
                Staff activity & client requirements
              </span>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a client interaction, call note, or follow-up outcome..."
                className="w-full bg-stone-50 border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNote.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#9b7c52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>{isSubmittingNote ? "Logging..." : "Add Note"}</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-2">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes
                  .slice()
                  .reverse()
                  .map((note, index) => (
                    <div
                      key={note._id || index}
                      className="p-3 bg-stone-50 border border-stone-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[0.62rem] text-stone-400">
                        <span className="text-[#9b7c52] font-medium">
                          {note.createdBy?.name || "Client Inquiry"}
                        </span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="p-4 border border-dashed border-stone-200 text-center text-stone-400 font-mono text-xs">
                  No notes recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between font-mono text-[0.65rem] text-stone-500">
          <span>Lead ID: {lead._id.slice(-8)}</span>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 uppercase tracking-wider cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
