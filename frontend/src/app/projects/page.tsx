"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Sparkles,
  RefreshCw,
  X,
  CreditCard,
  Check,
} from "lucide-react";
import { Navigation } from "@/components/nova/Navigation";
import { PublicInquiryModal } from "@/components/public/PublicInquiryModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsFilterBar } from "@/components/projects/ProjectsFilterBar";
import { api } from "@/lib/api";
import { IProject } from "@/types/project";
import { IUnit } from "@/types/unit";
import { useLanguage } from "@/i18n/LanguageContext";
import { STATIC_PROJECTS, STATIC_UNITS } from "@/data/staticData";
import {
  ProjectFilterCriteria,
  filterProjectsWithUnits,
} from "@/lib/projectFilters";

const initialCriteria: ProjectFilterCriteria = {
  searchQuery: "",
  city: "ALL",
  area: "ALL",
  propertyType: "ALL",
  projectStatus: "ALL",
  bedrooms: "ALL",
  bathrooms: "ALL",
  installmentDuration: "ALL",
  finishing: "ALL",
  view: "ALL",
  availableUnitsOnly: false,
  sortBy: "newest",
};

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [units, setUnits] = useState<IUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState<ProjectFilterCriteria>(initialCriteria);

  // Modals state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<IProject | null>(null);

  const { t, getLocalized, formatPrice, isRTL, language, localizeStatus, localizeAmenity, localizeCity } = useLanguage();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, unitsRes] = await Promise.allSettled([
        api.get<IProject[]>("/projects?limit=50"),
        api.get<IUnit[]>("/units?limit=100"),
      ]);

      if (projRes.status === "fulfilled" && projRes.value.data && Array.isArray(projRes.value.data) && projRes.value.data.length > 0) {
        setProjects(projRes.value.data);
      } else {
        setProjects(STATIC_PROJECTS);
      }

      if (unitsRes.status === "fulfilled" && unitsRes.value.data && Array.isArray(unitsRes.value.data) && unitsRes.value.data.length > 0) {
        setUnits(unitsRes.value.data);
      } else {
        setUnits(STATIC_UNITS);
      }
    } catch (err: any) {
      console.warn("Error fetching projects & units, using static data:", err);
      setProjects(STATIC_PROJECTS);
      setUnits(STATIC_UNITS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Distinct cities list
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.city) set.add(p.location.city);
    });
    return Array.from(set);
  }, [projects]);

  // Distinct areas list
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.area) set.add(p.location.area);
    });
    return Array.from(set);
  }, [projects]);

  // Execute unit-dependent project filtering
  const filteredResults = useMemo(() => {
    return filterProjectsWithUnits(projects, units, criteria);
  }, [projects, units, criteria]);

  const handleOpenInquiry = (projectId?: string) => {
    setSelectedProjectId(projectId);
    setIsInquiryModalOpen(true);
  };

  const handleResetFilters = () => {
    setCriteria(initialCriteria);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900">
      <Navigation onOpenInquiry={() => handleOpenInquiry()} />

      {/* Hero Header */}
      <section className="pt-36 pb-12 px-5 md:px-10 border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-[1680px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-[#9b7c52] mb-3">
                <Sparkles className="h-3 w-3" />
                <span>{t("projectsPage.tag")}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight uppercase text-stone-950">
                {t("projectsPage.title")}
              </h1>
              <p className="mt-4 font-mono text-xs md:text-sm text-stone-600 max-w-2xl leading-relaxed">
                {language === "ar"
                  ? "استكشف أرقى المجمعات السكنية والتجارية الاستثنائية المطابقة لاحتياجاتك الدقيقة وخيارات السداد المرنة."
                  : t("projectsPage.sub")}
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3.5 py-1.5 bg-stone-100 border border-stone-200 text-stone-800 font-semibold shadow-sm">
                {filteredResults.length} {language === "ar" ? "مشروع مطابق" : t("projectsPage.count")}
              </span>
              <button
                type="button"
                onClick={fetchData}
                className="p-2 border border-stone-200 bg-white hover:bg-stone-100 transition-colors text-stone-700 shadow-sm"
                title="Refresh listings"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="mt-10">
            <ProjectsFilterBar
              criteria={criteria}
              onChange={setCriteria}
              onReset={handleResetFilters}
              availableCities={availableCities}
              availableAreas={availableAreas}
              totalProjectsCount={projects.length}
              filteredCount={filteredResults.length}
            />
          </div>
        </div>
      </section>

      {/* Main Projects Grid */}
      <section className="py-16 px-5 md:px-10">
        <div className="mx-auto max-w-[1680px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-stone-200 h-[520px] animate-pulse flex flex-col justify-between p-6 shadow-sm"
                >
                  <div className="h-64 bg-stone-100 w-full mb-4" />
                  <div className="space-y-3">
                    <div className="h-5 bg-stone-200 w-2/3" />
                    <div className="h-3 bg-stone-100 w-1/2" />
                    <div className="h-4 bg-stone-200 w-1/3" />
                  </div>
                  <div className="h-10 bg-stone-100 w-full mt-6" />
                </div>
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-stone-300 bg-white p-12 max-w-xl mx-auto space-y-4 shadow-sm">
              <Building2 className="h-12 w-12 text-stone-400 mx-auto" />
              <h3 className="text-xl font-medium text-stone-900">
                {language === "ar" ? "لم يتم العثور على مشاريع مطابقة" : t("projectsPage.noMatchTitle")}
              </h3>
              <p className="font-mono text-xs text-stone-500 leading-relaxed">
                {language === "ar"
                  ? "لا توجد مشاريع تحتوي على وحدات تطابق معايير الفلترة المحددة. جرب تغيير المساحة، عدد الغرف، أو نظام السداد."
                  : t("projectsPage.noMatchDesc")}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors"
              >
                {t("projectsPage.resetFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResults.map(({ project, matchingUnits }) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  matchingUnitsCount={matchingUnits.length}
                  onOpenInquiry={handleOpenInquiry}
                  onOpenDetails={setSelectedProjectForDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Specs Drawer / Modal */}
      {selectedProjectForDetails && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedProjectForDetails(null)}
        >
          <div
            className="w-full max-w-2xl bg-white text-stone-900 border border-stone-200 p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                  {t("projectsPage.specsDrawer.title")}
                </span>
                <h2 className="text-2xl font-normal text-stone-950 mt-1">
                  {getLocalized(selectedProjectForDetails.name.en, selectedProjectForDetails.name.ar)}
                </h2>
                <p className="font-mono text-xs text-stone-500">
                  {language === "ar" ? selectedProjectForDetails.name.en : selectedProjectForDetails.name.ar}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForDetails(null)}
                className="text-stone-400 hover:text-stone-900 font-mono text-xs uppercase p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-64 w-full overflow-hidden border border-stone-200">
              <img
                src={selectedProjectForDetails.coverImage}
                alt={getLocalized(selectedProjectForDetails.name.en, selectedProjectForDetails.name.ar)}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase text-[#9b7c52] tracking-wider font-semibold">
                {t("projectsPage.specsDrawer.desc")}
              </h4>
              <p className="font-mono text-xs text-stone-600 leading-relaxed">
                {getLocalized(selectedProjectForDetails.description.en, selectedProjectForDetails.description.ar)}
              </p>
            </div>

            {selectedProjectForDetails.amenities && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase text-[#9b7c52] tracking-wider font-semibold">
                  {t("projectsPage.specsDrawer.amenities")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectForDetails.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-200 font-mono text-xs text-stone-800"
                    >
                      ✓ {localizeAmenity(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProjectForDetails.paymentPlans && selectedProjectForDetails.paymentPlans.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase text-[#9b7c52] tracking-wider font-semibold">
                  {t("projectsPage.specsDrawer.paymentPlans")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProjectForDetails.paymentPlans.map((plan, i) => (
                    <div key={i} className="p-3 bg-stone-50 border border-stone-200 space-y-1 font-mono text-xs">
                      <div className="text-stone-900 font-semibold">{plan.title}</div>
                      <div className="text-stone-600 text-[0.68rem]">
                        {t("projectsPage.downPayment")}: <strong className="text-stone-900">{plan.downPaymentPercentage}%</strong>
                      </div>
                      <div className="text-stone-600 text-[0.68rem]">
                        {t("projectsPage.installmentsYears")}: <strong className="text-stone-900">{plan.installmentYears} {language === "ar" ? "سنوات" : "Years"}</strong>
                      </div>
                      {plan.monthlyInstallment ? (
                        <div className="text-[#9b7c52] text-[0.68rem] font-medium">
                          {language === "ar" ? "القسط الشهري:" : "Monthly:"} {formatPrice(plan.monthlyInstallment)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <Link
                href={`/projects/${selectedProjectForDetails.slug}`}
                className="px-5 py-2.5 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                {language === "ar" ? "الصفحة الكاملة للمشروع" : "Full Project Page"} {isRTL ? "←" : "→"}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSelectedProjectForDetails(null);
                  handleOpenInquiry(selectedProjectForDetails._id);
                }}
                className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-mono text-xs uppercase tracking-wider text-stone-800"
              >
                {t("projectsPage.specsDrawer.registerInterest")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Client Inquiry Dialog */}
      <PublicInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
          setSelectedProjectId(undefined);
        }}
        preselectedProjectId={selectedProjectId}
      />
    </div>
  );
}
