"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  Maximize2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  Bed,
  Bath,
  Layers,
  Paintbrush,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
} from "lucide-react";
import { Navigation } from "@/components/nova/Navigation";
import { PublicInquiryModal } from "@/components/public/PublicInquiryModal";
import { api } from "@/lib/api";
import { IProject } from "@/types/project";
import { IUnit, UnitStatus, UnitType, UnitFinishing, UnitView } from "@/types/unit";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  STATIC_PROJECTS,
  STATIC_UNITS,
  getStaticProjectBySlug,
  getStaticUnitsByProjectId,
} from "@/data/staticData";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [project, setProject] = useState<IProject | null>(null);
  const [units, setUnits] = useState<IUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // In-Project Unit Filter State
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>("ALL");
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("ALL");
  const [bathroomsFilter, setBathroomsFilter] = useState<string>("ALL");
  const [finishingFilter, setFinishingFilter] = useState<string>("ALL");
  const [viewFilter, setViewFilter] = useState<string>("ALL");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined);

  // Modals state
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedUnitForInquiry, setSelectedUnitForInquiry] = useState<IUnit | null>(null);

  const {
    t,
    getLocalized,
    formatPrice,
    isRTL,
    language,
    localizeStatus,
    localizeUnitType,
    localizeAmenity,
    localizeCity,
    localizeFinishing,
    localizeView,
  } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Try fetching live data or fallback to rich static data
    api
      .get<IProject>(`/projects/slug/${slug}`)
      .then(async (res) => {
        if (!isMounted) return;
        if (res.data) {
          setProject(res.data);
          try {
            const unitsRes = await api.get<IUnit[]>(`/units?projectId=${res.data._id}`);
            if (isMounted && unitsRes.data && unitsRes.data.length > 0) {
              setUnits(unitsRes.data);
            } else {
              setUnits(getStaticUnitsByProjectId(res.data._id));
            }
          } catch {
            if (isMounted) setUnits(getStaticUnitsByProjectId(res.data._id));
          }
        } else {
          loadFallback();
        }
      })
      .catch(() => {
        if (isMounted) loadFallback();
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const loadFallback = () => {
      const found = getStaticProjectBySlug(slug);
      if (found) {
        setProject(found);
        setUnits(getStaticUnitsByProjectId(found._id));
      } else {
        // If slug not matched exactly, take the first project as demo
        setProject(STATIC_PROJECTS[0]);
        setUnits(getStaticUnitsByProjectId(STATIC_PROJECTS[0]._id));
      }
    };

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Filtered units within this project
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      // Type filter
      if (unitTypeFilter !== "ALL") {
        const uType = (unit.type || "").toUpperCase().replace(/[\s-]/g, "_");
        const target = unitTypeFilter.toUpperCase().replace(/[\s-]/g, "_");
        if (uType !== target) return false;
      }
      // Bedrooms filter
      if (bedroomsFilter !== "ALL") {
        if (bedroomsFilter === "4+") {
          if (unit.bedrooms < 4) return false;
        } else {
          const beds = parseInt(bedroomsFilter, 10);
          if (unit.bedrooms !== beds) return false;
        }
      }
      // Bathrooms filter
      if (bathroomsFilter !== "ALL") {
        if (bathroomsFilter === "3+") {
          if (unit.bathrooms < 3) return false;
        } else {
          const baths = parseInt(bathroomsFilter, 10);
          if (unit.bathrooms !== baths) return false;
        }
      }
      // Finishing filter
      if (finishingFilter !== "ALL") {
        const uFin = (unit.finishing || "").toUpperCase().replace(/[\s-]/g, "_");
        const target = finishingFilter.toUpperCase().replace(/[\s-]/g, "_");
        if (uFin !== target) return false;
      }
      // View filter
      if (viewFilter !== "ALL") {
        const uView = (unit.view || "").toUpperCase().replace(/[\s-]/g, "_");
        const target = viewFilter.toUpperCase().replace(/[\s-]/g, "_");
        if (uView !== target) return false;
      }
      // Max price
      if (typeof maxPriceFilter === "number" && maxPriceFilter > 0) {
        if (unit.price > maxPriceFilter) return false;
      }

      return true;
    });
  }, [units, unitTypeFilter, bedroomsFilter, bathroomsFilter, finishingFilter, viewFilter, maxPriceFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-stone-600">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-[#c5a880] rounded-full animate-spin" />
          <span>{language === "ar" ? "جاري تحميل تفاصيل المشروع..." : "Loading project details..."}</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <Building2 className="h-16 w-16 text-stone-400 mb-4" />
        <h2 className="text-2xl font-normal">
          {language === "ar" ? "المشروع غير متوفر" : "Project Not Found"}
        </h2>
        <p className="font-mono text-xs text-stone-500 mt-2 mb-6">
          {language === "ar" ? "لم نتمكن من العثور على المشروع المطلوب." : "Could not locate the requested project."}
        </p>
        <Link
          href="/projects"
          className="px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold"
        >
          {language === "ar" ? "العودة إلى المشاريع" : "Back to Projects"}
        </Link>
      </div>
    );
  }

  const primaryName = getLocalized(project.name.en, project.name.ar);
  const secondaryName = language === "ar" ? project.name.en : project.name.ar;
  const description = getLocalized(project.description.en, project.description.ar);
  const allImages = project.images && project.images.length > 0 ? project.images : project.gallery && project.gallery.length > 0 ? project.gallery : [project.coverImage];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900">
      <Navigation onOpenInquiry={() => setIsInquiryModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-5 md:px-10 bg-white border-b border-stone-200 overflow-hidden">
        <div className="mx-auto max-w-[1680px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-stone-400 mb-6">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              {language === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-stone-900 transition-colors">
              {language === "ar" ? "المشاريع" : "Projects"}
            </Link>
            <span>/</span>
            <span className="text-[#9b7c52] font-semibold">{primaryName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Column: Title, Details, Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider px-3 py-1 bg-stone-100 border border-stone-300 font-semibold text-stone-800">
                    {localizeStatus(project.status)}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider px-3 py-1 bg-[#c5a880]/15 border border-[#c5a880]/30 font-semibold text-[#8c6b3e]">
                    {project.developer || "Rawasin Real Estate"}
                  </span>
                  {project.deliveryDate && (
                    <span className="font-mono text-[0.62rem] text-stone-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{project.deliveryDate}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-stone-950 uppercase leading-none">
                  {primaryName}
                </h1>
                {secondaryName && (
                  <p className="font-mono text-sm text-stone-500">
                    {secondaryName}
                  </p>
                )}

                <div className="flex items-center gap-2 font-mono text-xs text-stone-600 pt-1">
                  <MapPin className="h-4 w-4 text-[#c5a880]" />
                  <span>
                    {project.location?.address}, {project.location?.area ? `${project.location.area}, ` : ""}{localizeCity(project.location?.city || "")}, {project.location?.governorate}
                  </span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-5 bg-[#faf8f5] border border-[#e8e4dc] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-400 block">
                    {language === "ar" ? "يبدأ السعر من" : "Starting Price"}
                  </span>
                  <span className="text-3xl font-semibold font-mono text-stone-950">
                    {formatPrice(project.startingPrice)}
                  </span>
                  {project.maxPrice && (
                    <span className="font-mono text-xs text-stone-500 block mt-0.5">
                      {language === "ar" ? "يصل حتى" : "Up to"} {formatPrice(project.maxPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="#units"
                    className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 bg-white font-mono text-xs uppercase tracking-wider text-stone-800 transition-colors"
                  >
                    {language === "ar" ? `تصفح الوحدات (${units.length})` : `Available Units (${units.length})`}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitForInquiry(null);
                      setIsInquiryModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
                  >
                    {language === "ar" ? "طلب استفسار / حجز" : "Inquire / Book Now"}
                  </button>
                </div>
              </div>

              {/* Property Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "المساحات" : "Area Range"}
                  </span>
                  <strong className="text-stone-900 text-sm">
                    {project.minArea && project.maxArea ? `${project.minArea}–${project.maxArea} m²` : "Varied"}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "أنواع العقارات" : "Property Types"}
                  </span>
                  <strong className="text-stone-900 text-xs truncate block">
                    {project.projectTypes && project.projectTypes.length > 0
                      ? project.projectTypes.map((pt) => localizeUnitType(pt)).join(", ")
                      : localizeUnitType(project.projectType || "Apartment")}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "إجمالي الوحدات" : "Total Units"}
                  </span>
                  <strong className="text-stone-900 text-sm">
                    {project.totalUnits || project.unitsCount || 45}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "الوحدات المتاحة" : "Available"}
                  </span>
                  <strong className="text-emerald-700 text-sm">
                    {project.availableUnits || 12} {language === "ar" ? "وحدة" : "Units"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Gallery Showcase */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative h-96 w-full overflow-hidden border border-stone-200 shadow-md">
                <img
                  src={allImages[activeImageIndex] || project.coverImage}
                  alt={primaryName}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 text-white font-mono text-xs border border-white/20">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-16 w-20 shrink-0 overflow-hidden border transition-all ${
                        activeImageIndex === idx
                          ? "border-[#9b7c52] ring-2 ring-[#c5a880]/40"
                          : "border-stone-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Description Section */}
      <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-[#faf8f5]">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                  {language === "ar" ? "نظرة عامة على المشروع" : "Project Overview"}
                </span>
                <h2 className="text-3xl font-normal text-stone-950">
                  {language === "ar" ? "رؤية معمارية وتفاصيل متكاملة" : "Architectural Vision & Statement"}
                </h2>
              </div>
              <p className="font-mono text-xs md:text-sm text-stone-700 leading-relaxed max-w-3xl whitespace-pre-line">
                {description}
              </p>

              {/* Master Plan Preview */}
              {project.masterPlan && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-900 font-semibold">
                    <Compass className="h-4 w-4 text-[#9b7c52]" />
                    <span>{language === "ar" ? "المخطط العام (Master Plan)" : "Master Plan Layout"}</span>
                  </div>
                  <div className="relative h-72 md:h-96 w-full border border-stone-300 overflow-hidden bg-stone-100 shadow-sm">
                    <img
                      src={project.masterPlan}
                      alt="Master Plan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                      <span className="font-mono text-xs text-white bg-black/60 px-3 py-1.5 border border-white/20">
                        {language === "ar" ? "مخطط توزيع المباني والمرافق الحيوية" : "Comprehensive site layout and facilities map"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Fact Sheet Card */}
            <div className="lg:col-span-4 bg-white border border-stone-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-mono text-xs uppercase tracking-wider text-stone-900 font-semibold border-b border-stone-100 pb-3">
                {language === "ar" ? "بطاقة معلومات المشروع" : "Project Fact Sheet"}
              </h3>
              <div className="space-y-3 font-mono text-xs divide-y divide-stone-100">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "المطور" : "Developer"}</span>
                  <span className="font-semibold text-stone-900">{project.developer || "Rawasin"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "المدينة" : "City"}</span>
                  <span className="font-semibold text-stone-900">{localizeCity(project.location?.city || "")}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "المنطقة / الحي" : "District"}</span>
                  <span className="font-semibold text-stone-900">{project.location?.area || "Prime Area"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "تاريخ التسليم" : "Delivery"}</span>
                  <span className="font-semibold text-stone-900">{project.deliveryDate || "2026 / 2027"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "الحالة الإنشائية" : "Status"}</span>
                  <span className="font-semibold text-stone-900">{localizeStatus(project.status)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "خيارات السداد" : "Payment"}</span>
                  <span className="font-semibold text-stone-900">{language === "ar" ? "تقسيط حتى 10 سنوات" : "Up to 10 Years"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Showcase */}
      {project.amenities && project.amenities.length > 0 && (
        <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-[1680px] space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                {language === "ar" ? "الخدمات والمرافق" : "Amenities & Facilities"}
              </span>
              <h2 className="text-3xl font-normal text-stone-950">
                {language === "ar" ? "أسلوب حياة متكامل وخدمات فندقية" : "Integrated Living & Community Features"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {project.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="p-4 bg-stone-50 border border-stone-200 hover:border-[#c5a880] transition-colors flex flex-col items-center text-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#9b7c52] group-hover:scale-110 transition-transform shadow-xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-stone-800 font-medium">
                    {localizeAmenity(amenity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment Plans Showcase */}
      {project.paymentPlans && project.paymentPlans.length > 0 && (
        <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-[#faf8f5]">
          <div className="mx-auto max-w-[1680px] space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                {language === "ar" ? "خطط السداد والتمويل" : "Payment Plans & Financing"}
              </span>
              <h2 className="text-3xl font-normal text-stone-950">
                {language === "ar" ? "أنظمة سداد مرنة تناسب تطلعاتك" : "Tailored Installment Schedules"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {project.paymentPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 p-6 space-y-5 hover:border-[#c5a880] transition-colors shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#9b7c52]" />
                      <h4 className="font-mono text-sm font-semibold text-stone-950">{plan.title}</h4>
                    </div>
                    {plan.discountPercentage ? (
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[0.62rem] font-semibold">
                        -{plan.discountPercentage}% {language === "ar" ? "خصم" : "Discount"}
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "نسبة المقدم" : "Down Payment"}</span>
                      <strong className="text-stone-900 text-sm">{plan.downPaymentPercentage}%</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "مدة التقسيط" : "Duration"}</span>
                      <strong className="text-stone-900 text-sm">
                        {plan.installmentYears} {language === "ar" ? "سنوات" : "Years"}
                      </strong>
                    </div>

                    {plan.monthlyInstallment ? (
                      <div className="flex justify-between py-1 border-b border-stone-50">
                        <span className="text-stone-500">{language === "ar" ? "القسط الشهري التقديري" : "Estimated Monthly"}</span>
                        <strong className="text-[#9b7c52] text-sm">{formatPrice(plan.monthlyInstallment)}</strong>
                      </div>
                    ) : null}

                    {plan.description && (
                      <p className="text-stone-600 text-[0.68rem] leading-relaxed pt-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitForInquiry(null);
                      setIsInquiryModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-stone-100 hover:bg-[#111110] hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors text-stone-800"
                  >
                    {language === "ar" ? "اختيار هذه الخطة" : "Select This Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Available Units Inside This Project (with in-project filter) */}
      <section id="units" className="py-20 px-5 md:px-10 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-[1680px] space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                {language === "ar" ? "مخزون الوحدات المتاحة" : "Project Inventory"}
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-stone-950 mt-1">
                {language === "ar" ? "الوحدات السكنية والتجارية بالمشروع" : "Available Units Within Project"}
              </h2>
              <p className="font-mono text-xs text-stone-500 mt-2">
                {language === "ar"
                  ? `يضم هذا المشروع ${units.length} وحدة معمارية. استخدم الفلاتر السريعة أدناه لتصفية الخيارات.`
                  : `Explore ${units.length} distinct architectural units with real-time floor, finishing and pricing specs.`}
              </p>
            </div>

            <span className="font-mono text-xs px-3.5 py-1.5 bg-stone-100 border border-stone-200 text-stone-800 font-semibold self-start md:self-auto">
              {filteredUnits.length} {language === "ar" ? "وحدة مطابقة" : "Units Found"}
            </span>
          </div>

          {/* In-Project Filter Controls */}
          <div className="p-4 bg-[#faf8f5] border border-stone-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Type */}
            <div>
              <label className="font-mono text-[0.6rem] text-stone-400 uppercase block mb-1">
                {language === "ar" ? "النوع" : "Type"}
              </label>
              <select
                value={unitTypeFilter}
                onChange={(e) => setUnitTypeFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 px-2 py-1.5 font-mono text-[0.68rem] text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">{language === "ar" ? "جميع الأنواع" : "All Types"}</option>
                <option value="APARTMENT">{localizeUnitType("APARTMENT")}</option>
                <option value="VILLA">{localizeUnitType("VILLA")}</option>
                <option value="TOWNHOUSE">{localizeUnitType("TOWNHOUSE")}</option>
                <option value="TWIN_HOUSE">{localizeUnitType("TWIN_HOUSE")}</option>
                <option value="DUPLEX">{localizeUnitType("DUPLEX")}</option>
                <option value="PENTHOUSE">{localizeUnitType("PENTHOUSE")}</option>
                <option value="CHALET">{localizeUnitType("CHALET")}</option>
                <option value="COMMERCIAL">{localizeUnitType("COMMERCIAL")}</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="font-mono text-[0.6rem] text-stone-400 uppercase block mb-1">
                {language === "ar" ? "الغرف" : "Bedrooms"}
              </label>
              <select
                value={bedroomsFilter}
                onChange={(e) => setBedroomsFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 px-2 py-1.5 font-mono text-[0.68rem] text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">{language === "ar" ? "الكل" : "All"}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="font-mono text-[0.6rem] text-stone-400 uppercase block mb-1">
                {language === "ar" ? "الحمامات" : "Bathrooms"}
              </label>
              <select
                value={bathroomsFilter}
                onChange={(e) => setBathroomsFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 px-2 py-1.5 font-mono text-[0.68rem] text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">{language === "ar" ? "الكل" : "All"}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>

            {/* Finishing */}
            <div>
              <label className="font-mono text-[0.6rem] text-stone-400 uppercase block mb-1">
                {language === "ar" ? "التشطيب" : "Finishing"}
              </label>
              <select
                value={finishingFilter}
                onChange={(e) => setFinishingFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 px-2 py-1.5 font-mono text-[0.68rem] text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">{language === "ar" ? "الكل" : "All"}</option>
                <option value="CORE_AND_SHELL">{localizeFinishing("CORE_AND_SHELL")}</option>
                <option value="SEMI_FINISHED">{localizeFinishing("SEMI_FINISHED")}</option>
                <option value="FULLY_FINISHED">{localizeFinishing("FULLY_FINISHED")}</option>
              </select>
            </div>

            {/* View */}
            <div>
              <label className="font-mono text-[0.6rem] text-stone-400 uppercase block mb-1">
                {language === "ar" ? "الإطلالة" : "View"}
              </label>
              <select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
                className="w-full bg-white border border-stone-200 px-2 py-1.5 font-mono text-[0.68rem] text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">{language === "ar" ? "جميع الإطلالات" : "All Views"}</option>
                <option value="GARDEN">{localizeView("GARDEN")}</option>
                <option value="POOL">{localizeView("POOL")}</option>
                <option value="STREET">{localizeView("STREET")}</option>
                <option value="SEA">{localizeView("SEA")}</option>
                <option value="COMPOUND">{localizeView("COMPOUND")}</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setUnitTypeFilter("ALL");
                  setBedroomsFilter("ALL");
                  setBathroomsFilter("ALL");
                  setFinishingFilter("ALL");
                  setViewFilter("ALL");
                  setMaxPriceFilter(undefined);
                }}
                className="w-full py-1.5 border border-stone-300 hover:border-stone-900 bg-white font-mono text-[0.68rem] uppercase tracking-wider text-stone-800 transition-colors"
              >
                {language === "ar" ? "تصفير" : "Reset"}
              </button>
            </div>
          </div>

          {/* Units Grid */}
          {filteredUnits.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-stone-300 p-8 space-y-3">
              <KeyRound className="h-10 w-10 text-stone-400 mx-auto" />
              <h4 className="text-lg font-medium text-stone-900">
                {language === "ar" ? "لا توجد وحدات تطابق هذه التصفية" : "No matching units found"}
              </h4>
              <p className="font-mono text-xs text-stone-500">
                {language === "ar" ? "جرب تعديل خيارات الفلترة لعرض الوحدات المتاحة." : "Adjust the filters to see other available units in this project."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnits.map((unit) => {
                const unitImg = unit.images && unit.images.length > 0 ? unit.images[0] : project.coverImage;

                return (
                  <div
                    key={unit._id}
                    className="bg-white border border-stone-200 hover:border-[#c5a880] transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg group"
                  >
                    <div>
                      {/* Unit Image Frame */}
                      <Link
                        href={`/units/${unit._id}`}
                        className="block relative h-48 w-full bg-stone-100 overflow-hidden"
                      >
                        <img
                          src={unitImg}
                          alt={unit.unitNumber}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-white font-mono text-[0.62rem] font-semibold">
                          {unit.unitNumber}
                        </span>

                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 border border-stone-200 font-mono text-[0.62rem] text-stone-800 font-semibold">
                          {localizeUnitType(unit.type)}
                        </span>

                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white font-mono text-[0.68rem]">
                          <span>{unit.area} m²</span>
                          <span>{localizeFinishing(unit.finishing)}</span>
                        </div>
                      </Link>

                      {/* Unit Details */}
                      <div className="p-5 space-y-3 font-mono">
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 border border-stone-200 text-xs text-center">
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">
                              {language === "ar" ? "الغرف" : "Beds"}
                            </span>
                            <span className="font-semibold text-stone-900">{unit.bedrooms}</span>
                          </div>
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">
                              {language === "ar" ? "الحمامات" : "Baths"}
                            </span>
                            <span className="font-semibold text-stone-900">{unit.bathrooms}</span>
                          </div>
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">
                              {language === "ar" ? "الطابق" : "Floor"}
                            </span>
                            <span className="font-semibold text-stone-900">{unit.floor === 0 ? "Ground" : unit.floor}</span>
                          </div>
                        </div>

                        {/* View Tag & Features */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-stone-500 flex items-center gap-1 text-[0.68rem]">
                            <Eye className="h-3 w-3 text-[#9b7c52]" />
                            <span>{localizeView(unit.view)}</span>
                          </span>

                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[0.6rem] font-semibold">
                            {localizeStatus(unit.status)}
                          </span>
                        </div>

                        {/* Price & Installment */}
                        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[0.6rem] uppercase tracking-wider text-stone-400 block">
                              {language === "ar" ? "السعر الإجمالي" : "Total Price"}
                            </span>
                            <span className="text-base font-semibold text-stone-950">
                              {formatPrice(unit.price)}
                            </span>
                          </div>

                          {unit.monthlyInstallment && (
                            <div className="text-right">
                              <span className="text-[0.58rem] text-stone-400 block">
                                {language === "ar" ? "قسط شهري" : "Monthly"}
                              </span>
                              <span className="text-xs font-semibold text-[#9b7c52]">
                                {formatPrice(unit.monthlyInstallment)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unit Actions */}
                    <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-2">
                      <Link
                        href={`/units/${unit._id}`}
                        className="flex-1 py-2 px-3 border border-stone-300 hover:border-[#9b7c52] bg-white text-stone-800 hover:text-[#9b7c52] font-mono text-xs uppercase tracking-wider font-semibold transition-colors text-center"
                      >
                        {language === "ar" ? "تفاصيل الوحدة" : "View Details"}
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnitForInquiry(unit);
                          setIsInquiryModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>{language === "ar" ? "حجز الوحدة" : "Inquire"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Public Client Inquiry Dialog */}
      <PublicInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
          setSelectedUnitForInquiry(null);
        }}
        preselectedProjectId={project._id}
        preselectedUnitId={selectedUnitForInquiry?._id}
        preselectedUnitNumber={selectedUnitForInquiry?.unitNumber}
      />
    </div>
  );
}
