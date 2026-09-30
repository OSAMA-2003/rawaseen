"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  KeyRound,
  MapPin,
  Calendar,
  CreditCard,
  Maximize2,
  Bed,
  Bath,
  Paintbrush,
  Eye,
  Layers,
  Sparkles,
  Phone,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Printer,
  Download,
  Sliders,
  DollarSign,
  Maximize,
  X,
  ExternalLink,
} from "lucide-react";
import { Navigation } from "@/components/nova/Navigation";
import { PublicInquiryModal } from "@/components/public/PublicInquiryModal";
import { api } from "@/lib/api";
import { IUnit, UnitStatus, UnitType, UnitFinishing, UnitView } from "@/types/unit";
import { IProject } from "@/types/project";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  STATIC_PROJECTS,
  STATIC_UNITS,
  getStaticUnitById,
  getStaticProjectById,
  getStaticUnitsByProjectId,
} from "@/data/staticData";

export default function UnitDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [unit, setUnit] = useState<IUnit | null>(null);
  const [project, setProject] = useState<IProject | null>(null);
  const [relatedUnits, setRelatedUnits] = useState<IUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // Interactive Financial Calculator State
  const [customDownPaymentPct, setCustomDownPaymentPct] = useState<number>(10);
  const [customYears, setCustomYears] = useState<number>(5);

  // Inquiry Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedUnitForInquiry, setSelectedUnitForInquiry] = useState<IUnit | null>(null);
  const [copied, setCopied] = useState(false);

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
    localizeAmenity,
  } = useLanguage();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: `Unit ${unit?.unitNumber}`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadUnitData = async () => {
      try {
        const res = await api.get<IUnit>(`/units/${id}`);
        if (!isMounted) return;

        if (res.data) {
          const loadedUnit = res.data;
          setUnit(loadedUnit);
          setCustomDownPaymentPct(loadedUnit.downPaymentPercentage || 10);
          setCustomYears(loadedUnit.installmentYears || 5);

          // Resolve parent project
          const pId =
            typeof loadedUnit.projectId === "object"
              ? loadedUnit.projectId?._id
              : loadedUnit.projectId;

          if (typeof loadedUnit.projectId === "object" && loadedUnit.projectId?.name) {
            setProject(loadedUnit.projectId as unknown as IProject);
          } else if (pId) {
            try {
              const projRes = await api.get<IProject>(`/projects/${pId}`);
              if (isMounted && projRes.data) {
                setProject(projRes.data);
              }
            } catch {
              if (isMounted) setProject(getStaticProjectById(pId) || STATIC_PROJECTS[0]);
            }
          }

          // Fetch related units in the same project
          if (pId) {
            try {
              const relatedRes = await api.get<IUnit[]>(`/units?projectId=${pId}&limit=4`);
              if (isMounted && relatedRes.data && relatedRes.data.length > 0) {
                setRelatedUnits(relatedRes.data.filter((u) => u._id !== loadedUnit._id));
              } else {
                setRelatedUnits(
                  getStaticUnitsByProjectId(pId).filter((u) => u._id !== loadedUnit._id)
                );
              }
            } catch {
              if (isMounted) {
                setRelatedUnits(
                  getStaticUnitsByProjectId(pId).filter((u) => u._id !== loadedUnit._id)
                );
              }
            }
          }
        } else {
          loadFallback();
        }
      } catch (err) {
        console.warn("Could not load unit from server, falling back to static dataset:", err);
        if (isMounted) loadFallback();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const loadFallback = () => {
      const foundUnit =
        getStaticUnitById(id) ||
        STATIC_UNITS.find(
          (u) =>
            u._id === id ||
            u.unitNumber?.toLowerCase() === id?.toLowerCase()
        ) ||
        STATIC_UNITS[0];

      if (foundUnit) {
        setUnit(foundUnit);
        setCustomDownPaymentPct(foundUnit.downPaymentPercentage || 10);
        setCustomYears(foundUnit.installmentYears || 5);

        const pId =
          typeof foundUnit.projectId === "object"
            ? foundUnit.projectId?._id
            : foundUnit.projectId;

        const parentProj =
          getStaticProjectById(pId || "") ||
          STATIC_PROJECTS.find((p) => p._id === pId) ||
          STATIC_PROJECTS[0];

        setProject(parentProj);
        setRelatedUnits(
          getStaticUnitsByProjectId(parentProj._id).filter((u) => u._id !== foundUnit._id)
        );
      }
    };

    loadUnitData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // All showcase images
  const allImages = useMemo(() => {
    if (!unit) return [];
    const list: string[] = [];
    if (unit.images && unit.images.length > 0) {
      list.push(...unit.images);
    }
    if (unit.floorPlan && !list.includes(unit.floorPlan)) {
      list.push(unit.floorPlan);
    }
    if (list.length === 0 && project?.coverImage) {
      list.push(project.coverImage);
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80");
    }
    return list;
  }, [unit, project]);

  // Blueprint layout image
  const blueprintImage = useMemo(() => {
    if (unit?.floorPlan) return unit.floorPlan;
    if (unit?.floorPlanUrl) return unit.floorPlanUrl;
    if (project?.masterPlan) return project.masterPlan;
    return "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80";
  }, [unit, project]);

  // Interactive Financial Calculations
  const calculatedFinancials = useMemo(() => {
    if (!unit) return { downPaymentAmount: 0, remainingAmount: 0, monthlyAmount: 0, quarterlyAmount: 0 };
    const price = unit.price;
    const dpPct = customDownPaymentPct;
    const years = Math.max(1, customYears);

    const downPaymentAmount = Math.round((price * dpPct) / 100);
    const remainingAmount = Math.max(0, price - downPaymentAmount);
    const totalMonths = years * 12;
    const monthlyAmount = Math.round(remainingAmount / totalMonths);
    const quarterlyAmount = Math.round(monthlyAmount * 3);

    return {
      downPaymentAmount,
      remainingAmount,
      monthlyAmount,
      quarterlyAmount,
    };
  }, [unit, customDownPaymentPct, customYears]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-stone-600">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-[#c5a880] rounded-full animate-spin" />
          <span>{language === "ar" ? "جاري تحميل تفاصيل الوحدة..." : "Loading unit details..."}</span>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <KeyRound className="h-16 w-16 text-stone-400 mb-4" />
        <h2 className="text-2xl font-normal">
          {language === "ar" ? "الوحدة غير متوفرة" : "Unit Not Found"}
        </h2>
        <p className="font-mono text-xs text-stone-500 mt-2 mb-6">
          {language === "ar" ? "لم نتمكن من العثور على الوحدة المطلوبة." : "Could not locate the requested unit."}
        </p>
        <Link
          href="/units"
          className="px-6 py-2.5 bg-[#111110] text-white font-mono text-xs uppercase tracking-wider font-semibold"
        >
          {language === "ar" ? "العودة إلى الوحدات" : "Back to Units"}
        </Link>
      </div>
    );
  }

  const projectNameEn = project?.name?.en || (typeof unit.projectId === "object" ? unit.projectId?.name?.en : "Rawasin Development");
  const projectNameAr = project?.name?.ar || (typeof unit.projectId === "object" ? unit.projectId?.name?.ar : "رواسين العقارية");
  const primaryProjectName = language === "ar" ? projectNameAr : projectNameEn;

  const projectCity = project?.location?.city || (typeof unit.projectId === "object" && (unit.projectId as any)?.location?.city) || "New Sohag City";
  const projectArea = project?.location?.area || (typeof unit.projectId === "object" && (unit.projectId as any)?.location?.area) || "";
  const projectAddress = project?.location?.address || "";
  const projectSlug = project?.slug || (typeof unit.projectId === "object" ? unit.projectId?.slug : "");

  return (
    <div className={`min-h-screen bg-[#fcfbf9] text-stone-900 ${isRTL ? "font-arabic" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      <Navigation onOpenInquiry={() => setIsInquiryModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-5 md:px-10 bg-white border-b border-stone-200 overflow-hidden">
        <div className="mx-auto max-w-[1680px]">
          {/* Breadcrumb & Action Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-wider text-stone-400 overflow-x-auto scrollbar-none">
              <Link href="/" className="hover:text-stone-900 transition-colors shrink-0">
                {language === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <Link href="/projects" className="hover:text-stone-900 transition-colors shrink-0">
                {language === "ar" ? "المشاريع" : "Projects"}
              </Link>
              {projectSlug && (
                <>
                  <span>/</span>
                  <Link href={`/projects/${projectSlug}`} className="hover:text-stone-900 transition-colors truncate max-w-[140px] md:max-w-none shrink-0">
                    {primaryProjectName}
                  </Link>
                </>
              )}
              <span>/</span>
              <Link href="/units" className="hover:text-stone-900 transition-colors shrink-0">
                {language === "ar" ? "الوحدات" : "Units"}
              </Link>
              <span>/</span>
              <span className="text-[#9b7c52] font-semibold shrink-0">{unit.unitNumber}</span>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-[0.68rem]">
              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-1.5 border border-stone-200 hover:border-stone-800 bg-white text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share Unit"
              >
                <Share2 className="h-3 w-3 text-[#9b7c52]" />
                <span>{copied ? (language === "ar" ? "تم النسخ!" : "Copied!") : (language === "ar" ? "مشاركة" : "Share")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="px-3 py-1.5 border border-stone-200 hover:border-stone-800 bg-white text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print Unit Spec Sheet"
              >
                <Printer className="h-3 w-3 text-stone-500" />
                <span>{language === "ar" ? "طباعة المواصفات" : "Print Spec"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Column: Title, Details, Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider px-3 py-1 bg-stone-100 border border-stone-300 font-semibold text-stone-800">
                    {localizeStatus(unit.status)}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider px-3 py-1 bg-[#c5a880]/15 border border-[#c5a880]/30 font-semibold text-[#8c6b3e]">
                    {localizeUnitType(unit.type)}
                  </span>
                  {projectSlug && (
                    <Link
                      href={`/projects/${projectSlug}`}
                      className="font-mono text-[0.62rem] text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                    >
                      <Building2 className="h-3 w-3 text-[#9b7c52]" />
                      <span>{primaryProjectName}</span>
                    </Link>
                  )}
                  {unit.floor !== undefined && (
                    <span className="font-mono text-[0.62rem] text-stone-500 flex items-center gap-1">
                      <Layers className="h-3 w-3 text-stone-400" />
                      <span>{unit.floor === 0 ? (language === "ar" ? "الطابق الأرضي" : "Ground Floor") : `${language === "ar" ? "الدور" : "Floor"} ${unit.floor}`}</span>
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-stone-950 uppercase leading-none">
                  {language === "ar" ? `وحدة رقم ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                </h1>

                <p className="font-mono text-sm text-stone-500">
                  {language === "ar"
                    ? `${localizeUnitType(unit.type)} فاخرة بمساحة ${unit.area} م² مع إطلالة ${localizeView(unit.view)} ومستوى تشطيب ${localizeFinishing(unit.finishing)}`
                    : `Exclusive ${unit.area} m² ${localizeUnitType(unit.type).toLowerCase()} with commanding ${localizeView(unit.view).toLowerCase()} view and ${localizeFinishing(unit.finishing).toLowerCase()} specification`}
                </p>

                <div className="flex items-center gap-2 font-mono text-xs text-stone-600 pt-1">
                  <MapPin className="h-4 w-4 text-[#c5a880]" />
                  <span>
                    {localizeCity(projectCity)}{projectArea ? ` • ${projectArea}` : ""}{projectAddress ? ` • ${projectAddress}` : ""}
                  </span>
                </div>
              </div>

              {/* Price Banner (Matching Project Details System Design) */}
              <div className="p-5 bg-[#faf8f5] border border-[#e8e4dc] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-400 block">
                    {language === "ar" ? "سعر الوحدة الإجمالي" : "Total Contract Price"}
                  </span>
                  <span className="text-3xl font-semibold font-mono text-stone-950">
                    {formatPrice(unit.price)}
                  </span>
                  {unit.monthlyInstallment && (
                    <span className="font-mono text-xs text-[#9b7c52] block mt-0.5">
                      {language === "ar" ? "قسط شهري يبدأ من" : "Monthly Installment from"} {formatPrice(unit.monthlyInstallment)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="#blueprint"
                    className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 bg-white font-mono text-xs uppercase tracking-wider text-stone-800 transition-colors"
                  >
                    {language === "ar" ? "المخطط المعماري" : "View Blueprint"}
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitForInquiry(unit);
                      setIsInquiryModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    {language === "ar" ? "طلب استفسار / حجز" : "Inquire / Book Unit"}
                  </button>
                </div>
              </div>

              {/* Property Highlights Grid (4 Boxes Matching Project Details) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "المساحة الصافية" : "Built-up Area"}
                  </span>
                  <strong className="text-stone-900 text-sm">
                    {unit.area} m²
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "الغرف والحمامات" : "Rooms & Baths"}
                  </span>
                  <strong className="text-stone-900 text-xs truncate block">
                    {unit.bedrooms > 0 ? `${unit.bedrooms} ${language === "ar" ? "غرف" : "Beds"}` : (language === "ar" ? "استوديو" : "Studio")} • {unit.bathrooms} {language === "ar" ? "حمام" : "Baths"}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "التشطيب" : "Finishing Spec"}
                  </span>
                  <strong className="text-stone-900 text-xs truncate block">
                    {localizeFinishing(unit.finishing)}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200">
                  <span className="text-[0.62rem] text-stone-400 uppercase block">
                    {language === "ar" ? "الإطلالة" : "Orientation View"}
                  </span>
                  <strong className="text-emerald-700 text-xs truncate block">
                    {localizeView(unit.view)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Gallery Showcase (Matching Project Details) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="relative h-96 w-full overflow-hidden border border-stone-200 shadow-md group">
                <img
                  src={allImages[activeImageIndex] || allImages[0]}
                  alt={unit.unitNumber}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 text-white font-mono text-xs border border-white/20">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreenModalOpen(true)}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition-colors cursor-pointer"
                  title="Fullscreen Zoom"
                >
                  <Maximize className="h-3.5 w-3.5" />
                </button>

                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Previous Image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Next Image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-16 w-20 shrink-0 overflow-hidden border transition-all cursor-pointer ${
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

      {/* Overview & Floor Plan Layout Section (Matching Project Details Section 2) */}
      <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-[#faf8f5]">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                  {language === "ar" ? "نظرة عامة على الوحدة" : "Unit Architectural Overview"}
                </span>
                <h2 className="text-3xl font-normal text-stone-950">
                  {language === "ar" ? "رؤية معمارية وتفاصيل متكاملة" : "Architectural Vision & Statement"}
                </h2>
              </div>

              <p className="font-mono text-xs md:text-sm text-stone-700 leading-relaxed max-w-3xl whitespace-pre-line">
                {unit.description
                  ? typeof unit.description === "object"
                    ? getLocalized(unit.description.en, unit.description.ar)
                    : unit.description
                  : language === "ar"
                  ? `تتميز الوحدة رقم ${unit.unitNumber} بتصميم هندسي ذكي يوفر أقصى درجات الراحة والخصوصية العائلية بمساحة قدرها ${unit.area} م². تضم الوحدة ${unit.bedrooms} غرف نوم فسيحة و ${unit.bathrooms} حمامات بتشطيبات راقية من أرقى الخامات، مع إطلالة بانورامية ساحرة على ${localizeView(unit.view)} ومنافذ تهوية وإضاءة طبيعية مدروسة بعناية فائقة.`
                  : `Unit ${unit.unitNumber} offers a refined spatial layout designed for optimum luxury, comfort and seamless everyday functionality. Spanning ${unit.area} m² of premium residential space, this residence incorporates ${unit.bedrooms} bedrooms, ${unit.bathrooms} bathrooms, elegant ${localizeFinishing(unit.finishing).toLowerCase()} craftsmanship, and floor-to-ceiling windows capturing natural light and tranquil ${localizeView(unit.view).toLowerCase()} vistas.`}
              </p>

              {/* Master Plan / Floor Plan Preview Frame (Matching Project Details Master Plan) */}
              <div id="blueprint" className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-900 font-semibold">
                    <Compass className="h-4 w-4 text-[#9b7c52]" />
                    <span>{language === "ar" ? "المخطط المعماري للوحدة (Floor Plan Layout)" : "Precision Floor Plan Blueprint Layout"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const bpIdx = allImages.findIndex((img) => img === blueprintImage);
                      if (bpIdx !== -1) setActiveImageIndex(bpIdx);
                      setIsFullscreenModalOpen(true);
                    }}
                    className="font-mono text-[0.68rem] text-[#9b7c52] hover:text-stone-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>{language === "ar" ? "تكبير المخطط" : "Enlarge Blueprint"}</span>
                  </button>
                </div>

                <div
                  onClick={() => {
                    const bpIdx = allImages.findIndex((img) => img === blueprintImage);
                    if (bpIdx !== -1) setActiveImageIndex(bpIdx);
                    setIsFullscreenModalOpen(true);
                  }}
                  className="relative h-72 md:h-96 w-full border border-stone-300 overflow-hidden bg-stone-100 shadow-sm group cursor-pointer"
                >
                  <img
                    src={blueprintImage}
                    alt="Floor Plan Blueprint"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-6">
                    <span className="font-mono text-xs text-white bg-black/60 px-3 py-1.5 border border-white/20">
                      {language === "ar"
                        ? `مخطط التوزيع الهندسي للوحدة ${unit.unitNumber} - ${unit.area} م²`
                        : `Architectural CAD layout distribution for Unit ${unit.unitNumber} (${unit.area} m²)`}
                    </span>
                    <span className="hidden sm:flex font-mono text-[0.68rem] text-white bg-black/60 px-2.5 py-1.5 border border-white/20 items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3 w-3" />
                      <span>{language === "ar" ? "تكبير المخطط" : "Enlarge"}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Fact Sheet Card (Matching Project Details Fact Sheet) */}
            <div className="lg:col-span-4 bg-white border border-stone-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-mono text-xs uppercase tracking-wider text-stone-900 font-semibold border-b border-stone-100 pb-3">
                {language === "ar" ? "بطاقة معلومات الوحدة" : "Unit Fact Sheet"}
              </h3>
              <div className="space-y-3 font-mono text-xs divide-y divide-stone-100">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "كود الوحدة" : "Unit Code"}</span>
                  <span className="font-semibold text-stone-900">{unit.unitNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "المشروع الأم" : "Parent Project"}</span>
                  <span className="font-semibold text-stone-900 truncate max-w-[160px]">{primaryProjectName}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "نوع الوحدة" : "Type"}</span>
                  <span className="font-semibold text-stone-900">{localizeUnitType(unit.type)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "المساحة" : "Area"}</span>
                  <span className="font-semibold text-stone-900">{unit.area} m²</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "الغرف / الحمامات" : "Beds / Baths"}</span>
                  <span className="font-semibold text-stone-900">{unit.bedrooms} / {unit.bathrooms}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "الطابق" : "Floor"}</span>
                  <span className="font-semibold text-stone-900">{unit.floor === 0 ? (language === "ar" ? "الأرضي" : "Ground") : unit.floor}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "التشطيب" : "Finishing"}</span>
                  <span className="font-semibold text-[#9b7c52]">{localizeFinishing(unit.finishing)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "الإطلالة" : "View"}</span>
                  <span className="font-semibold text-stone-900">{localizeView(unit.view)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "حالة الوحدة" : "Status"}</span>
                  <span className="font-semibold text-emerald-700">{localizeStatus(unit.status)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-stone-500">{language === "ar" ? "الاستلام" : "Handover"}</span>
                  <span className="font-semibold text-stone-900">{project?.deliveryDate ? String(project.deliveryDate) : "Ready"}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedUnitForInquiry(unit);
                  setIsInquiryModalOpen(true);
                }}
                className="w-full py-2.5 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-xs cursor-pointer mt-2"
              >
                {language === "ar" ? "طلب حجز هذه الوحدة" : "Book This Unit"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Features & Amenities Section (Matching Project Details Amenities) */}
      {unit.features && unit.features.length > 0 && (
        <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-[1680px] space-y-8">
            <div>
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                {language === "ar" ? "المزايا والتجهيزات الفاخرة" : "Unit Amenities & Inclusions"}
              </span>
              <h2 className="text-3xl font-normal text-stone-950 mt-1">
                {language === "ar" ? "تجهيزات ومزايا حصرية مضمنة" : "Exclusive Unit Inclusions & Features"}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {unit.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-stone-200 bg-[#faf8f5] flex items-center gap-2.5 font-mono text-xs text-stone-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#c5a880] shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Payment Plans & Smart Financial Calculator (Matching Project Details Payment Plans) */}
      <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-[#faf8f5]">
        <div className="mx-auto max-w-[1680px] space-y-10">
          <div>
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
              {language === "ar" ? "خطط السداد والأقساط" : "Payment Schedules & Financing"}
            </span>
            <h2 className="text-3xl font-normal text-stone-950 mt-1">
              {language === "ar" ? "خيارات التمويل وجدولة الأقساط" : "Flexible Financing & Installment Calculator"}
            </h2>
            <p className="font-mono text-xs text-stone-500 mt-2">
              {language === "ar"
                ? "اختر الخطة المناسبة أو عدل نسبة المقدم وسنوات السداد لحساب القسط الشهري والربع سنوي فوراً."
                : "Select an established plan or customize down payment and duration to compute exact installments."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Calculator Left Card */}
            <div className="lg:col-span-6 p-6 bg-white border border-stone-200 space-y-6 shadow-sm">
              <h3 className="font-mono text-xs uppercase tracking-wider text-stone-900 font-bold border-b border-stone-100 pb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#9b7c52]" />
                <span>{language === "ar" ? "حاسبة الأقساط التفاعلية" : "Interactive Installment Estimator"}</span>
              </h3>

              {/* Slider for Down Payment */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-stone-600">{language === "ar" ? "نسبة الدفعة المقدمة" : "Down Payment Percentage"}</span>
                  <span className="font-bold text-[#9b7c52]">{customDownPaymentPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={customDownPaymentPct}
                  onChange={(e) => setCustomDownPaymentPct(parseInt(e.target.value, 10))}
                  className="w-full accent-[#9b7c52] cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[0.62rem] text-stone-400">
                  <span>5% (Min)</span>
                  <span>25%</span>
                  <span>50% (Max)</span>
                </div>
              </div>

              {/* Installment Years Selector */}
              <div className="space-y-2">
                <span className="font-mono text-xs text-stone-600 block">
                  {language === "ar" ? "سنوات التقسيط" : "Installment Years"}
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 5, 7, 8, 10].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setCustomYears(y)}
                      className={`py-2 text-xs font-mono border transition-colors cursor-pointer ${
                        customYears === y
                          ? "bg-[#111110] text-white border-[#111110] font-bold"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {y} {language === "ar" ? "سنوات" : "Yrs"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Results */}
              <div className="p-4 bg-[#faf8f5] border border-stone-200 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>{language === "ar" ? "قيمة الوحدة:" : "Total Unit Price:"}</span>
                  <strong className="text-stone-900">{formatPrice(unit.price)}</strong>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>{language === "ar" ? "المقدم المحسوب:" : "Down Payment Amount:"}</span>
                  <strong className="text-[#9b7c52]">{formatPrice(calculatedFinancials.downPaymentAmount)}</strong>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>{language === "ar" ? "المتبقي على أقساط:" : "Remaining Balance:"}</span>
                  <strong className="text-stone-900">{formatPrice(calculatedFinancials.remainingAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Right Standard Plans Cards (Matching Project Details) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Dynamic Estimated Plan Card */}
              <div className="p-6 bg-white border border-[#9b7c52] shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-mono text-sm font-semibold uppercase text-stone-900">
                      {language === "ar" ? `خطة مخصصة (${customDownPaymentPct}% مقدم / ${customYears} سنوات)` : `Custom Plan (${customDownPaymentPct}% DP / ${customYears} Years)`}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {language === "ar" ? "حساب فوري" : "Calculated"}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs pt-3">
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "دفعة الحجز والمقدم" : "Down Payment"}</span>
                      <strong className="text-stone-900 text-sm">
                        {customDownPaymentPct}% ({formatPrice(calculatedFinancials.downPaymentAmount)})
                      </strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "فترة السداد" : "Installment Period"}</span>
                      <strong className="text-stone-900 text-sm">
                        {customYears} {language === "ar" ? "سنوات" : "Years"} ({customYears * 12} {language === "ar" ? "شهر" : "Months"})
                      </strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "القسط الشهري التقديري" : "Estimated Monthly"}</span>
                      <strong className="text-[#9b7c52] text-sm">{formatPrice(calculatedFinancials.monthlyAmount)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="text-stone-500">{language === "ar" ? "القسط الربع سنوي" : "Quarterly Option"}</span>
                      <strong className="text-stone-900 text-sm">{formatPrice(calculatedFinancials.quarterlyAmount)}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnitForInquiry(unit);
                    setIsInquiryModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-[#111110] text-white hover:bg-[#c5a880] hover:text-[#111110] font-mono text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  {language === "ar" ? "اختيار هذه الخطة وحجز الوحدة" : "Select This Plan & Reserve"}
                </button>
              </div>

              {/* Standard Project Plan Card */}
              {project?.paymentPlans && project.paymentPlans.length > 0 && (
                <div className="p-6 bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <h3 className="font-mono text-sm font-semibold uppercase text-stone-900">
                        {project.paymentPlans[0].title}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-200">
                        {language === "ar" ? "خطة المشروع" : "Project Plan"}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs pt-3">
                      <div className="flex justify-between py-1 border-b border-stone-50">
                        <span className="text-stone-500">{language === "ar" ? "دفعة الحجز" : "Down Payment"}</span>
                        <strong className="text-stone-900 text-sm">
                          {project.paymentPlans[0].downPaymentPercentage}% ({formatPrice((unit.price * project.paymentPlans[0].downPaymentPercentage) / 100)})
                        </strong>
                      </div>

                      <div className="flex justify-between py-1 border-b border-stone-50">
                        <span className="text-stone-500">{language === "ar" ? "فترة السداد" : "Installment Period"}</span>
                        <strong className="text-stone-900 text-sm">
                          {project.paymentPlans[0].installmentYears} {language === "ar" ? "سنوات" : "Years"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnitForInquiry(unit);
                      setIsInquiryModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-stone-100 hover:bg-[#111110] hover:text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors text-stone-800 cursor-pointer"
                  >
                    {language === "ar" ? "حجز الوحدة بهذه الخطة" : "Inquire With Project Plan"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Parent Development Banner Section */}
      {project && (
        <section className="py-16 px-5 md:px-10 border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-[1680px]">
            <div className="border border-stone-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm bg-[#faf8f5]">
              <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[300px] overflow-hidden bg-stone-100">
                <img
                  src={project.coverImage || allImages[0]}
                  alt={primaryProjectName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white font-mono">
                  <span className="text-[0.65rem] uppercase tracking-wider text-[#c5a880]">
                    {language === "ar" ? "المشروع الأم" : "Parent Development"}
                  </span>
                  <h3 className="text-2xl font-serif font-normal text-white mt-1">
                    {primaryProjectName}
                  </h3>
                  <span className="text-xs text-stone-300 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#c5a880]" />
                    {localizeCity(projectCity)}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 p-8 md:p-12 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                    {language === "ar" ? "عن مجتمع المشروع" : "About The Master Development"}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif font-normal text-stone-950">
                    {language === "ar" ? "أسلوب حياة متكامل ومرافق استثنائية" : "Comprehensive Community & Amenities"}
                  </h3>
                  <p className="font-mono text-xs md:text-sm text-stone-600 leading-relaxed line-clamp-3">
                    {language === "ar" ? project.description?.ar : project.description?.en}
                  </p>

                  {/* Amenities Preview */}
                  {project.amenities && project.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.amenities.slice(0, 6).map((am, i) => (
                        <span
                          key={i}
                          className="font-mono text-[0.65rem] px-2.5 py-1 bg-white border border-stone-200 text-stone-700"
                        >
                          {localizeAmenity(am)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="font-mono text-xs">
                    <span className="text-stone-400 block text-[0.6rem] uppercase">
                      {language === "ar" ? "يبدأ من" : "Prices Starting From"}
                    </span>
                    <strong className="text-base text-stone-900 font-bold">
                      {formatPrice(project.startingPrice)}
                    </strong>
                  </div>

                  {projectSlug && (
                    <Link
                      href={`/projects/${projectSlug}`}
                      className="px-6 py-2.5 bg-[#111110] text-white hover:bg-[#9b7c52] font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2"
                    >
                      <span>{language === "ar" ? "استعراض المشروع كاملاً" : "Explore Full Project"}</span>
                      <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Alternative Available Units in this Project (Matching Project Details Units Grid) */}
      {relatedUnits.length > 0 && (
        <section className="py-20 px-5 md:px-10 bg-[#faf8f5] border-b border-stone-200">
          <div className="mx-auto max-w-[1680px] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#9b7c52] font-semibold">
                  {language === "ar" ? "خيارات مماثلة" : "Alternative Inventory"}
                </span>
                <h2 className="text-3xl font-serif font-normal text-stone-950 mt-1">
                  {language === "ar" ? "وحدات أخرى متاحة في هذا المشروع" : "More Available Units in This Project"}
                </h2>
              </div>

              <Link
                href="/units"
                className="font-mono text-xs text-[#9b7c52] hover:text-[#111110] font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{language === "ar" ? "عرض جميع الوحدات المعروضة" : "View All Available Inventory"}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedUnits.slice(0, 3).map((rUnit) => {
                const rImg =
                  rUnit.images && rUnit.images.length > 0
                    ? rUnit.images[0]
                    : project?.coverImage || allImages[0];

                return (
                  <div
                    key={rUnit._id}
                    className="bg-white border border-stone-200 hover:border-[#c5a880] transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-lg group"
                  >
                    <div>
                      {/* Image Frame */}
                      <Link href={`/units/${rUnit._id}`} className="block relative h-48 w-full bg-stone-100 overflow-hidden">
                        <img
                          src={rImg}
                          alt={rUnit.unitNumber}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 text-white font-mono text-[0.62rem] font-semibold">
                          {rUnit.unitNumber}
                        </span>
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 border border-stone-200 font-mono text-[0.62rem] text-stone-800 font-semibold">
                          {localizeUnitType(rUnit.type)}
                        </span>
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white font-mono text-[0.68rem]">
                          <span>{rUnit.area} m²</span>
                          <span>{localizeFinishing(rUnit.finishing)}</span>
                        </div>
                      </Link>

                      <div className="p-5 space-y-3 font-mono">
                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 border border-stone-200 text-xs text-center">
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">{language === "ar" ? "الغرف" : "Beds"}</span>
                            <span className="font-semibold text-stone-900">{rUnit.bedrooms}</span>
                          </div>
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">{language === "ar" ? "الحمامات" : "Baths"}</span>
                            <span className="font-semibold text-stone-900">{rUnit.bathrooms}</span>
                          </div>
                          <div>
                            <span className="text-[0.6rem] text-stone-400 block uppercase">{language === "ar" ? "الطابق" : "Floor"}</span>
                            <span className="font-semibold text-stone-900">{rUnit.floor === 0 ? "Ground" : rUnit.floor ?? 1}</span>
                          </div>
                        </div>

                        {/* View Tag & Status */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-stone-500 flex items-center gap-1 text-[0.68rem]">
                            <Eye className="h-3 w-3 text-[#9b7c52]" />
                            <span>{localizeView(rUnit.view)}</span>
                          </span>

                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[0.6rem] font-semibold">
                            {localizeStatus(rUnit.status)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-[0.6rem] uppercase tracking-wider text-stone-400 block">
                              {language === "ar" ? "السعر الإجمالي" : "Total Price"}
                            </span>
                            <span className="text-base font-semibold text-stone-950">
                              {formatPrice(rUnit.price)}
                            </span>
                          </div>

                          {rUnit.monthlyInstallment && (
                            <div className="text-right">
                              <span className="text-[0.58rem] text-stone-400 block">
                                {language === "ar" ? "قسط شهري" : "Monthly"}
                              </span>
                              <span className="text-xs font-semibold text-[#9b7c52]">
                                {formatPrice(rUnit.monthlyInstallment)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center gap-2">
                      <Link
                        href={`/units/${rUnit._id}`}
                        className="flex-1 py-2 px-3 border border-stone-300 hover:border-[#9b7c52] bg-white text-stone-800 hover:text-[#9b7c52] font-mono text-xs uppercase tracking-wider font-semibold transition-colors text-center"
                      >
                        {language === "ar" ? "تفاصيل الوحدة" : "View Details"}
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUnitForInquiry(rUnit);
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
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenModalOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setIsFullscreenModalOpen(false)}
        >
          <div className="flex items-center justify-between text-white font-mono text-xs border-b border-stone-800 pb-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#c5a880] text-sm">{unit.unitNumber}</span>
              <span className="text-stone-400">{localizeUnitType(unit.type)}</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-300">{`Image ${activeImageIndex + 1} of ${allImages.length}`}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenModalOpen(false)}
              className="p-2 bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[activeImageIndex] || allImages[0]}
              alt="Fullscreen Zoom"
              className="max-h-full max-w-full object-contain shadow-2xl border border-stone-800"
            />
          </div>

          <div className="flex justify-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-12 w-16 border overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx ? "border-[#c5a880] scale-105" : "border-stone-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inquiry & Reservation Modal */}
      <PublicInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
          setSelectedUnitForInquiry(null);
        }}
        preselectedProjectId={project?._id || (typeof unit.projectId === "object" ? unit.projectId?._id : undefined)}
        preselectedUnitId={selectedUnitForInquiry?._id || unit._id}
        preselectedUnitNumber={selectedUnitForInquiry?.unitNumber || unit.unitNumber}
      />
    </div>
  );
}
