"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { X, UserPlus, Shield, Mail, Phone, Lock, Check } from "lucide-react";
import { api } from "../../lib/api";
import { ITeamMember } from "../../types/user";
import { UserRole } from "../../types/auth";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: ITeamMember) => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("SALES");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      toast.error("Please fill in all employee fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Temporary password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<ITeamMember>("/users", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      toast.success(`Account provisioned for ${name} (${role})`);
      onUserCreated(res.data);
      onClose();
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to provision staff account");
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
              Provision Staff Account
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
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
              Full Employee Name <span className="text-[#9b7c52]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Youssef El-Sherif"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
            />
          </div>

          {/* Work Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Work Email <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@rawasin.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Mobile Phone <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+201012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>
          </div>

          {/* Temporary Password & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Temporary Password <span className="text-[#9b7c52]">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                Platform Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.7rem] focus:bg-white"
              >
                <option value="SALES">Sales Agent (مستشار مبيعات)</option>
                <option value="MANAGER">Sales Director / Manager (مدير مبيعات)</option>
                <option value="ADMIN">System Administrator (مسؤول نظام)</option>
              </select>
            </div>
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
              <span>{isSubmitting ? "Provisioning..." : "Create Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
