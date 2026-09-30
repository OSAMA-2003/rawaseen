"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  KeyRound,
  Building2,
  Check,
  Plus,
  Trash2,
  Calculator,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../../lib/api";
import { IUnit, UnitStatus, UnitType, UnitFinishing, UnitView } from "../../types/unit";
import { IProject } from "../../types/project";
import { STATIC_PROJECTS } from "@/data/staticData";
import { ImageUploadZone } from "../common/ImageUploadZone";

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnitCreated: (unit: IUnit) => void;
  preselectedProjectId?: string;
  initialUnit?: IUnit | null;
}

const FLOOR_PLAN_PRESETS = [
  {
    name: "Architectural 3-Bed Layout",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Penthouse Panoramic Duplex",
    url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Modern Villa Ground Blueprint",
    url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  },
];

const UNIT_PHOTO_PRESETS = [
  {
    name: "Luxury Living Room",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Master Suite",
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Designer Kitchen",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
];

const AVAILABLE_UNIT_TYPES: { id: UnitType; en: string; ar: string }[] = [
  { id: "APARTMENT", en: "Apartment", ar: "شقة فاخرة" },
  { id: "VILLA", en: "Stand-alone Villa", ar: "فيلا مستقلة" },
  { id: "TOWNHOUSE", en: "Townhouse", ar: "تاون هاوس" },
  { id: "TWIN_HOUSE", en: "Twin House", ar: "توين هاوس" },
  { id: "DUPLEX", en: "Duplex", ar: "دوبلكس" },
  { id: "PENTHOUSE", en: "Penthouse", ar: "بنتهاوس" },
  { id: "CHALET", en: "Chalet", ar: "شاليه" },
  { id: "COMMERCIAL", en: "Commercial", ar: "محل تجاري" },
  { id: "OFFICE", en: "Administrative Office", ar: "مكتب إداري" },
  { id: "LAND", en: "Plot / Land", ar: "قطعة أرض" },
];

const FINISHING_OPTIONS: { id: UnitFinishing; en: string; ar: string }[] = [
  { id: "FULLY_FINISHED", en: "Fully Finished", ar: "تشطيب كامل فاخر (Turnkey)" },
  { id: "SEMI_FINISHED", en: "Semi-Finished", ar: "نصف تشطيب (محارة وحلوق)" },
  { id: "CORE_AND_SHELL", en: "Core & Shell", ar: "على العظم (طوب أحمر)" },
];

const VIEW_OPTIONS: { id: UnitView; en: string; ar: string }[] = [
  { id: "GARDEN", en: "Private Garden / Landscape", ar: "إطلالة حديقة / لاندسكيب" },
  { id: "POOL", en: "Infinity Pool / Lagoon", ar: "إطلالة مسبح / بحيرة" },
  { id: "SEA", en: "Sea / Water Feature", ar: "إطلالة بحر / واجهة مائية" },
  { id: "STREET", en: "Boulevard / Main Avenue", ar: "شارع رئيسي / بوليفارد" },
  { id: "COMPOUND", en: "Panoramic Open View", ar: "فيو مفتوح / كمبوند" },
];

const UNIT_FEATURES_POOL = [
  "Smart Home Automation",
  "Private Terrace",
  "Balcony View",
  "Central AC",
  "Double Height Ceilings",
  "Dressing Room",
  "Storage Room",
  "Covered Parking Slot",
  "Panoramic Windows",
  "Private Elevator Access",
];

export function CreateUnitModal({
  isOpen,
  onClose,
  onUnitCreated,
  preselectedProjectId,
  initialUnit,
}: CreateUnitModalProps) {
  const isEdit = Boolean(initialUnit);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [projectId, setProjectId] = useState(preselectedProjectId || "");
  const [unitNumber, setUnitNumber] = useState("");
  const [type, setType] = useState<UnitType>("APARTMENT");
  const [floor, setFloor] = useState("1");
  const [area, setArea] = useState("165");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");

  // Pricing & Financials
  const [price, setPrice] = useState("4500000");
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("10");
  const [downPayment, setDownPayment] = useState("450000");
  const [installmentYears, setInstallmentYears] = useState("5");
  const [monthlyInstallment, setMonthlyInstallment] = useState("67500");

  // Finishing, View, Status
  const [finishing, setFinishing] = useState<UnitFinishing>("FULLY_FINISHED");
  const [view, setView] = useState<UnitView>("GARDEN");
  const [status, setStatus] = useState<UnitStatus>("AVAILABLE");

  // Media & Features
  const [floorPlan, setFloorPlan] = useState(FLOOR_PLAN_PRESETS[0].url);
  const [customFloorPlan, setCustomFloorPlan] = useState("");
  const [unitImage, setUnitImage] = useState(UNIT_PHOTO_PRESETS[0].url);
  const [customUnitImage, setCustomUnitImage] = useState("");

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Smart Home Automation",
    "Balcony View",
    "Central AC",
  ]);

  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Projects on Open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingProjects(true);
      api
        .get<IProject[]>("/projects?limit=100")
        .then((res) => {
          const list = res.data && res.data.length > 0 ? res.data : STATIC_PROJECTS;
          setProjects(list);
          if (!projectId) {
            setProjectId(preselectedProjectId || list[0]._id);
          }
        })
        .catch((err) => {
          console.warn("Could not load projects for unit creation, using fallback:", err);
          setProjects(STATIC_PROJECTS);
          if (!projectId) {
            setProjectId(preselectedProjectId || STATIC_PROJECTS[0]._id);
          }
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    }
  }, [isOpen, preselectedProjectId]);

  // Pre-fill on initialUnit change
  useEffect(() => {
    if (initialUnit) {
      const pId =
        typeof initialUnit.projectId === "string"
          ? initialUnit.projectId
          : initialUnit.projectId?._id || "";
      setProjectId(pId);
      setUnitNumber(initialUnit.unitNumber || "");
      setType(initialUnit.type || "APARTMENT");
      setFloor(initialUnit.floor !== undefined ? initialUnit.floor.toString() : "1");
      setArea(initialUnit.area ? initialUnit.area.toString() : "165");
      setBedrooms(initialUnit.bedrooms !== undefined ? initialUnit.bedrooms.toString() : "3");
      setBathrooms(initialUnit.bathrooms !== undefined ? initialUnit.bathrooms.toString() : "2");
      setPrice(initialUnit.price ? initialUnit.price.toString() : "4500000");

      const downPct = initialUnit.downPaymentPercentage ?? 10;
      setDownPaymentPercentage(downPct.toString());
      setDownPayment(
        initialUnit.downPayment
          ? initialUnit.downPayment.toString()
          : Math.round((initialUnit.price * downPct) / 100).toString()
      );

      const years = initialUnit.installmentYears ?? 5;
      setInstallmentYears(years.toString());
      setMonthlyInstallment(
        initialUnit.monthlyInstallment
          ? initialUnit.monthlyInstallment.toString()
          : ""
      );

      setFinishing((initialUnit.finishing as UnitFinishing) || "FULLY_FINISHED");
      setView((initialUnit.view as UnitView) || "GARDEN");
      setStatus(initialUnit.status || "AVAILABLE");

      if (initialUnit.floorPlanUrl) {
        setFloorPlan(initialUnit.floorPlanUrl);
      }
      if (initialUnit.images && initialUnit.images.length > 0) {
        setUnitImage(initialUnit.images[0]);
      }
      setSelectedFeatures(
        initialUnit.features && initialUnit.features.length > 0
          ? initialUnit.features
          : ["Smart Home Automation", "Balcony View"]
      );
    } else {
      // Reset form
      setUnitNumber("");
      setType("APARTMENT");
      setFloor("1");
      setArea("165");
      setBedrooms("3");
      setBathrooms("2");
      setPrice("4500000");
      setDownPaymentPercentage("10");
      setDownPayment("450000");
      setInstallmentYears("5");
      setMonthlyInstallment("67500");
      setFinishing("FULLY_FINISHED");
      setView("GARDEN");
      setStatus("AVAILABLE");
      setFloorPlan(FLOOR_PLAN_PRESETS[0].url);
      setCustomFloorPlan("");
      setUnitImage(UNIT_PHOTO_PRESETS[0].url);
      setCustomUnitImage("");
      setSelectedFeatures(["Smart Home Automation", "Balcony View", "Central AC"]);
    }
  }, [initialUnit, isOpen]);

  // Recalculate financial breakdown when price or down payment percentage or years change
  const handlePriceChange = (newPriceStr: string) => {
    setPrice(newPriceStr);
    const p = parseFloat(newPriceStr);
    const pct = parseFloat(downPaymentPercentage);
    const y = parseInt(installmentYears, 10);
    if (!isNaN(p) && p > 0 && !isNaN(pct)) {
      const dp = Math.round((p * pct) / 100);
      setDownPayment(dp.toString());
      if (y > 0) {
        const remaining = p - dp;
        const mi = Math.round(remaining / (y * 12));
        setMonthlyInstallment(mi.toString());
      }
    }
  };

  const handleDownPaymentPctChange = (newPctStr: string) => {
    setDownPaymentPercentage(newPctStr);
    const p = parseFloat(price);
    const pct = parseFloat(newPctStr);
    const y = parseInt(installmentYears, 10);
    if (!isNaN(p) && p > 0 && !isNaN(pct)) {
      const dp = Math.round((p * pct) / 100);
      setDownPayment(dp.toString());
      if (y > 0) {
        const remaining = p - dp;
        const mi = Math.round(remaining / (y * 12));
        setMonthlyInstallment(mi.toString());
      }
    }
  };

  const handleInstallmentYearsChange = (newYearsStr: string) => {
    setInstallmentYears(newYearsStr);
    const p = parseFloat(price);
    const dp = parseFloat(downPayment);
    const y = parseInt(newYearsStr, 10);
    if (!isNaN(p) && !isNaN(dp) && y > 0) {
      const remaining = Math.max(0, p - dp);
      const mi = Math.round(remaining / (y * 12));
      setMonthlyInstallment(mi.toString());
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !unitNumber.trim() || !price || !area) {
      toast.error("Please fill in all required unit specifications");
      return;
    }

    const priceNum = parseFloat(price);
    const areaNum = parseFloat(area);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(areaNum) || areaNum <= 0) {
      toast.error("Price and Area must be positive numbers");
      return;
    }

    const finalFloorPlan = floorPlan.trim() || FLOOR_PLAN_PRESETS[0].url;
    const finalPhoto = unitImage.trim() || UNIT_PHOTO_PRESETS[0].url;

    const payload: any = {
      projectId,
      unitNumber: unitNumber.trim(),
      type,
      floor: parseInt(floor, 10) || 0,
      area: areaNum,
      bedrooms: parseInt(bedrooms, 10) || 0,
      bathrooms: parseInt(bathrooms, 10) || 1,
      price: priceNum,
      downPayment: downPayment ? parseFloat(downPayment) : undefined,
      downPaymentPercentage: downPaymentPercentage ? parseFloat(downPaymentPercentage) : undefined,
      installmentYears: installmentYears ? parseInt(installmentYears, 10) : undefined,
      monthlyInstallment: monthlyInstallment ? parseFloat(monthlyInstallment) : undefined,
      finishing,
      view,
      status,
      floorPlan: finalFloorPlan,
      floorPlanUrl: finalFloorPlan,
      images: [finalPhoto],
      features: selectedFeatures,
    };

    setIsSubmitting(true);
    try {
      let savedUnit: IUnit;
      if (isEdit && initialUnit) {
        const res = await api.patch<IUnit>(`/units/${initialUnit._id}`, payload);
        savedUnit = res.data;
        toast.success(`Unit '${savedUnit.unitNumber}' updated successfully`);
      } else {
        const res = await api.post<IUnit>("/units", payload);
        savedUnit = res.data;
        toast.success(`Unit '${savedUnit.unitNumber}' registered in inventory`);
      }

      onUnitCreated(savedUnit);
      onClose();
    } catch (err: any) {
      console.error("Save unit error:", err);
      toast.error(err.message || "Failed to save unit. Check input data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0d1312]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white text-stone-900 border border-stone-200 shadow-2xl relative my-auto max-h-[92vh] flex flex-col rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-[#fbf9f6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#182220] flex items-center justify-center text-[#c5a880] shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#9b7c52] font-semibold">
                  Unit Inventory Management
                </span>
                <span className="text-[0.65rem] px-2 py-0.5 bg-stone-200 text-stone-700 font-mono uppercase">
                  {isEdit ? "Edit Specifications" : "New Inventory Unit"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-normal text-stone-950">
                {isEdit ? `Edit Unit: ${initialUnit?.unitNumber}` : "Register New Property Unit"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* SECTION 1: Parent Project & Unit ID */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Building2 className="h-3.5 w-3.5" />
              <span>Project Association & Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Selector */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Parent Architectural Development <span className="text-red-500">*</span>
                </label>
                {isLoadingProjects ? (
                  <div className="py-2.5 text-xs font-mono text-stone-400">Loading projects...</div>
                ) : (
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white font-medium"
                  >
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name.en} ({p.name.ar}) — {p.location.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unit Code */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Unit Number / Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 304, Villa 12, Duplex 2B"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Unit Type & Inventory Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Property Classification
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as UnitType)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                >
                  {AVAILABLE_UNIT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.en} ({t.ar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Inventory Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UnitStatus)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-medium"
                >
                  <option value="AVAILABLE">Available (متاح للبيع الفوري)</option>
                  <option value="RESERVED">Reserved (محجوز مؤقتاً)</option>
                  <option value="SOLD">Sold (تم البيع والتعاقد)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Dimensions & Spaces */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Space Dimensions & Room Layout</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Total Area (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  step="0.5"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Floor Level
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Finishing & Scenic View */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Compass className="h-3.5 w-3.5" />
              <span>Finishing Level & Scenic View</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Finishing Specification
                </label>
                <select
                  value={finishing}
                  onChange={(e) => setFinishing(e.target.value as UnitFinishing)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                >
                  {FINISHING_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.en} ({f.ar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Panoramic Scenic View
                </label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value as UnitView)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                >
                  {VIEW_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.en} ({v.ar})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Financial Terms & Smart Installment Calculator */}
          <div className="space-y-4 p-4 bg-[#fbf9f6] border border-[#e2d9cc]">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
                <Calculator className="h-4 w-4" />
                <span>Financial Terms & Payment Schedule</span>
              </div>
              <span className="font-mono text-[0.65rem] text-stone-500">
                Auto-calculated terms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-800 font-bold block">
                  Total Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="25000"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-xs font-mono font-bold text-stone-950 focus:outline-none focus:border-[#9b7c52]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="font-mono text-[0.65rem] uppercase text-stone-600 block">
                    Down Payment %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={downPaymentPercentage}
                    onChange={(e) => handleDownPaymentPctChange(e.target.value)}
                    className="w-full bg-white border border-stone-300 px-2.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[0.65rem] uppercase text-stone-600 block">
                    Down Payment Cash
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    className="w-full bg-white border border-stone-300 px-2.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Installment Period (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={installmentYears}
                  onChange={(e) => handleInstallmentYearsChange(e.target.value)}
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Estimated Monthly Installment
                </label>
                <input
                  type="number"
                  min="0"
                  value={monthlyInstallment}
                  onChange={(e) => setMonthlyInstallment(e.target.value)}
                  placeholder="Auto-calculated"
                  className="w-full bg-white border border-stone-300 px-3 py-2 text-xs font-mono font-semibold text-[#8c6b3e] focus:outline-none focus:border-[#9b7c52]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Floor Plan & Visual Blueprint */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Floor Plan & Architectural Photos</span>
            </div>

            {/* Floor Plan Upload Zone */}
            <ImageUploadZone
              label="Floor Plan Blueprint (المخطط المعماري الداخلي للوحدة)"
              sublabel="Upload a 2D/3D blueprint layout from your device or select from presets"
              value={floorPlan}
              onChange={setFloorPlan}
              presets={FLOOR_PLAN_PRESETS}
              folder="rawasin/floorplans"
              aspectRatio="video"
            />

            {/* Unit Showcase Image Upload Zone */}
            <ImageUploadZone
              label="Unit Interior & Architectural Photo (صورة المعاينة المعمارية)"
              sublabel="Upload an interior photo or 3D render representing this unit"
              value={unitImage}
              onChange={setUnitImage}
              presets={UNIT_PHOTO_PRESETS}
              folder="rawasin/units"
              aspectRatio="video"
            />
          </div>

          {/* SECTION 6: Unit Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unit Features & High-Spec Highlights ({selectedFeatures.length} selected)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {UNIT_FEATURES_POOL.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#9b7c52] text-white border-[#9b7c52] font-semibold shadow-xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-stone-200 flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <span className="text-stone-500 text-[0.7rem]">
              Fields marked with <span className="text-red-500 font-bold">*</span> are required
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || projects.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#182220] text-[#c5a880] font-semibold hover:bg-[#9b7c52] hover:text-white transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                <KeyRound className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? isEdit
                      ? "Updating..."
                      : "Adding..."
                    : isEdit
                    ? "Save Unit Changes"
                    : "Add to Inventory"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
