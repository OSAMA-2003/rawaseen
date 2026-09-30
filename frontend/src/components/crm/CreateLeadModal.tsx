"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { X, UserPlus, Phone, Mail, Coins, FileText, Check } from "lucide-react";
import { api } from "../../lib/api";
import { ILead, LeadSource } from "../../types/crm";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: ILead) => void;
}

export function CreateLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
}: CreateLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [source, setSource] = useState<LeadSource>("DIRECT_CALL");
  const [initialNote, setInitialNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please provide at least a client name and phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<ILead>("/leads", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        source,
        initialNote: initialNote.trim() || undefined,
      });

      toast.success("Lead registered successfully in CRM");
      onLeadCreated(res.data);
      onClose();
      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setBudget("");
      setInitialNote("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
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
            <UserPlus className="h-5 w-5 text-[#9b7c52]" />
            <h2 className="text-base font-normal text-stone-900">
              Register New Lead
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
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Client Name <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Khaled Al-Masri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Phone Number <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +201012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>
          </div>

          {/* Email & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Target Budget (EGP)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                placeholder="e.g. 5500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>
          </div>

          {/* Source Selector */}
          <div className="space-y-1">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
              Inquiry Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
            >
              <option value="DIRECT_CALL">Direct Phone Call</option>
              <option value="WHATSAPP">WhatsApp Conversation</option>
              <option value="WALK_IN">Sales Center Walk-in</option>
              <option value="CAMPAIGN">Marketing Campaign</option>
              <option value="REFERRAL">Client Referral</option>
              <option value="WEBSITE_INQUIRY">Website Form</option>
            </select>
          </div>

          {/* Initial Note */}
          <div className="space-y-1">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
              Initial Discovery Note
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Looking for 3-bedroom apartment in New Cairo, delivery in 2026..."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
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
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-semibold hover:bg-[#9b7c52] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Create Lead"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
