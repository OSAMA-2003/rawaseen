"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Send, Sparkles, CheckCircle2, Phone, Mail, Building2, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { IProject } from "../../types/project";
import { useLanguage } from "../../i18n/LanguageContext";
import { STATIC_PROJECTS } from "@/data/staticData";

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId || "");
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { t, getLocalized, isRTL } = useLanguage();

  const budgetPresets = [
    { label: isRTL ? "1 – 3 مليون" : "1M – 3M EGP", value: 2000000 },
    { label: isRTL ? "3 – 5 مليون" : "3M – 5M EGP", value: 4000000 },
    { label: isRTL ? "5 – 7 مليون" : "5M – 7M EGP", value: 6000000 },
    { label: isRTL ? "7 – 10 مليون" : "7M – 10M EGP", value: 8500000 },
    { label: isRTL ? "10 – 15 مليون" : "10M – 15M EGP", value: 12500000 },
    { label: isRTL ? "15 – 20 مليون" : "15M – 20M EGP", value: 17500000 },
    { label: isRTL ? "20 – 25 مليون" : "20M – 25M EGP", value: 22500000 },
    { label: isRTL ? "+25 مليون" : "25M+ EGP", value: 30000000 },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      if (preselectedUnitNumber && !message) {
        setMessage(
          isRTL
            ? `استفسار بخصوص حجز الوحدة رقم ${preselectedUnitNumber}.`
            : `Inquiring about reservation for Unit ${preselectedUnitNumber}.`
        );
      }
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
    }
  }, [isOpen, preselectedProjectId, preselectedUnitNumber, isRTL]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error(t("inquiryModal.enterNamePhone"));
      return;
    }

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
        source: "WEBSITE_INQUIRY",
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
    setIsSuccess(false);
    onClose();
  };

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
              <Sparkles className="h-3 w-3" />
              <span>{t("inquiryModal.tag")}</span>
            </div>
            <h2 className="text-lg font-normal text-stone-950">
              {t("inquiryModal.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
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
            <div className="pt-4">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors"
              >
                {t("inquiryModal.closeWindow")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {preselectedUnitNumber && (
              <div className="p-3 bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="font-mono text-xs text-stone-900">
                  {t("inquiryModal.unitInquiry")} <strong className="text-[#9b7c52]">{preselectedUnitNumber}</strong>
                </span>
                <span className="font-mono text-[0.62rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-semibold">
                  {t("inquiryModal.priorityLink")}
                </span>
              </div>
            )}

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

            {/* Investment / Budget Range */}
            <div className="space-y-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-600">
                {t("inquiryModal.budget")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {budgetPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBudget(preset.value)}
                    className={`p-2 font-mono text-[0.62rem] border transition-colors ${budget === preset.value
                      ? "bg-[#c5a880]/20 text-[#8c6b3e] border-[#c5a880] font-semibold"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-[#111110] text-white font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors disabled:opacity-50 uppercase tracking-wider text-xs"
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
