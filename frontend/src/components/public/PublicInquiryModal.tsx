"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  Send,
  CheckCircle2,
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
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(REAL_TEAM_MEMBERS);

  const [attributionType, setAttributionType] = useState<
    "WEBSITE" | "TEAM_MEMBER"
  >("WEBSITE");

  const [selectedMemberId, setSelectedMemberId] = useState(
    REAL_TEAM_MEMBERS[0]._id
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState(
    preselectedProjectId || ""
  );

  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { t, getLocalized, isRTL } = useLanguage();

  const getRoleLabel = (role: string) => {
    if (role === "SALES")
      return isRTL ? "مستشار مبيعات" : "Sales Consultant";

    if (role === "MANAGER")
      return isRTL ? "مدير مبيعات" : "Sales Director";

    if (role === "ADMIN")
      return isRTL
        ? "إدارة التطوير والمبيعات"
        : "Executive Advisory";

    return role;
  };

  useEffect(() => {
    if (!isOpen) return;

    setIsSuccess(false);

    if (preselectedUnitNumber && !message) {
      setMessage(
        isRTL
          ? `  حجز    ${preselectedUnitNumber}.`
          : ` Reserving ${preselectedUnitNumber}.`
      );
    }

    api
      .get<IProject[]>("/projects?limit=50")
      .then((res) => {
        if (
          res.data &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          setProjects(res.data);
        } else {
          setProjects(STATIC_PROJECTS);
        }

        if (!selectedProjectId && preselectedProjectId) {
          setSelectedProjectId(preselectedProjectId);
        }
      })
      .catch((err) => {
        console.warn(
          "Could not load projects for inquiry modal, using static fallback:",
          err
        );

        setProjects(STATIC_PROJECTS);

        if (!selectedProjectId && preselectedProjectId) {
          setSelectedProjectId(preselectedProjectId);
        }
      });

    api
      .get<TeamMember[]>("/users/public-team")
      .then((res) => {
        if (
          res.data &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          setTeamMembers(res.data);

          if (!selectedMemberId) {
            setSelectedMemberId(res.data[0]._id);
          }
        }
      })
      .catch((err) => {
        console.warn(
          "Using real MongoDB Atlas team accounts:",
          err
        );
      });
  }, [
    isOpen,
    preselectedProjectId,
    preselectedUnitNumber,
    isRTL,
  ]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error(t("inquiryModal.enterNamePhone"));
      return;
    }

    if (
      attributionType === "TEAM_MEMBER" &&
      !selectedMemberId
    ) {
      toast.error(t("inquiryModal.selectTeamMemberPrompt"));
      return;
    }

    const selectedMember = teamMembers.find(
      (m) => m._id === selectedMemberId
    );

    const isTeamAttribution =
      attributionType === "TEAM_MEMBER" &&
      !!selectedMemberId;

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
        source: isTeamAttribution
          ? "REFERRAL"
          : "WEBSITE_INQUIRY",

        assignedTo:
          isTeamAttribution &&
            selectedMember?._id &&
            /^[0-9a-fA-F]{24}$/.test(selectedMember._id)
            ? selectedMember._id
            : undefined,

        referrerName: isTeamAttribution
          ? selectedMember?.name
          : undefined,
      });

      setIsSuccess(true);
      toast.success(t("inquiryModal.inquirySubmitted"));
    } catch (err: any) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("offline_inquiries") || "[]"
        );

        stored.push({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          projectId: selectedProjectId || undefined,
          unitId: preselectedUnitId || undefined,
          budget: budget || undefined,
          message: message.trim() || undefined,
          source: isTeamAttribution
            ? "REFERRAL"
            : "WEBSITE_INQUIRY",
          assignedTo: selectedMember?._id,
          referrerName: selectedMember?.name,
          createdAt: new Date().toISOString(),
        });

        localStorage.setItem(
          "offline_inquiries",
          JSON.stringify(stored)
        );

        setIsSuccess(true);
        toast.success(t("inquiryModal.inquirySubmitted"));
      } catch {
        toast.error(
          err.message ||
          "Failed to submit inquiry. Please try again."
        );
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

  const currentAttributedMember = teamMembers.find(
    (m) => m._id === selectedMemberId
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4"
      onClick={handleResetAndClose}
    >
      <div
        className="relative flex h-[92dvh] max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white text-stone-900 shadow-2xl sm:my-auto sm:h-auto sm:max-h-[90vh] sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Line */}
        <div className="absolute left-0 right-0 top-0 z-10 h-[2px] shrink-0 bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 py-3.5 sm:p-6">
          <h2 className="text-base font-normal text-stone-950 sm:text-lg">
            {t("inquiryModal.title")}
          </h2>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="my-auto flex-1 overflow-y-auto overscroll-contain p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-medium text-stone-900 sm:text-lg">
              {t("inquiryModal.received")}
            </h3>

            <p className="mx-auto mt-3 max-w-sm font-mono text-xs leading-relaxed text-stone-600">
              {t("inquiryModal.thankYou", { name })}
            </p>

            {attributionType === "TEAM_MEMBER" &&
              currentAttributedMember && (
                <div className="mx-auto mt-4 max-w-xs border border-amber-200 bg-amber-50 p-3 font-mono text-xs text-[#9b7c52]">
                  {isRTL
                    ? "المستشار المتابع لطلبك: "
                    : "Assigned Consultant: "}

                  <strong>{currentAttributedMember.name}</strong>
                </div>
              )}

            <div className="pt-6">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="min-h-12 w-full bg-[#111110] px-8 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#c5a880] hover:text-[#111110] sm:w-auto"
              >
                {t("inquiryModal.closeWindow")}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-0 pt-4 sm:p-6"
          >
            {/* Form Fields */}
            <div className="space-y-4 pb-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.fullName")}{" "}
                  <span className="text-[#9b7c52]">*</span>
                </label>

                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={
                    isRTL
                      ? "مثال: طارق منصور"
                      : "e.g. Tarek Mansour"
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-12 w-full min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-base text-stone-900 placeholder-stone-400 transition-colors focus:border-[#c5a880] focus:bg-white focus:outline-none sm:rounded-none sm:py-2 sm:text-sm"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.phone")}{" "}
                  <span className="text-[#9b7c52]">*</span>
                </label>

                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="010 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-h-12 w-full min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-base text-stone-900 placeholder-stone-400 transition-colors focus:border-[#c5a880] focus:bg-white focus:outline-none sm:rounded-none sm:py-2 sm:text-sm"
                  dir="ltr"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.email")}
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-12 w-full min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-base text-stone-900 placeholder-stone-400 transition-colors focus:border-[#c5a880] focus:bg-white focus:outline-none sm:rounded-none sm:py-2 sm:text-sm"
                  dir="ltr"
                />
              </div>

              {/* Project */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.development")}
                </label>

                <select
                  value={selectedProjectId}
                  onChange={(e) =>
                    setSelectedProjectId(e.target.value)
                  }
                  className="min-h-12 w-full min-w-0 rounded-md border border-stone-200 bg-stone-50 px-3 py-3 font-sans text-base text-stone-900 focus:border-[#c5a880] focus:outline-none sm:rounded-none sm:py-2 sm:text-sm"
                >
                  <option value="">
                    {t("inquiryModal.generalPortfolio")}
                  </option>

                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {getLocalized(p.name.en, p.name.ar)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Source */}
              <div className="space-y-3 border border-stone-200 bg-stone-50 p-3.5 sm:p-4">
                <label className="flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-stone-700">
                  <Users className="h-4 w-4 shrink-0 text-[#9b7c52]" />

                  <span>{t("inquiryModal.sourceSection")}</span>

                  <span className="text-[#9b7c52]">*</span>
                </label>

                {/* Source Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAttributionType("WEBSITE")}
                    aria-pressed={attributionType === "WEBSITE"}
                    className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-md border px-2 py-2.5 text-center font-mono text-[0.68rem] transition-all sm:rounded-none ${attributionType === "WEBSITE"
                      ? "border-[#c5a880] bg-white font-semibold text-stone-950 ring-1 ring-[#c5a880]"
                      : "border-stone-200 bg-stone-100/70 text-stone-600"
                      }`}
                  >
                    <Globe className="h-4 w-4 shrink-0 text-[#9b7c52]" />

                    <span className="break-words">
                      {t("inquiryModal.sourceWebsite")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAttributionType("TEAM_MEMBER");

                      if (!selectedMemberId && teamMembers.length > 0) {
                        setSelectedMemberId(teamMembers[0]._id);
                      }
                    }}
                    aria-pressed={
                      attributionType === "TEAM_MEMBER"
                    }
                    className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-md border px-2 py-2.5 text-center font-mono text-[0.68rem] transition-all sm:rounded-none ${attributionType === "TEAM_MEMBER"
                      ? "border-[#c5a880] bg-white font-semibold text-stone-950 ring-1 ring-[#c5a880]"
                      : "border-stone-200 bg-stone-100/70 text-stone-600"
                      }`}
                  >
                    <UserCheck className="h-4 w-4 shrink-0 text-[#9b7c52]" />

                    <span className="break-words">
                      {t("inquiryModal.sourceTeamMember")}
                    </span>
                  </button>
                </div>

                {/* Team Member Select */}
                {attributionType === "TEAM_MEMBER" && (
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                      {t("inquiryModal.teamMemberSelect")}{" "}
                      <span className="text-[#9b7c52]">*</span>
                    </label>

                    <select
                      value={selectedMemberId}
                      onChange={(e) =>
                        setSelectedMemberId(e.target.value)
                      }
                      required
                      className="min-h-12 w-full min-w-0 rounded-md border border-stone-200 bg-white px-3 py-3 font-sans text-base text-stone-900 focus:border-[#c5a880] focus:outline-none sm:rounded-none sm:py-2 sm:text-sm"
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

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                  {t("inquiryModal.requirements")}
                </label>

                <textarea
                  rows={3}
                  placeholder={t(
                    "inquiryModal.requirementsPlaceholder"
                  )}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-24 w-full min-w-0 resize-y rounded-md border border-stone-200 bg-stone-50 p-3 text-base text-stone-900 placeholder-stone-400 transition-colors focus:border-[#c5a880] focus:bg-white focus:outline-none sm:rounded-none sm:text-sm"
                />
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-0 -mx-4 mt-auto flex shrink-0 flex-col gap-3 border-t border-stone-200 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-0 sm:pt-4">
              <span className="order-2 flex items-center justify-center gap-1.5 text-center font-mono text-[0.65rem] text-stone-500 sm:order-1 sm:justify-start">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#9b7c52]" />

                <span>{t("inquiryModal.confidential")}</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="order-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#111110] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#c5a880] hover:text-[#111110] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:w-auto sm:rounded-none"
              >
                <Send className="h-4 w-4 shrink-0" />

                <span>
                  {isSubmitting
                    ? t("inquiryModal.submitting")
                    : t("inquiryModal.sendInquiry")}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}