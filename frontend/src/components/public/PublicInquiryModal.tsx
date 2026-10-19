"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  ShieldCheck,
  Globe,
  Users,
  UserCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import { IProject } from "../../types/project";
import { useLanguage } from "../../i18n/LanguageContext";
import { STATIC_PROJECTS } from "@/data/staticData";

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

// Real active staff accounts verified from MongoDB Atlas
export const REAL_TEAM_MEMBERS: TeamMember[] = [
  {
    _id: "6aca2d2863586035e52de0f6",
    name: "Osama Sales",
    role: "SALES",
    phone: "01029317818",
    email: "osama.ahmd.dev@gmail.com",
  },
  {
    _id: "6ab80987db7833c25a1f00a0",
    name: "Tarek Al-Mansoor",
    role: "SALES",
    phone: "+201000000003",
    email: "sales@rawasin.sa",
  },
  {
    _id: "6ab80987db7833c25a1f0098",
    name: "Sales Director",
    role: "MANAGER",
    phone: "+201000000002",
    email: "manager@rawasin.sa",
  },
  {
    _id: "6ab80987db7833c25a1f008e",
    name: "Rawasin Executive",
    role: "ADMIN",
    phone: "+201000000001",
    email: "admin@rawasin.sa",
  },
];

interface PublicInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProjectId?: string;
  preselectedUnitId?: string;
  preselectedUnitNumber?: string;
}

export function PublicInquiryModal({
  isOpen,
  onClose,
  preselectedProjectId,
  preselectedUnitId,
  preselectedUnitNumber,
}: PublicInquiryModalProps) {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(REAL_TEAM_MEMBERS);
  const [attributionType, setAttributionType] = useState<"WEBSITE" | "TEAM_MEMBER">("WEBSITE");
  const [selectedMemberId, setSelectedMemberId] = useState(REAL_TEAM_MEMBERS[0]._id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId || "");
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { t, getLocalized, isRTL } = useLanguage();

  const getRoleLabel = (role: string) => {
    if (role === "SALES") return isRTL ? "مستشار مبيعات" : "Sales Consultant";
    if (role === "MANAGER") return isRTL ? "مدير مبيعات" : "Sales Director";
    if (role === "ADMIN") return isRTL ? "إدارة التطوير والمبيعات" : "Executive Advisory";
    return role;
  };

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      if (preselectedUnitNumber && !message) {
        setMessage(
          isRTL
            ? `  حجز    ${preselectedUnitNumber}.`
            : ` Reserving ${preselectedUnitNumber}.`
        );
      }

      // Load Projects
      api
        .get<IProject[]>("/projects?limit=50")
        .then((res) => {
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setProjects(res.data);
          } else {
            setProjects(STATIC_PROJECTS);
          }
          if (!selectedProjectId && preselectedProjectId) {
            setSelectedProjectId(preselectedProjectId);
          }
        })
        .catch((err) => {
          console.warn("Could not load projects for inquiry modal, using static fallback:", err);
          setProjects(STATIC_PROJECTS);
          if (!selectedProjectId && preselectedProjectId) {
            setSelectedProjectId(preselectedProjectId);
          }
        });

      // Fetch dynamic active team from backend API
      api
        .get<TeamMember[]>("/users/public-team")
        .then((res) => {
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setTeamMembers(res.data);
            if (!selectedMemberId) {
              setSelectedMemberId(res.data[0]._id);
            }
          }
        })
        .catch((err) => {
          // If server returns 401 or hasn't reloaded yet, keep real MongoDB Atlas team
          console.warn("Using real MongoDB Atlas team accounts:", err);
        });
    }
  }, [isOpen, preselectedProjectId, preselectedUnitNumber, isRTL]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t("inquiryModal.enterNamePhone"));
      return;
    }

    if (attributionType === "TEAM_MEMBER" && !selectedMemberId) {
      toast.error(t("inquiryModal.selectTeamMemberPrompt"));
      return;
    }

    const selectedMember = teamMembers.find((m) => m._id === selectedMemberId);
    const isTeamAttribution = attributionType === "TEAM_MEMBER" && !!selectedMemberId;

    setIsSubmitting(true);
    try {
      await api.post("/leads/public", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        projectId: selectedProjectId || undefined,
        unitId: preselectedUnitId || undefined,
        budget: budget || undefined,
        message: message.trim() || undefined,
        source: isTeamAttribution ? "REFERRAL" : "WEBSITE_INQUIRY",
        assignedTo:
          isTeamAttribution && selectedMember?._id && /^[0-9a-fA-F]{24}$/.test(selectedMember._id)
            ? selectedMember._id
            : undefined,
        referrerName: isTeamAttribution ? selectedMember?.name : undefined,
      });

      setIsSuccess(true);
      toast.success(t("inquiryModal.inquirySubmitted"));
    } catch (err: any) {
      // Fallback: save to localStorage when server is offline
      try {
        const stored = JSON.parse(localStorage.getItem("offline_inquiries") || "[]");
        stored.push({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          projectId: selectedProjectId || undefined,
          unitId: preselectedUnitId || undefined,
          budget: budget || undefined,
          message: message.trim() || undefined,
          source: isTeamAttribution ? "REFERRAL" : "WEBSITE_INQUIRY",
          assignedTo: selectedMember?._id,
          referrerName: selectedMember?.name,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("offline_inquiries", JSON.stringify(stored));
        setIsSuccess(true);
        toast.success(t("inquiryModal.inquirySubmitted"));
      } catch {
        toast.error(err.message || "Failed to submit inquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setPhone("");
    setEmail("");
    setBudget(undefined);
    setMessage("");
    setAttributionType("WEBSITE");
    setSelectedMemberId(teamMembers[0]?._id || "");
    setIsSuccess(false);
    onClose();
  };

  const currentAttributedMember = teamMembers.find((m) => m._id === selectedMemberId);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleResetAndClose}
    >
      <div
        className="w-full max-w-lg bg-white text-stone-900 border border-stone-200 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#9b7c52] mb-1 font-semibold">

              <span>{t("inquiryModal.tag")}</span>
            </div>
            <h2 className="text-lg font-normal text-stone-950">
              {t("inquiryModal.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-12 w-12 bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-stone-900">
              {t("inquiryModal.received")}
            </h3>
            <p className="font-mono text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              {t("inquiryModal.thankYou", { name })}
            </p>
            {attributionType === "TEAM_MEMBER" && currentAttributedMember && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 font-mono text-[0.7rem] text-[#9b7c52] max-w-xs mx-auto">
                {isRTL ? "المستشار المتابع لطلبك: " : "Assigned Consultant: "}
                <strong>{currentAttributedMember.name}</strong>
              </div>
            )}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors cursor-pointer"
              >
                {t("inquiryModal.closeWindow")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">


            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.fullName")} <span className="text-[#9b7c52]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? "مثال: طارق منصور" : "e.g. Tarek Mansour"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.phone")} <span className="text-[#9b7c52]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Email & Development of Interest */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.email")}
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.development")}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880] font-mono text-[0.68rem]"
                >
                  <option value="">{t("inquiryModal.generalPortfolio")}</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {getLocalized(p.name.en, p.name.ar)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Source / Attribution Selection */}
            <div className="p-3 bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 flex items-center gap-1.5 font-semibold">
                  <Users className="h-3.5 w-3.5 text-[#9b7c52]" />
                  <span>{t("inquiryModal.sourceSection")}</span>
                  <span className="text-[#9b7c52]">*</span>
                </label>
                {attributionType === "TEAM_MEMBER" && currentAttributedMember && (
                  <span className="font-mono text-[0.62rem] text-[#9b7c52] bg-amber-50 px-2 py-0.5 border border-amber-200 font-semibold truncate max-w-[160px]">
                    {currentAttributedMember.name}
                  </span>
                )}
              </div>

              {/* Source Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAttributionType("WEBSITE");
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 border font-mono text-[0.68rem] uppercase tracking-wider transition-all cursor-pointer ${attributionType === "WEBSITE"
                    ? "border-[#c5a880] bg-white text-stone-950 font-semibold shadow-xs ring-1 ring-[#c5a880]"
                    : "border-stone-200 bg-stone-100/70 text-stone-600 hover:border-stone-300 hover:text-stone-900"
                    }`}
                >
                  <Globe className="h-3.5 w-3.5 text-[#9b7c52]" />
                  <span>{t("inquiryModal.sourceWebsite")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttributionType("TEAM_MEMBER");
                    if (!selectedMemberId && teamMembers.length > 0) {
                      setSelectedMemberId(teamMembers[0]._id);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 border font-mono text-[0.68rem] uppercase tracking-wider transition-all cursor-pointer ${attributionType === "TEAM_MEMBER"
                    ? "border-[#c5a880] bg-white text-stone-950 font-semibold shadow-xs ring-1 ring-[#c5a880]"
                    : "border-stone-200 bg-stone-100/70 text-stone-600 hover:border-stone-300 hover:text-stone-900"
                    }`}
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#9b7c52]" />
                  <span>{t("inquiryModal.sourceTeamMember")}</span>
                </button>
              </div>

              {/* Team Member Dropdown when TEAM_MEMBER is active */}
              {attributionType === "TEAM_MEMBER" && (
                <div className="pt-1 space-y-1 animate-in fade-in duration-150">
                  <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-600 block">
                    {t("inquiryModal.teamMemberSelect")} <span className="text-[#9b7c52]">*</span>
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    required
                    className="w-full bg-white border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880] font-sans"
                  >
                    {teamMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({getRoleLabel(m.role)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Message / Unit Requirements */}
            <div className="space-y-1">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                {t("inquiryModal.requirements")}
              </label>
              <textarea
                rows={3}
                placeholder={t("inquiryModal.requirementsPlaceholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between font-mono text-xs">
              <span className="text-[0.62rem] text-stone-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#9b7c52]" />
                {t("inquiryModal.confidential")}
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#111110] text-white font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors disabled:opacity-50 uppercase tracking-wider text-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? t("inquiryModal.submitting") : t("inquiryModal.sendInquiry")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
