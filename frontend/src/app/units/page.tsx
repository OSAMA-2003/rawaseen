"use client";

import React, { useEffect, useRef, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Search,
  MapPin,
  Sparkles,
  Building2,
  RefreshCw,
  X,
  ArrowRight,
  ArrowLeft,
  Paintbrush,
  Eye,
  CreditCard,
} from "lucide-react";
import { Navigation } from "@/components/nova/Navigation";
import { PublicInquiryModal } from "@/components/public/PublicInquiryModal";
import { UnitsFilterBar, UnitFilterCriteria } from "@/components/units/UnitsFilterBar";
import { api } from "@/lib/api";
import { IProject } from "@/types/project";
import { IUnit, UnitStatus, UnitType } from "@/types/unit";
import { useLanguage } from "@/i18n/LanguageContext";
import { STATIC_PROJECTS, STATIC_UNITS } from "@/data/staticData";

function UnitsContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "ALL";

  const [units, setUnits] = useState<IUnit[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Advanced Filters state
  const initialCriteria: UnitFilterCriteria = useMemo(
    () => ({
      searchQuery: "",
      projectId: initialProjectId,
      city: "ALL",
      area: "ALL",
      unitType: "ALL",
      status: "AVAILABLE",
      bedrooms: "ALL",
      bathrooms: "ALL",
      finishing: "ALL",
      view: "ALL",
      availableOnly: false,
      sortBy: "priceAsc",
    }),
    [initialProjectId]
  );

  const [criteria, setCriteria] = useState<UnitFilterCriteria>(initialCriteria);

  // Inquire & Specs Modals
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryProjectId, setInquiryProjectId] = useState<string | undefined>(undefined);
  const [inquiryUnitId, setInquiryUnitId] = useState<string | undefined>(undefined);
  const [inquiryUnitNumber, setInquiryUnitNumber] = useState<string | undefined>(undefined);
  const [detailUnit, setDetailUnit] = useState<IUnit | null>(null);

  const pageTitleRef = useRef<HTMLDivElement>(null);
  const {
    t,
    getLocalized,
    formatPrice,
    isRTL,
    language,
    localizeStatus,
    localizeUnitType,
    localizeCity,
    localizeFinishing,
    localizeView,
  } = useLanguage();

  useEffect(() => {
    if (!pageTitleRef.current) return;
    (async () => {
      const { gsap } = await import("gsap");
      gsap.fromTo(
        pageTitleRef.current!.querySelectorAll("[data-page-title-animate]"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }
      );
    })();
  }, [language]);

  // Update criteria.projectId if URL param changes
  useEffect(() => {
    const paramId = searchParams.get("projectId");
    if (paramId) {
      setCriteria((prev) => ({ ...prev, projectId: paramId }));
    }
  }, [searchParams]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [unitsRes, projectsRes] = await Promise.allSettled([
        api.get<IUnit[]>("/units?limit=100"),
        api.get<IProject[]>("/projects?limit=50"),
      ]);

      if (
        unitsRes.status === "fulfilled" &&
        unitsRes.value.data &&
        Array.isArray(unitsRes.value.data) &&
        unitsRes.value.data.length > 0
      ) {
        setUnits(unitsRes.value.data);
      } else {
        setUnits(STATIC_UNITS);
      }

      if (
        projectsRes.status === "fulfilled" &&
        projectsRes.value.data &&
        Array.isArray(projectsRes.value.data) &&
        projectsRes.value.data.length > 0
      ) {
        setProjects(projectsRes.value.data);
      } else {
        setProjects(STATIC_PROJECTS);
      }
    } catch (err: any) {
      console.warn("Error loading units and projects, falling back to static data:", err);
      setUnits(STATIC_UNITS);
      setProjects(STATIC_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Distinct cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.city) set.add(p.location.city);
    });
    return Array.from(set);
  }, [projects]);

  // Distinct areas
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.area) set.add(p.location.area);
    });
    return Array.from(set);
  }, [projects]);

  const filteredUnits = useMemo(() => {
    const q = (criteria.searchQuery || "").toLowerCase().trim();

    return units
      .filter((unit) => {
        const unitProjectId =
          typeof unit.projectId === "object"
            ? unit.projectId?._id
            : unit.projectId;
        const projObj =
          (typeof unit.projectId === "object"
            ? unit.projectId
            : projects.find((p) => p._id === unitProjectId)) as any;

        // Project filter
        if (
          criteria.projectId &&
          criteria.projectId !== "ALL" &&
          unitProjectId !== criteria.projectId
        ) {
          return false;
        }

        // City filter
        if (
          criteria.city &&
          criteria.city !== "ALL" &&
          projObj?.location?.city !== criteria.city
        ) {
          return false;
        }

        // Area filter
        if (
          criteria.area &&
          criteria.area !== "ALL" &&
          projObj?.location?.area !== criteria.area
        ) {
          return false;
        }

        // Unit type
        if (
          criteria.unitType &&
          criteria.unitType !== "ALL" &&
          unit.type !== criteria.unitType
        ) {
          return false;
        }

        // Status filter
        if (
          criteria.status &&
          criteria.status !== "ALL" &&
          unit.status !== criteria.status
        ) {
          return false;
        }

        // Available only
        if (criteria.availableOnly && unit.status !== "AVAILABLE") {
          return false;
        }

        // Price range
        if (criteria.minPrice !== undefined && unit.price < criteria.minPrice)
          return false;
        if (criteria.maxPrice !== undefined && unit.price > criteria.maxPrice)
          return false;

        // Area range
        if (criteria.minArea !== undefined && unit.area < criteria.minArea)
          return false;
        if (criteria.maxArea !== undefined && unit.area > criteria.maxArea)
          return false;

        // Bedrooms
        if (criteria.bedrooms && criteria.bedrooms !== "ALL") {
          if (criteria.bedrooms === "4+" && unit.bedrooms < 4) return false;
          if (
            criteria.bedrooms !== "4+" &&
            unit.bedrooms !== parseInt(criteria.bedrooms, 10)
          )
            return false;
        }

        // Bathrooms
        if (criteria.bathrooms && criteria.bathrooms !== "ALL") {
          if (criteria.bathrooms === "3+" && unit.bathrooms < 3) return false;
          if (
            criteria.bathrooms !== "3+" &&
            unit.bathrooms !== parseInt(criteria.bathrooms, 10)
          )
            return false;
        }

        // Finishing
        if (
          criteria.finishing &&
          criteria.finishing !== "ALL" &&
          unit.finishing !== criteria.finishing
        ) {
          return false;
        }

        // View
        if (
          criteria.view &&
          criteria.view !== "ALL" &&
          unit.view !== criteria.view
        ) {
          return false;
        }

        // Search Query
        if (q) {
          const projectNameEn = projObj?.name?.en?.toLowerCase() || "";
          const projectNameAr = projObj?.name?.ar || "";
          const cityStr = projObj?.location?.city?.toLowerCase() || "";
          const matches =
            unit.unitNumber.toLowerCase().includes(q) ||
            projectNameEn.includes(q) ||
            projectNameAr.includes(q) ||
            unit.type.toLowerCase().includes(q) ||
            cityStr.includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (criteria.sortBy === "priceAsc") return a.price - b.price;
        if (criteria.sortBy === "priceDesc") return b.price - a.price;
        if (criteria.sortBy === "areaDesc") return b.area - a.area;
        return 0;
      });
  }, [units, projects, criteria]);

  const handleOpenReservation = (unit: IUnit) => {
    const pId = typeof unit.projectId === "object" ? unit.projectId?._id : (unit.projectId as string);
    setInquiryProjectId(pId);
    setInquiryUnitId(unit._id);
    setInquiryUnitNumber(unit.unitNumber);
    setIsInquiryModalOpen(true);
  };

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "RESERVED":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "SOLD":
        return "bg-rose-50 text-rose-800 border-rose-300";
      default:
        return "bg-stone-100 text-stone-700 border-stone-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900">
      <Navigation
        onOpenInquiry={() => {
          setInquiryProjectId(undefined);
          setInquiryUnitId(undefined);
          setInquiryUnitNumber(undefined);
          setIsInquiryModalOpen(true);
        }}
      />

      {/* Header Section */}
      <section className="pt-36 pb-16 px-5 md:px-10 border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-[1680px]">
          <div ref={pageTitleRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div data-page-title-animate className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-[#9b7c52] mb-3">
                <Sparkles className="h-3 w-3" />
                <span>{t("unitsPage.tag")}</span>
              </div>
              <h1 data-page-title-animate className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight uppercase text-stone-950">
                {t("unitsPage.title")}
              </h1>
              <p data-page-title-animate className="mt-4 font-mono text-xs md:text-sm text-stone-600 max-w-2xl leading-relaxed">
                {t("unitsPage.sub")}
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-3 py-1 bg-stone-100 border border-stone-200 text-stone-800 font-semibold">
                {filteredUnits.length} {t("unitsPage.count")}
              </span>
              <button
                type="button"
                onClick={fetchData}
                className="p-2 border border-stone-200 bg-white hover:bg-stone-100 transition-colors text-stone-700"
                title="Refresh units"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Advanced Multifaceted Filter Bar */}
          <div className="mt-10">
            <UnitsFilterBar
              criteria={criteria}
              onChange={setCriteria}
              onReset={() => setCriteria(initialCriteria)}
              projects={projects}
              availableCities={availableCities}
              availableAreas={availableAreas}
              totalUnitsCount={units.length}
              filteredCount={filteredUnits.length}
            />
          </div>
        </div>
      </section>

      {/* Units Grid */}
      <section className="py-16 px-5 md:px-10">
        <div className="mx-auto max-w-[1680px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-stone-200 h-80 animate-pulse p-6 flex flex-col justify-between shadow-sm"
                >
                  <div className="h-6 bg-stone-200 w-1/3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-100 w-2/3" />
                    <div className="h-4 bg-stone-100 w-1/2" />
                  </div>
                  <div className="h-10 bg-stone-100 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-stone-300 bg-white p-12 max-w-xl mx-auto space-y-4 shadow-sm">
              <KeyRound className="h-12 w-12 text-stone-400 mx-auto" />
              <h3 className="text-xl font-medium text-stone-900">{t("unitsPage.noMatchTitle")}</h3>
              <p className="font-mono text-xs text-stone-500 leading-relaxed">
                {t("unitsPage.noMatchDesc")}
              </p>
              <button
                type="button"
                onClick={() => setCriteria(initialCriteria)}
                className="mt-4 px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors"
              >
                {t("unitsPage.showAll")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUnits.map((unit) => {
                const projectName =
                  typeof unit.projectId === "object"
                    ? getLocalized(unit.projectId?.name?.en, unit.projectId?.name?.ar) || (language === "ar" ? "مشروع سكني متميز" : "Development Residence")
                    : (language === "ar" ? "مشروع سكني متميز" : "Development Residence");

                const projectCity =
                  typeof unit.projectId === "object" && (unit.projectId as any)?.location?.city
                    ? (unit.projectId as any).location.city
                    : (language === "ar" ? "موقع استراتيجي" : "Prime Location");

                const unitImg =
                  unit.images && unit.images.length > 0
                    ? unit.images[0]
                    : typeof unit.projectId === "object" && (unit.projectId as any)?.coverImage
                    ? (unit.projectId as any).coverImage
                    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

                return (
                  <div
                    key={unit._id}
                    className="group bg-white border border-stone-200/90 hover:border-[#c5a880] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl"
                  >
                    <div>
                      {/* Unit Showcase Image Frame */}
                      <Link
                        href={`/units/${unit._id}`}
                        className="block relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden"
                      >
                        <img
                          src={unitImg}
                          alt={unit.unitNumber}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Top Badges */}
                        <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 text-white font-mono text-[0.62rem] font-bold tracking-wider border border-white/10">
                          {unit.unitNumber}
                        </span>

                        <span
                          className={`absolute top-3 right-3 font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 border backdrop-blur-md ${getStatusBadge(
                            unit.status
                          )}`}
                        >
                          {localizeStatus(unit.status)}
                        </span>

                        {/* Bottom Overlay Specs */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white font-mono text-[0.68rem]">
                          <span className="bg-black/60 px-2 py-0.5 backdrop-blur-xs font-semibold">{unit.area} m²</span>
                          <span className="text-[#c5a880] bg-black/60 px-2 py-0.5 backdrop-blur-xs font-semibold">{localizeUnitType(unit.type)}</span>
                        </div>
                      </Link>

                      {/* Header Specs Info */}
                      <div className="p-5 border-b border-stone-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <Link
                            href={`/units/${unit._id}`}
                            className="font-mono text-base font-bold text-stone-900 tracking-wider hover:text-[#9b7c52] transition-colors"
                          >
                            {language === "ar" ? `وحدة ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                          </Link>

                          <span className="text-stone-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#9b7c52]" />
                            {localizeCity(projectCity)}
                          </span>
                        </div>

                        <p className="font-mono text-xs text-stone-600 line-clamp-1">
                          {projectName}
                        </p>
                      </div>

                      {/* Specs Row */}
                      <div className="p-5 grid grid-cols-3 gap-2 text-center border-b border-stone-100 font-mono">
                        <div className="p-2 bg-stone-50 border border-stone-200">
                          <span className="text-[0.6rem] text-stone-500 uppercase block">{t("unitsPage.area")}</span>
                          <span className="text-xs font-semibold text-stone-900">{unit.area} {language === "ar" ? "م²" : "m²"}</span>
                        </div>

                        <div className="p-2 bg-stone-50 border border-stone-200">
                          <span className="text-[0.6rem] text-stone-500 uppercase block">{t("unitsPage.beds")}</span>
                          <span className="text-xs font-semibold text-stone-900">
                            {unit.bedrooms > 0 ? `${unit.bedrooms} ${language === "ar" ? "غرف" : "BR"}` : t("unitsPage.studio")}
                          </span>
                        </div>

                        <div className="p-2 bg-stone-50 border border-stone-200">
                          <span className="text-[0.6rem] text-stone-500 uppercase block">{t("unitsPage.floor")}</span>
                          <span className="text-xs font-semibold text-stone-900">
                            {unit.floor !== undefined ? `${language === "ar" ? "الدور " : "Fl. "}${unit.floor}` : t("unitsPage.ground")}
                          </span>
                        </div>
                      </div>

                      {/* Finishing & View Row */}
                      {(unit.finishing || unit.view) && (
                        <div className="px-5 py-2.5 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between font-mono text-[0.65rem] text-stone-600">
                          {unit.finishing ? (
                            <span className="flex items-center gap-1">
                              <Paintbrush className="h-3 w-3 text-[#9b7c52]" />
                              <span>{localizeFinishing(unit.finishing)}</span>
                            </span>
                          ) : <span />}
                          {unit.view ? (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-[#9b7c52]" />
                              <span>{localizeView(unit.view)}</span>
                            </span>
                          ) : null}
                        </div>
                      )}

                      {/* Features Preview */}
                      {unit.features && unit.features.length > 0 && (
                        <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-stone-100">
                          {unit.features.slice(0, 2).map((f) => (
                            <span
                              key={f}
                              className="font-mono text-[0.6rem] px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price Section */}
                      <div className="p-5 flex items-baseline justify-between">
                        <div>
                          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-stone-400 block">
                            {t("unitsPage.contractPrice")}
                          </span>
                          <div className="text-xl font-bold font-mono text-stone-950 mt-0.5">
                            {formatPrice(unit.price)}
                          </div>
                        </div>

                        {unit.monthlyInstallment && (
                          <div className={isRTL ? "text-left" : "text-right"}>
                            <span className="font-mono text-[0.58rem] text-stone-400 block uppercase">
                              {language === "ar" ? "قسط شهري" : "Monthly"}
                            </span>
                            <span className="text-xs font-semibold font-mono text-[#9b7c52]">
                              {formatPrice(unit.monthlyInstallment)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-2">
                      <Link
                        href={`/units/${unit._id}`}
                        className="flex-1 py-2 px-3 border border-stone-300 hover:border-[#9b7c52] bg-white text-stone-800 hover:text-[#9b7c52] font-mono text-[0.68rem] uppercase tracking-wider transition-colors text-center font-semibold"
                      >
                        {language === "ar" ? "تفاصيل الوحدة" : "View Details"}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenReservation(unit)}
                        className="flex-1 py-2 px-3 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-[0.68rem] uppercase tracking-wider font-semibold transition-colors cursor-pointer text-center"
                      >
                        {t("unitsPage.reserve")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Unit Specs Modal Drawer */}
      {detailUnit && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDetailUnit(null)}
        >
          <div
            className="w-full max-w-lg bg-white text-stone-900 border border-stone-200 p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                  {t("unitsPage.unitModal.title")}
                </span>
                <h2 className="text-2xl font-semibold text-stone-950 mt-1">
                  {t("unitsPage.unitModal.unit")} {detailUnit.unitNumber}
                </h2>
                <p className="font-mono text-xs text-stone-500">
                  {localizeUnitType(detailUnit.type)} • {detailUnit.area} {language === "ar" ? "م²" : "m²"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailUnit(null)}
                className="text-stone-400 hover:text-stone-900 font-mono text-xs uppercase p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
              <div className="p-3 bg-stone-50 border border-stone-200">
                <span className="text-[0.62rem] text-stone-500 uppercase block">{t("unitsPage.unitModal.totalArea")}</span>
                <span className="font-semibold text-stone-900">{detailUnit.area} {language === "ar" ? "م²" : "m²"}</span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200">
                <span className="text-[0.62rem] text-stone-500 uppercase block">{t("unitsPage.unitModal.bedrooms")}</span>
                <span className="font-semibold text-stone-900">{detailUnit.bedrooms}</span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200">
                <span className="text-[0.62rem] text-stone-500 uppercase block">{t("unitsPage.unitModal.bathrooms")}</span>
                <span className="font-semibold text-stone-900">{detailUnit.bathrooms}</span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200">
                <span className="text-[0.62rem] text-stone-500 uppercase block">{t("unitsPage.unitModal.floor")}</span>
                <span className="font-semibold text-stone-900">
                  {detailUnit.floor !== undefined ? `${language === "ar" ? "الدور " : "Fl. "}${detailUnit.floor}` : t("unitsPage.ground")}
                </span>
              </div>
            </div>

            {/* Finishing & View in Modal */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500">{language === "ar" ? "التشطيب" : "Finishing"}</span>
                <strong className="text-stone-900">{localizeFinishing(detailUnit.finishing)}</strong>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500">{language === "ar" ? "الإطلالة" : "View"}</span>
                <strong className="text-stone-900">{localizeView(detailUnit.view)}</strong>
              </div>
            </div>

            {/* Features */}
            {detailUnit.features && detailUnit.features.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase text-[#9b7c52] tracking-wider font-semibold">
                  {t("unitsPage.unitModal.features")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detailUnit.features.map((f) => (
                    <span
                      key={f}
                      className="px-2.5 py-1 bg-stone-50 border border-stone-200 font-mono text-xs text-stone-800"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Banner */}
            <div className="p-4 bg-stone-50 border border-stone-200 flex items-center justify-between font-mono">
              <div>
                <span className="text-[0.62rem] uppercase tracking-wider text-stone-400 block">
                  {t("unitsPage.unitModal.contractPrice")}
                </span>
                <span className="text-xl font-bold text-stone-950">
                  {formatPrice(detailUnit.price)}
                </span>
                {detailUnit.monthlyInstallment && (
                  <span className="text-xs text-[#9b7c52] block mt-0.5">
                    {language === "ar" ? "قسط شهري:" : "Monthly:"} {formatPrice(detailUnit.monthlyInstallment)}
                  </span>
                )}
              </div>
              <span
                className={`text-[0.68rem] px-2.5 py-1 border uppercase font-medium ${getStatusBadge(
                  detailUnit.status
                )}`}
              >
                {localizeStatus(detailUnit.status)}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 font-mono text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setDetailUnit(null)}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-900"
              >
                {t("unitsPage.unitModal.close")}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetUnit = detailUnit;
                  setDetailUnit(null);
                  handleOpenReservation(targetUnit);
                }}
                className="px-6 py-2.5 bg-[#111110] text-white font-semibold hover:bg-[#c5a880] hover:text-[#111110] transition-colors flex items-center gap-1.5"
              >
                <span>{t("unitsPage.unitModal.reserveThis")}</span>
                {isRTL ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Dialog */}
      <PublicInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
          setInquiryProjectId(undefined);
          setInquiryUnitId(undefined);
          setInquiryUnitNumber(undefined);
        }}
        preselectedProjectId={inquiryProjectId}
        preselectedUnitId={inquiryUnitId}
        preselectedUnitNumber={inquiryUnitNumber}
      />
    </div>
  );
}

export default function PublicUnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center font-mono text-xs text-stone-500">
          جاري تحميل الوحدات... / Loading units...
        </div>
      }
    >
      <UnitsContent />
    </Suspense>
  );
}
