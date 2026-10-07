"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { api } from "@/lib/api";
import { IProject, ProjectStatus } from "@/types/project";
import { useLanguage } from "@/i18n/LanguageContext";
import { STATIC_PROJECTS } from "@/data/staticData";
import { prefersReducedMotion } from "@/lib/motion";

interface HomeProjectsSectionProps {
  onOpenInquiry?: (projectId?: string) => void;
}

export function HomeProjectsSection({ onOpenInquiry }: HomeProjectsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, getLocalized, formatPrice, isRTL, language, localizeStatus, localizeAmenity, localizeCity } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    api
      .get<IProject[]>("/projects?limit=6")
      .then((res) => {
        if (isMounted) {
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setProjects(res.data);
          } else {
            setProjects(STATIC_PROJECTS.slice(0, 6));
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load homepage projects, falling back to static data:", err);
        if (isMounted) {
          setProjects(STATIC_PROJECTS.slice(0, 6));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // GSAP Title reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !sectionRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-home-title-animate]",
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }, sectionRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [language]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/25";
      case "COMING_SOON":
        return "bg-sky-500/10 text-sky-800 border-sky-500/25";
      case "UNDER_CONSTRUCTION":
        return "bg-amber-500/10 text-amber-800 border-amber-500/25";
      case "COMPLETED":
        return "bg-teal-500/10 text-teal-800 border-teal-500/25";
      case "OFF_PLAN":
        return "bg-indigo-500/10 text-indigo-800 border-indigo-500/25";
      case "SOLD_OUT":
        return "bg-rose-500/10 text-rose-800 border-rose-500/25";
      default:
        return "bg-[#c5a880]/15 text-[#8c6b3e] border-[#c5a880]/35";
    }
  };

  return (
    <section ref={sectionRef} id="home-projects" className="relative bg-[#f8f6f2] text-[#182220] py-24 md:py-32 px-5 md:px-10 border-t border-[#e8e4dc]">
      <div className="mx-auto max-w-[1680px]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-[#e8e4dc]">
          <div>
            <div data-home-title-animate className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-[#9e825e] mb-3">
              <Sparkles className="h-3 w-3" />
              <span>{t("homeProjects.sectionNum")}</span>
            </div>
            <h2 data-home-title-animate className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight uppercase text-[#182220]">
              {t("homeProjects.title")}
            </h2>
            <p data-home-title-animate className="mt-3 font-mono text-xs md:text-sm text-[#50605c] max-w-2xl leading-relaxed">
              {t("homeProjects.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/units"
              className="inline-flex items-center gap-2 px-5 py-3 border border-[#dcd6cc] bg-white hover:border-[#c5a880] rounded-full font-mono text-xs uppercase tracking-wider text-[#182220] transition-all shadow-xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#9e825e]" />
              <span>{t("homeProjects.browseUnits")}</span>
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#182220] text-[#f8f6f2] hover:bg-[#253633] rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-xs"
            >
              <span>{t("homeProjects.exploreAll")}</span>
              {isRTL ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </Link>
          </div>
        </div>

        {/* Projects Showcase Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 h-[480px] animate-pulse flex flex-col justify-between p-6 shadow-sm"
              >
                <div className="h-56 bg-stone-100 w-full mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-stone-200 w-3/4" />
                  <div className="h-3 bg-stone-100 w-1/2" />
                  <div className="h-4 bg-stone-200 w-1/3 pt-4" />
                </div>
                <div className="h-10 bg-stone-100 w-full mt-6" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-stone-300 bg-white p-12 my-12 space-y-4 shadow-sm">
            <Building2 className="h-10 w-10 text-stone-400 mx-auto" />
            <h3 className="text-lg font-medium text-stone-900">
              {t("homeProjects.emptyTitle")}
            </h3>
            <p className="font-mono text-xs text-stone-500 max-w-md mx-auto">
              {t("homeProjects.emptyDesc")}
            </p>
            {onOpenInquiry && (
              <button
                type="button"
                onClick={() => onOpenInquiry()}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors"
              >
                {t("homeProjects.scheduleConsultation")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
            {projects.map((project) => {
              const primaryName = getLocalized(project.name.en, project.name.ar);
              const secondaryName = language === "ar" ? project.name.en : project.name.ar;
              const description = getLocalized(project.description.en, project.description.ar);

              return (
                <div
                  key={project._id}
                  className="group bg-white border border-[#e8e4dc] hover:border-[#c5a880]/60 rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-[0_4px_24px_-4px_rgba(24,34,32,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(24,34,32,0.08)]"
                >
                  <div>
                    {/* Image Container with Zoom */}
                    <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
                      <Link href={`/projects/${project.slug}`} className="block w-full h-full">
                        <img
                          src={project.coverImage}
                          alt={primaryName}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                      {/* Status Badge */}
                      <span
                        className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} font-mono text-[0.62rem] uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-sm ${getStatusBadge(
                          project.status
                        )}`}
                      >
                        {localizeStatus(project.status)}
                      </span>

                      {/* Location Pill */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white pointer-events-none">
                        <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          <MapPin className="h-3 w-3 text-[#c5a880]" />
                          <span>{localizeCity(project.location.city)}</span>
                        </span>

                        <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[#c5a880]">
                          {language === "ar" ? "رواسن" : (project.developer || "Rawasin")}
                        </span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/projects/${project.slug}`} className="hover:text-[#9e825e] transition-colors">
                            <h3 className="text-xl font-medium text-[#182220] leading-tight">
                              {primaryName}
                            </h3>
                          </Link>
                          {secondaryName && (
                            <span className="font-mono text-xs text-stone-500 shrink-0">
                              {secondaryName}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-[#50605c] line-clamp-2 leading-relaxed">
                          {description}
                        </p>
                      </div>

                      {/* Amenities Preview */}
                      {project.amenities && project.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="font-mono text-[0.62rem] px-2.5 py-0.5 rounded-md bg-[#f4f0e8] text-[#4a5854] border border-[#e5dfd4]"
                            >
                              {localizeAmenity(amenity)}
                            </span>
                          ))}
                          {project.amenities.length > 3 && (
                            <span className="font-mono text-[0.62rem] px-1.5 py-0.5 text-stone-500">
                              +{project.amenities.length - 3} {language === "ar" ? "إضافية" : "more"}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Payment Plan Highlight */}
                      {project.paymentPlans && project.paymentPlans.length > 0 && (
                        <div className="p-2.5 bg-[#f6f3ec] border border-[#e8e2d5] rounded-xl flex items-center gap-2 font-mono text-[0.68rem] text-[#8f744f]">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {project.paymentPlans[0].title} — {project.paymentPlans[0].installmentYears} {t("homeProjects.installmentsYears")}
                          </span>
                        </div>
                      )}

                      {/* Price Tag */}
                      <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between font-mono">
                        <div>
                          <span className="text-[0.62rem] uppercase tracking-wider text-stone-400 block">
                            {t("homeProjects.startingFrom")}
                          </span>
                          <span className="text-lg font-semibold text-[#182220]">
                            {formatPrice(project.startingPrice)}
                          </span>
                        </div>

                        <div className={isRTL ? "text-left" : "text-right"}>
                          <span className="text-[0.62rem] uppercase tracking-wider text-stone-400 block">
                            {t("homeProjects.governorate")}
                          </span>
                          <span className="text-xs text-stone-600">
                            {localizeCity(project.location.governorate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 border-t border-[#f0ece5] bg-[#faf8f5] flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[#dcd6cc] hover:border-[#9e825e] bg-white text-[#182220] hover:text-[#9e825e] rounded-xl font-mono text-[0.7rem] uppercase tracking-wider transition-colors"
                    >
                      <span>{language === "ar" ? "تفاصيل المشروع" : "Project Details"}</span>
                      {isRTL ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    </Link>

                    {onOpenInquiry && (
                      <button
                        type="button"
                        onClick={() => onOpenInquiry(project._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#182220] text-[#f8f6f2] hover:bg-[#253633] rounded-xl font-mono text-[0.7rem] uppercase tracking-wider font-semibold transition-colors"
                      >
                        <span>{t("homeProjects.inquire")}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Discovery Strip at the bottom of the section */}
        <div className="mt-16 p-8 border border-stone-200 bg-gradient-to-r from-stone-50 via-white to-stone-50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className={`space-y-1 text-center ${isRTL ? "md:text-right" : "md:text-left"}`}>
            <h4 className="text-lg font-normal text-stone-900 uppercase tracking-tight">
              {t("homeProjects.discoveryTitle")}
            </h4>
            <p className="font-mono text-xs text-stone-600">
              {t("homeProjects.discoveryDesc")}
            </p>
          </div>

          <Link
            href="/units"
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors shadow-xs"
          >
            <KeyRound className="h-4 w-4" />
            <span>{t("homeProjects.discoveryBtn")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
