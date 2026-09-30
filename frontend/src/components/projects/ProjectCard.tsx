"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  Maximize2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { IProject, ProjectStatus } from "@/types/project";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProjectCardProps {
  project: IProject;
  matchingUnitsCount?: number;
  onOpenInquiry?: (projectId: string) => void;
  onOpenDetails?: (project: IProject) => void;
}

export function ProjectCard({
  project,
  matchingUnitsCount,
  onOpenInquiry,
  onOpenDetails,
}: ProjectCardProps) {
  const { t, getLocalized, formatPrice, isRTL, language, localizeStatus, localizeUnitType, localizeCity } = useLanguage();

  const primaryName = getLocalized(project.name.en, project.name.ar);
  const secondaryName = language === "ar" ? project.name.en : project.name.ar;
  const locationText = `${project.location?.area ? `${project.location.area}, ` : ""}${localizeCity(project.location?.city || "")}`;

  const getStatusBadge = (status: ProjectStatus | string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("READY") || s.includes("COMPLETED")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-300";
    }
    if (s.includes("NEAR") || s.includes("COMING")) {
      return "bg-sky-50 text-sky-800 border-sky-300";
    }
    if (s.includes("CONSTRUCTION")) {
      return "bg-amber-50 text-amber-800 border-amber-300";
    }
    return "bg-stone-50 text-stone-800 border-stone-300";
  };

  // Best payment plan summary
  const bestPlan = project.paymentPlans && project.paymentPlans.length > 0 ? project.paymentPlans[0] : null;

  // Property types preview
  const propertyTypes = project.projectTypes && project.projectTypes.length > 0
    ? project.projectTypes
    : project.projectType
    ? [project.projectType]
    : [];

  return (
    <div className="group bg-white border border-stone-200/90 hover:border-[#c5a880] transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-xl">
      <div>
        {/* Cover Image Container */}
        <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
          <Link href={`/projects/${project.slug}`} className="block w-full h-full">
            <img
              src={project.coverImage}
              alt={primaryName}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Status Badge */}
          <span
            className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} font-mono text-[0.62rem] uppercase tracking-wider px-2.5 py-1 border backdrop-blur-md shadow-sm font-semibold ${getStatusBadge(
              project.status
            )}`}
          >
            {localizeStatus(project.status)}
          </span>

          {/* Available Units Badge */}
          <span
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} bg-white/95 backdrop-blur-md px-2.5 py-1 border border-stone-200 font-mono text-[0.62rem] text-stone-800 shadow-sm font-semibold`}
          >
            {matchingUnitsCount !== undefined
              ? `${matchingUnitsCount} ${language === "ar" ? "وحدة مطابقة" : "Matching Units"}`
              : project.availableUnits
              ? `${project.availableUnits} ${language === "ar" ? "وحدة متاحة" : "Available Units"}`
              : language === "ar" ? "متاح للحجز" : "Open for Booking"}
          </span>

          {/* Developer & Delivery Date Ribbon */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-white pointer-events-none">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20">
              <MapPin className="h-3 w-3 text-[#c5a880]" />
              <span className="truncate max-w-[170px]">{locationText}</span>
            </span>

            <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20 text-[#e6cb9f] text-[0.65rem]">
              {project.developer || "Rawasin"}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link href={`/projects/${project.slug}`} className="hover:text-[#9b7c52] transition-colors">
                <h3 className="text-xl font-medium text-stone-900 leading-tight">
                  {primaryName}
                </h3>
              </Link>
            </div>
            {secondaryName && (
              <p className="font-mono text-[0.68rem] text-stone-400 mt-0.5">
                {secondaryName}
              </p>
            )}
          </div>

          {/* Property Types Pills */}
          {propertyTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {propertyTypes.map((pt) => (
                <span
                  key={pt}
                  className="font-mono text-[0.62rem] px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200"
                >
                  {localizeUnitType(pt)}
                </span>
              ))}
            </div>
          )}

          {/* Metrics: Area & Delivery */}
          <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-stone-50 border border-stone-200/80 font-mono text-xs">
            <div>
              <span className="text-[0.6rem] uppercase tracking-wider text-stone-400 block">
                {language === "ar" ? "المساحة" : "Area Range"}
              </span>
              <span className="font-semibold text-stone-800 text-[0.75rem]">
                {project.minArea && project.maxArea
                  ? `${project.minArea}–${project.maxArea} m²`
                  : project.minArea
                  ? `From ${project.minArea} m²`
                  : "Varied Sizes"}
              </span>
            </div>
            <div>
              <span className="text-[0.6rem] uppercase tracking-wider text-stone-400 block">
                {language === "ar" ? "الاستلام" : "Delivery"}
              </span>
              <span className="font-semibold text-stone-800 text-[0.75rem] truncate block">
                {project.deliveryDate || "Q4 2026"}
              </span>
            </div>
          </div>

          {/* Payment Plan Summary */}
          {bestPlan ? (
            <div className="flex items-center gap-2 p-2.5 bg-[#fdfbf7] border border-[#e8dfd1] text-stone-700 font-mono text-[0.68rem]">
              <CreditCard className="h-3.5 w-3.5 text-[#9b7c52] shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>
                  {language === "ar" ? `مقدم ${bestPlan.downPaymentPercentage}%` : `${bestPlan.downPaymentPercentage}% Down Payment`}
                </span>
                <span className="font-semibold text-stone-900">
                  {language === "ar" ? `تقسيط حتى ${bestPlan.installmentYears} سنوات` : `Up to ${bestPlan.installmentYears} Years`}
                </span>
              </div>
            </div>
          ) : null}

          {/* Starting Price */}
          <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-[0.6rem] uppercase tracking-wider text-stone-400 block">
                {t("projectsPage.startingPrice")}
              </span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(project.startingPrice)}
              </span>
            </div>

            {onOpenDetails && (
              <button
                type="button"
                onClick={() => onOpenDetails(project)}
                className="text-[0.68rem] text-stone-500 hover:text-stone-950 underline underline-offset-4"
              >
                {t("projectsPage.specs")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/70 flex items-center gap-2">
        <Link
          href={`/projects/${project.slug}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
        >
          <span>{language === "ar" ? "تفاصيل المشروع" : "View Project"}</span>
          {isRTL ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </Link>

        <Link
          href={`/units?projectId=${project._id}`}
          className="py-2.5 px-3 border border-stone-300 hover:border-[#9b7c52] bg-white text-stone-800 hover:text-[#9b7c52] font-mono text-xs uppercase tracking-wider transition-colors"
          title={language === "ar" ? "عرض وحدات المشروع" : "Browse Units"}
        >
          <KeyRound className="h-3.5 w-3.5 text-[#9b7c52]" />
        </Link>

        {onOpenInquiry && (
          <button
            type="button"
            onClick={() => onOpenInquiry(project._id)}
            className="py-2.5 px-3 border border-stone-300 hover:border-stone-900 bg-white text-stone-800 font-mono text-xs uppercase tracking-wider transition-colors"
            title={language === "ar" ? "استفسار سريع" : "Quick Inquiry"}
          >
            {language === "ar" ? "استفسار" : "Inquire"}
          </button>
        )}
      </div>
    </div>
  );
}
