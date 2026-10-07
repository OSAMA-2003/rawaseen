"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  Maximize2,
  Bed,
  Bath,
  Paintbrush,
  Eye,
  Check,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { IProject } from "@/types/project";

export interface UnitFilterCriteria {
  searchQuery?: string;
  projectId?: string;
  city?: string;
  area?: string;
  unitType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: string;
  bathrooms?: string;
  finishing?: string;
  view?: string;
  availableOnly?: boolean;
  sortBy?: "priceAsc" | "priceDesc" | "areaDesc" | "newest";
}

interface UnitsFilterBarProps {
  criteria: UnitFilterCriteria;
  onChange: (criteria: UnitFilterCriteria) => void;
  onReset: () => void;
  projects: IProject[];
  availableCities: string[];
  availableAreas: string[];
  totalUnitsCount: number;
  filteredCount: number;
}

export function UnitsFilterBar({
  criteria,
  onChange,
  onReset,
  projects,
  availableCities,
  availableAreas,
  totalUnitsCount,
  filteredCount,
}: UnitsFilterBarProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const {
    t,
    getLocalized,
    isRTL,
    language,
    localizeStatus,
    localizeUnitType,
    localizeCity,
    localizeFinishing,
    localizeView,
  } = useLanguage();

  const propertyTypes: { value: string; labelEn: string; labelAr: string }[] = [
    { value: "ALL", labelEn: "All Types", labelAr: "جميع الأنواع" },
    { value: "APARTMENT", labelEn: "Apartment", labelAr: "شقة" },
    { value: "VILLA", labelEn: "Villa", labelAr: "فيلا" },
    { value: "TOWNHOUSE", labelEn: "Townhouse", labelAr: "تاون هاوس" },
    { value: "TWIN_HOUSE", labelEn: "Twin House", labelAr: "توين هاوس" },
    { value: "DUPLEX", labelEn: "Duplex", labelAr: "دوبلكس" },
    { value: "CHALET", labelEn: "Chalet", labelAr: "شاليه" },
    { value: "COMMERCIAL", labelEn: "Commercial", labelAr: "تجاري" },
    { value: "LAND", labelEn: "Land", labelAr: "أرض" },
    { value: "OFFICE", labelEn: "Office", labelAr: "مكتب" },
  ];

  const bedroomOptions = [
    { value: "ALL", label: language === "ar" ? "الكل" : "All" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" },
  ];

  const bathroomOptions = [
    { value: "ALL", label: language === "ar" ? "الكل" : "All" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3+", label: "3+" },
  ];

  const statusOptions = [
    { value: "ALL", labelEn: "All Statuses", labelAr: "جميع الحالات" },
    { value: "AVAILABLE", labelEn: "Available", labelAr: "متاح" },
    { value: "RESERVED", labelEn: "Reserved", labelAr: "محجوز" },
    { value: "SOLD", labelEn: "Sold", labelAr: "مباع" },
  ];

  const finishingOptions = [
    { value: "ALL", labelEn: "All Finishings", labelAr: "جميع التشطيبات" },
    { value: "CORE_AND_SHELL", labelEn: "Core & Shell", labelAr: "محارة وبناء" },
    { value: "SEMI_FINISHED", labelEn: "Semi Finished", labelAr: "نصف تشطيب" },
    { value: "FULLY_FINISHED", labelEn: "Fully Finished", labelAr: "تشطيب كامل" },
  ];

  const viewOptions = [
    { value: "ALL", labelEn: "All Views", labelAr: "جميع الإطلالات" },
    { value: "GARDEN", labelEn: "Garden", labelAr: "حديقة" },
    { value: "POOL", labelEn: "Pool", labelAr: "مسبح" },
    { value: "STREET", labelEn: "Street", labelAr: "شارع" },
    { value: "SEA", labelEn: "Sea", labelAr: "بحر" },
    { value: "COMPOUND", labelEn: "Compound", labelAr: "كمبوند" },
  ];

  // Calculate active filter count excluding defaults
  const activeFiltersCount = [
    criteria.searchQuery,
    criteria.projectId && criteria.projectId !== "ALL",
    criteria.city && criteria.city !== "ALL",
    criteria.area && criteria.area !== "ALL",
    criteria.unitType && criteria.unitType !== "ALL",
    criteria.status && criteria.status !== "ALL" && criteria.status !== "AVAILABLE",
    criteria.minPrice,
    criteria.maxPrice,
    criteria.minArea,
    criteria.maxArea,
    criteria.bedrooms && criteria.bedrooms !== "ALL",
    criteria.bathrooms && criteria.bathrooms !== "ALL",
    criteria.finishing && criteria.finishing !== "ALL",
    criteria.view && criteria.view !== "ALL",
    criteria.availableOnly,
  ].filter(Boolean).length;

  return (
    <div className="bg-white border border-stone-200 shadow-sm transition-all">
      {/* Top Primary Bar */}
      <div className="p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            placeholder={
              language === "ar"
                ? "ابحث رقم الوحدة، اسم المشروع، المدينة..."
                : "Search unit #, project name, city..."
            }
            value={criteria.searchQuery || ""}
            onChange={(e) => onChange({ ...criteria, searchQuery: e.target.value })}
            className={`w-full bg-stone-50 border border-stone-200 px-3.5 py-2.5 ${
              isRTL ? "pr-10 text-right" : "pl-10 text-left"
            } text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white`}
          />
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-3 h-4 w-4 text-stone-400`}
          />
          {criteria.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ ...criteria, searchQuery: "" })}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-3 text-stone-400 hover:text-stone-700`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 font-mono text-[0.68rem] uppercase scrollbar-none">
          <button
            type="button"
            onClick={() => onChange({ ...criteria, city: "ALL" })}
            className={`px-3 py-2 border transition-colors shrink-0 ${
              !criteria.city || criteria.city === "ALL"
                ? "bg-[#111110] text-white border-[#111110] font-semibold"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            }`}
          >
            {language === "ar" ? "جميع المدن" : "All Cities"}
          </button>
          {availableCities.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...criteria, city: c })}
              className={`px-3 py-2 border transition-colors shrink-0 ${
                criteria.city === c
                  ? "bg-[#111110] text-white border-[#111110] font-semibold"
                  : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {localizeCity(c)}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 border font-mono text-xs uppercase tracking-wider transition-colors ${
              isAdvancedOpen || activeFiltersCount > 0
                ? "bg-[#111110] text-white border-[#111110]"
                : "bg-white text-stone-800 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#c5a880]" />
            <span>{language === "ar" ? "فلاتر متقدمة" : "Advanced Filters"}</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#c5a880] text-[#111110] font-bold text-[0.6rem] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {isAdvancedOpen ? (
              <ChevronUp className="h-3.5 w-3.5 ml-1" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            )}
          </button>

          <select
            value={criteria.sortBy || "priceAsc"}
            onChange={(e) =>
              onChange({ ...criteria, sortBy: e.target.value as any })
            }
            className="bg-stone-50 border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880] font-mono uppercase text-[0.68rem]"
          >
            <option value="priceAsc">
              {language === "ar" ? "السعر: الأقل أولاً" : "Price: Low to High"}
            </option>
            <option value="priceDesc">
              {language === "ar" ? "السعر: الأعلى أولاً" : "Price: High to Low"}
            </option>
            <option value="areaDesc">
              {language === "ar" ? "المساحة: الأكبر أولاً" : "Area: Largest First"}
            </option>
          </select>
        </div>
      </div>

      {/* Property Types Quick Selector */}
      <div className="px-4 md:px-5 py-2.5 border-t border-stone-100 bg-[#fbf9f5] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-stone-400 shrink-0 mr-2">
          {language === "ar" ? "نوع الوحدة:" : "Type:"}
        </span>
        {propertyTypes.map((pt) => {
          const isSelected =
            (!criteria.unitType && pt.value === "ALL") ||
            criteria.unitType === pt.value;
          return (
            <button
              key={pt.value}
              type="button"
              onClick={() => onChange({ ...criteria, unitType: pt.value })}
              className={`px-3 py-1 font-mono text-[0.65rem] border transition-colors shrink-0 ${
                isSelected
                  ? "bg-[#111110] text-white border-[#111110] font-semibold"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:text-stone-950"
              }`}
            >
              {language === "ar" ? pt.labelAr : pt.labelEn}
            </button>
          );
        })}
      </div>

      {/* Collapsible Advanced Filters Drawer */}
      {isAdvancedOpen && (
        <div className="p-5 md:p-6 border-t border-stone-200 bg-[#faf8f5] space-y-6 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Project & Status */}
            <div className="space-y-3">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#9b7c52]" />
                <span>{language === "ar" ? "المشروع والحي" : "Project & District"}</span>
              </label>

              {/* Project Dropdown */}
              <select
                value={criteria.projectId || "ALL"}
                onChange={(e) => onChange({ ...criteria, projectId: e.target.value })}
                className="w-full bg-white border border-stone-200 px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#c5a880]"
              >
                <option value="ALL">
                  {language === "ar" ? "جميع المشاريع السكنية" : "All Projects"}
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {getLocalized(p.name.en, p.name.ar)} ({localizeCity(p.location.city)})
                  </option>
                ))}
              </select>

              {/* District Area */}
              {availableAreas.length > 0 && (
                <select
                  value={criteria.area || "ALL"}
                  onChange={(e) => onChange({ ...criteria, area: e.target.value })}
                  className="w-full bg-white border border-stone-200 px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="ALL">
                    {language === "ar" ? "جميع الأحياء والمناطق" : "All Districts / Areas"}
                  </option>
                  {availableAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              )}

              {/* Unit Status */}
              <div>
                <span className="font-mono text-[0.62rem] text-stone-400 block mb-1.5 uppercase">
                  {language === "ar" ? "حالة الوحدة" : "Unit Status"}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map((st) => {
                    const isSelected =
                      (!criteria.status && st.value === "AVAILABLE") ||
                      criteria.status === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => onChange({ ...criteria, status: st.value })}
                        className={`px-2 py-1.5 font-mono text-[0.62rem] border transition-colors text-center ${
                          isSelected
                            ? "bg-[#111110] text-white border-[#111110] font-semibold"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {language === "ar" ? st.labelAr : st.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Price Range & Area Range */}
            <div className="space-y-3">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-[#9b7c52]" />
                <span>{language === "ar" ? "نطاق السعر" : "Price Range"}</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={language === "ar" ? "أقل سعر" : "Min Price"}
                  value={criteria.minPrice || ""}
                  onChange={(e) =>
                    onChange({
                      ...criteria,
                      minPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full bg-white border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880]"
                />
                <input
                  type="number"
                  placeholder={language === "ar" ? "أقصى سعر" : "Max Price"}
                  value={criteria.maxPrice || ""}
                  onChange={(e) =>
                    onChange({
                      ...criteria,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full bg-white border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Area Range */}
              <div>
                <span className="font-mono text-[0.62rem] text-stone-400 block mb-1.5 uppercase flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>{language === "ar" ? "المساحة (م²)" : "Area (m²)"}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={language === "ar" ? "أقل مساحة" : "Min m²"}
                    value={criteria.minArea || ""}
                    onChange={(e) =>
                      onChange({
                        ...criteria,
                        minArea: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-white border border-stone-200 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880]"
                  />
                  <input
                    type="number"
                    placeholder={language === "ar" ? "أقصى مساحة" : "Max m²"}
                    value={criteria.maxArea || ""}
                    onChange={(e) =>
                      onChange({
                        ...criteria,
                        maxArea: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-white border border-stone-200 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Rooms & Bathrooms */}
            <div className="space-y-3">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 text-[#9b7c52]" />
                <span>{language === "ar" ? "الغرف والحمامات" : "Rooms & Baths"}</span>
              </label>

              <div>
                <span className="font-mono text-[0.62rem] text-stone-400 block mb-1 uppercase">
                  {language === "ar" ? "غرف النوم" : "Bedrooms"}
                </span>
                <div className="flex gap-1.5">
                  {bedroomOptions.map((opt) => {
                    const isSelected =
                      (!criteria.bedrooms && opt.value === "ALL") ||
                      criteria.bedrooms === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange({ ...criteria, bedrooms: opt.value })}
                        className={`flex-1 py-1.5 font-mono text-xs border transition-colors ${
                          isSelected
                            ? "bg-[#111110] text-white border-[#111110] font-semibold"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="font-mono text-[0.62rem] text-stone-400 block mb-1 uppercase flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  <span>{language === "ar" ? "الحمامات" : "Bathrooms"}</span>
                </span>
                <div className="flex gap-1.5">
                  {bathroomOptions.map((opt) => {
                    const isSelected =
                      (!criteria.bathrooms && opt.value === "ALL") ||
                      criteria.bathrooms === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange({ ...criteria, bathrooms: opt.value })}
                        className={`flex-1 py-1.5 font-mono text-xs border transition-colors ${
                          isSelected
                            ? "bg-[#111110] text-white border-[#111110] font-semibold"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Finishing & View */}
            <div className="space-y-3">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
                <Paintbrush className="h-3.5 w-3.5 text-[#9b7c52]" />
                <span>{language === "ar" ? "التشطيب والإطلالة" : "Finishing & View"}</span>
              </label>

              <div>
                <span className="font-mono text-[0.6rem] text-stone-400 block mb-1 uppercase">
                  {language === "ar" ? "نوع التشطيب" : "Finishing Type"}
                </span>
                <select
                  value={criteria.finishing || "ALL"}
                  onChange={(e) => onChange({ ...criteria, finishing: e.target.value })}
                  className="w-full bg-white border border-stone-200 px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#c5a880]"
                >
                  {finishingOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {language === "ar" ? f.labelAr : f.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="font-mono text-[0.6rem] text-stone-400 block mb-1 uppercase flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{language === "ar" ? "الإطلالة" : "View"}</span>
                </span>
                <select
                  value={criteria.view || "ALL"}
                  onChange={(e) => onChange({ ...criteria, view: e.target.value })}
                  className="w-full bg-white border border-stone-200 px-2 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#c5a880]"
                >
                  {viewOptions.map((v) => (
                    <option key={v.value} value={v.value}>
                      {language === "ar" ? v.labelAr : v.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Bar Controls */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!criteria.availableOnly}
                onChange={(e) =>
                  onChange({ ...criteria, availableOnly: e.target.checked })
                }
                className="w-4 h-4 accent-[#111110] rounded"
              />
              <span className="font-mono text-xs text-stone-800 font-medium">
                {language === "ar" ? "عرض الوحدات المتاحة فقط" : "Available units only"}
              </span>
            </label>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-stone-500">
                {filteredCount}{" "}
                {language === "ar"
                  ? `وحدة مطابقة من أصل ${totalUnitsCount}`
                  : `matching of ${totalUnitsCount}`}
              </span>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 hover:border-stone-900 bg-white text-stone-800 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>
                    {language === "ar" ? "إعادة ضبط الفلاتر" : "Reset Filters"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
