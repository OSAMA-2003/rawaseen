"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Building2,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Compass,
  FileText,
} from "lucide-react";
import { api } from "../../lib/api";
import { IProject, ProjectStatus, PropertyType, IPaymentPlan } from "../../types/project";
import { ImageUploadZone } from "../common/ImageUploadZone";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: IProject) => void;
  initialProject?: IProject | null;
}

const DEFAULT_COVER_PRESETS = [
  {
    name: "Obsidian Heights",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Modern Cascades",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Sky Courtyards",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Glass Monolith",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Sunlit Terraces",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Sleek Pavilion",
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80",
  },
];

const MASTER_PLAN_PRESETS = [
  {
    name: "Architectural Grid Blueprint",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Urban Landscape Masterplan",
    url: "https://images.unsplash.com/photo-1536895058696-a69b1c7ba34f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    name: "Geometric Residential Layout",
    url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80",
  },
];

const AVAILABLE_PROPERTY_TYPES: { id: PropertyType; en: string; ar: string }[] = [
  { id: "APARTMENT", en: "Apartment", ar: "شقة سكنية" },
  { id: "VILLA", en: "Stand-alone Villa", ar: "فيلا مستقلة" },
  { id: "TOWNHOUSE", en: "Townhouse", ar: "تاون هاوس" },
  { id: "TWIN_HOUSE", en: "Twin House", ar: "توين هاوس" },
  { id: "DUPLEX", en: "Duplex", ar: "دوبلكس" },
  { id: "PENTHOUSE", en: "Penthouse", ar: "بنتهاوس" },
  { id: "CHALET", en: "Chalet", ar: "شاليه" },
  { id: "COMMERCIAL", en: "Commercial Promenade", ar: "تجاري" },
  { id: "OFFICE", en: "Administrative Office", ar: "مكتبي" },
  { id: "LAND", en: "Plots / Land", ar: "أرض" },
];

const SIGNATURE_AMENITIES = [
  "Parking",
  "Swimming Pool",
  "Clubhouse",
  "Gym",
  "Security",
  "CCTV",
  "Kids Area",
  "Green Areas",
  "Commercial Area",
  "Mosque",
  "Walking Area",
  "Smart Home Automation",
];

export function CreateProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  initialProject,
}: CreateProjectModalProps) {
  const isEdit = Boolean(initialProject);

  // Form State
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [developer, setDeveloper] = useState("Rawasin Real Estate");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");

  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(["APARTMENT"]);
  const [isFeatured, setIsFeatured] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("New Sohag City");
  const [governorate, setGovernorate] = useState("Sohag");
  const [area, setArea] = useState("Central District");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [startingPrice, setStartingPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("Q4 2026");

  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [masterPlan, setMasterPlan] = useState(MASTER_PLAN_PRESETS[0].url);
  const [customMasterPlanUrl, setCustomMasterPlanUrl] = useState("");

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Parking",
    "Security",
    "Green Areas",
    "Gym",
  ]);

  const [paymentPlans, setPaymentPlans] = useState<IPaymentPlan[]>([
    {
      title: "Standard Installment",
      downPaymentPercentage: 10,
      installmentYears: 5,
      installmentFrequency: "MONTHLY",
      discountPercentage: 0,
      description: "10% Down Payment over 5 Years Equal Installments",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill on initialProject change
  useEffect(() => {
    if (initialProject) {
      setNameEn(initialProject.name.en || "");
      setNameAr(initialProject.name.ar || "");
      setSlug(initialProject.slug || "");
      setDeveloper(initialProject.developer || "Rawasin Real Estate");
      setDescEn(initialProject.description?.en || "");
      setDescAr(initialProject.description?.ar || "");
      setStatus(initialProject.status || "ACTIVE");
      setSelectedTypes(
        (initialProject.projectTypes && initialProject.projectTypes.length > 0
          ? initialProject.projectTypes
          : initialProject.projectType
          ? [initialProject.projectType as PropertyType]
          : ["APARTMENT"]) as PropertyType[]
      );
      setIsFeatured(Boolean(initialProject.isFeatured));
      setAddress(initialProject.location?.address || "");
      setCity(initialProject.location?.city || "New Sohag City");
      setGovernorate(initialProject.location?.governorate || "Sohag");
      setArea(initialProject.location?.area || "");
      setLatitude(
        initialProject.location?.latitude?.toString() ||
          initialProject.location?.coordinates?.lat?.toString() ||
          ""
      );
      setLongitude(
        initialProject.location?.longitude?.toString() ||
          initialProject.location?.coordinates?.lng?.toString() ||
          ""
      );
      setStartingPrice(initialProject.startingPrice?.toString() || "");
      setMaxPrice(initialProject.maxPrice ? initialProject.maxPrice.toString() : "");
      setMinArea(initialProject.minArea ? initialProject.minArea.toString() : "");
      setMaxArea(initialProject.maxArea ? initialProject.maxArea.toString() : "");
      setDeliveryDate(initialProject.deliveryDate || "Q4 2026");
      setCoverImage(initialProject.coverImage || DEFAULT_COVER_PRESETS[0].url);
      setMasterPlan(initialProject.masterPlan || MASTER_PLAN_PRESETS[0].url);
      setSelectedAmenities(initialProject.amenities || []);
      setPaymentPlans(
        initialProject.paymentPlans && initialProject.paymentPlans.length > 0
          ? initialProject.paymentPlans
          : [
              {
                title: "Standard Installment",
                downPaymentPercentage: 10,
                installmentYears: 5,
                installmentFrequency: "MONTHLY",
                discountPercentage: 0,
              },
            ]
      );
    } else {
      // Reset form
      setNameEn("");
      setNameAr("");
      setSlug("");
      setDeveloper("Rawasin Real Estate");
      setDescEn("");
      setDescAr("");
      setStatus("ACTIVE");
      setSelectedTypes(["APARTMENT"]);
      setIsFeatured(false);
      setAddress("");
      setCity("New Sohag City");
      setGovernorate("Sohag");
      setArea("Central District");
      setLatitude("");
      setLongitude("");
      setStartingPrice("");
      setMaxPrice("");
      setMinArea("");
      setMaxArea("");
      setDeliveryDate("Q4 2026");
      setCoverImage(DEFAULT_COVER_PRESETS[0].url);
      setMasterPlan(MASTER_PLAN_PRESETS[0].url);
      setSelectedAmenities(["Parking", "Security", "Green Areas", "Gym"]);
      setPaymentPlans([
        {
          title: "Standard Installment",
          downPaymentPercentage: 10,
          installmentYears: 5,
          installmentFrequency: "MONTHLY",
          discountPercentage: 0,
        },
      ]);
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const toggleType = (type: PropertyType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      } else {
        toast.info("A project must have at least one property type");
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const addPaymentPlan = (preset?: Partial<IPaymentPlan>) => {
    const newPlan: IPaymentPlan = {
      title: preset?.title || `Plan ${paymentPlans.length + 1}`,
      downPaymentPercentage: preset?.downPaymentPercentage ?? 10,
      installmentYears: preset?.installmentYears ?? 5,
      installmentFrequency: preset?.installmentFrequency || "MONTHLY",
      discountPercentage: preset?.discountPercentage ?? 0,
      description: preset?.description || "",
    };
    setPaymentPlans([...paymentPlans, newPlan]);
  };

  const removePaymentPlan = (index: number) => {
    if (paymentPlans.length <= 1) {
      toast.info("At least one payment plan should be configured");
      return;
    }
    setPaymentPlans(paymentPlans.filter((_, i) => i !== index));
  };

  const updatePaymentPlan = (index: number, field: keyof IPaymentPlan, val: any) => {
    const updated = [...paymentPlans];
    updated[index] = { ...updated[index], [field]: val };
    setPaymentPlans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim() || !nameAr.trim() || !startingPrice) {
      toast.error("Please fill in project bilingual names and starting price");
      return;
    }

    const startPriceNum = parseFloat(startingPrice);
    if (isNaN(startPriceNum) || startPriceNum <= 0) {
      toast.error("Please enter a valid starting price");
      return;
    }

    const finalCover = coverImage.trim() || DEFAULT_COVER_PRESETS[0].url;
    const finalMasterPlan = masterPlan.trim() || MASTER_PLAN_PRESETS[0].url;

    const payload: any = {
      name: {
        en: nameEn.trim(),
        ar: nameAr.trim(),
      },
      description: {
        en:
          descEn.trim() ||
          `${nameEn.trim()} is an exclusive architectural masterwork offering refined luxury living and commercial spaces.`,
        ar:
          descAr.trim() ||
          `مشروع ${nameAr.trim()} يمثل قمة التميز المعماري مع تشطيبات استثنائية وأسلوب حياة عصري راقٍ.`,
      },
      developer: developer.trim() || "Rawasin Real Estate",
      projectType: selectedTypes[0] || "APARTMENT",
      projectTypes: selectedTypes,
      status,
      coverImage: finalCover,
      images: [finalCover],
      gallery: [finalCover],
      masterPlan: finalMasterPlan,
      location: {
        address: address.trim() || "Prime District",
        city: city.trim() || "New Sohag City",
        governorate: governorate.trim() || "Sohag",
        area: area.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        coordinates:
          latitude && longitude
            ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
            : undefined,
      },
      startingPrice: startPriceNum,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      deliveryDate: deliveryDate.trim() || "Ready for Handover",
      amenities: selectedAmenities,
      paymentPlans: paymentPlans.map((p) => ({
        title: p.title || "Standard Plan",
        downPaymentPercentage: Number(p.downPaymentPercentage) || 0,
        installmentYears: Number(p.installmentYears) || 0,
        installmentFrequency: p.installmentFrequency || "MONTHLY",
        discountPercentage: Number(p.discountPercentage) || 0,
        description: p.description || "",
      })),
      isFeatured,
    };

    if (slug.trim()) {
      payload.slug = slug.trim().toLowerCase();
    }

    setIsSubmitting(true);
    try {
      let savedProject: IProject;
      if (isEdit && initialProject) {
        const res = await api.patch<IProject>(`/projects/${initialProject._id}`, payload);
        savedProject = res.data;
        toast.success(`Project '${savedProject.name.en}' updated successfully`);
      } else {
        const res = await api.post<IProject>("/projects", payload);
        savedProject = res.data;
        toast.success(`Project '${savedProject.name.en}' launched successfully`);
      }

      onProjectCreated(savedProject);
      onClose();
    } catch (err: any) {
      console.error("Save project error:", err);
      toast.error(err.message || "Failed to save project. Please check fields.");
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
        className="w-full max-w-4xl bg-white text-stone-900 border border-stone-200 shadow-2xl relative my-auto max-h-[92vh] flex flex-col rounded-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-[#fbf9f6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#182220] flex items-center justify-center text-[#c5a880] shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#9b7c52] font-semibold">
                  Rawasin Commercial Portfolio
                </span>
                <span className="text-[0.65rem] px-2 py-0.5 bg-stone-200 text-stone-700 font-mono uppercase">
                  {isEdit ? "Update Mode" : "New Development"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-normal text-stone-950">
                {isEdit ? `Edit: ${initialProject?.name.en}` : "Launch Architectural Development"}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-7 overflow-y-auto flex-1">
          {/* SECTION 1: Bilingual Names & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Project Identity & Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Project Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rawasin Obsidian Tower"
                  value={nameEn}
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (!isEdit && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-")
                      );
                    }
                  }}
                  className="w-full bg-stone-50 border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  اسم المشروع (بالعربية) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  placeholder="مثال: برج رواسن أوبسيديان"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white transition-colors text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Developer / Master Developer
                </label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Rawasin Real Estate"
                  className="w-full bg-stone-50 border border-stone-300 px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Custom URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="rawasin-obsidian-tower"
                  className="w-full bg-stone-50 border border-stone-300 px-3.5 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Detailed architectural concept, lifestyle experience, and unit offerings..."
                  className="w-full bg-stone-50 border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white resize-none"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  الوصف التفصيلي (بالعربية)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  placeholder="المفهوم المعماري، الرؤية التصميمية، والخدمات والمرافق المتكاملة..."
                  className="w-full bg-stone-50 border border-stone-300 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white resize-none text-right"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Property Types & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Layers className="h-3.5 w-3.5" />
              <span>Project Classification & Status</span>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Development Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-medium"
                >
                  <option value="ACTIVE">Active (نشط ومتاح للبيع)</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction (قيد الإنشاء)</option>
                  <option value="READY">Ready for Handover (جاهز للاستلام)</option>
                  <option value="NEAR_DELIVERY">Near Delivery (قريب التسليم)</option>
                  <option value="OFF_PLAN">Off-Plan Launch (على الخارطة)</option>
                  <option value="COMING_SOON">Coming Soon (قريباً)</option>
                  <option value="COMPLETED">Completed (مكتمل بالكامل)</option>
                  <option value="SOLD_OUT">Sold Out (تم البيع بالكامل)</option>
                  <option value="PLANNING">Planning Phase (مرحلة التخطيط)</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#9b7c52] accent-[#9b7c52] rounded border-stone-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-800 font-semibold">
                    Feature on Homepage Showcase
                  </span>
                </label>
              </div>
            </div>

            {/* Property Types Multiple Pills */}
            <div className="space-y-2">
              <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                Offered Property Types ({selectedTypes.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PROPERTY_TYPES.map((pt) => {
                  const isSelected = selectedTypes.includes(pt.id);
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => toggleType(pt.id)}
                      className={`px-3 py-1.5 border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#182220] text-[#c5a880] border-[#182220] shadow-sm font-semibold"
                          : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      <span>{pt.en}</span>
                      <span className="text-[0.65rem] opacity-70">({pt.ar})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Location Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <MapPin className="h-3.5 w-3.5" />
              <span>Location, District & Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  District / Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prince Mohammed Bin Salman Rd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Neighborhood / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al-Malqa / Golden Square"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  City & Governorate
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New Sohag City / Sohag"
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  GPS Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="24.8152"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  GPS Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="46.5982"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Pricing, Area Specs & Delivery */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span>Pricing, Area Range & Delivery Date</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 font-semibold block">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  placeholder="2850000"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Max Price (Range)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  placeholder="6500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Min Area (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="120"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Max Area (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="380"
                  value={maxArea}
                  onChange={(e) => setMaxArea(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="font-mono text-[0.68rem] uppercase tracking-wider text-stone-700 block">
                  Delivery Timeline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 2026 / Ready"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Architectural Media & Master Plan */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Architectural Cover & Master Plan Layout</span>
            </div>

            {/* Cover Image Upload Zone */}
            <ImageUploadZone
              label="Architectural Cover Image (واجهة المشروع الرئيسية)"
              sublabel="Upload a high-res photo from your device, choose an architectural preset, or link an external URL"
              value={coverImage}
              onChange={setCoverImage}
              presets={DEFAULT_COVER_PRESETS}
              folder="rawasin/projects"
              aspectRatio="wide"
            />

            {/* Master Plan Upload Zone */}
            <ImageUploadZone
              label="Master Plan Blueprint (المخطط العام والتوزيع الهندسي)"
              sublabel="Upload a master plan blueprint or select from architectural layouts"
              value={masterPlan}
              onChange={setMasterPlan}
              presets={MASTER_PLAN_PRESETS}
              folder="rawasin/masterplans"
              aspectRatio="video"
            />
          </div>

          {/* SECTION 6: Signature Amenities */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <Compass className="h-3.5 w-3.5" />
              <span>Project Amenities & Facilities ({selectedAmenities.length} selected)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SIGNATURE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#9b7c52] text-white border-[#9b7c52] font-semibold shadow-xs"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: Multi-Year Payment Plans Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs font-mono uppercase tracking-wider text-[#9b7c52] font-semibold">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Configured Payment Plans ({paymentPlans.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    addPaymentPlan({
                      title: "Extended 8 Years",
                      downPaymentPercentage: 15,
                      installmentYears: 8,
                      installmentFrequency: "QUARTERLY",
                      description: "15% Down Payment with Flexible 8-Year Installments",
                    })
                  }
                  className="px-2 py-1 text-[0.65rem] bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 cursor-pointer transition-colors"
                >
                  + Add 8Y Plan
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addPaymentPlan({
                      title: "Cash Advantage",
                      downPaymentPercentage: 100,
                      installmentYears: 0,
                      discountPercentage: 15,
                      description: "Immediate Cash Settlement with 15% Exclusive Discount",
                    })
                  }
                  className="px-2 py-1 text-[0.65rem] bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 cursor-pointer transition-colors"
                >
                  + Add Cash Discount
                </button>
                <button
                  type="button"
                  onClick={() => addPaymentPlan()}
                  className="px-2.5 py-1 text-[0.65rem] bg-[#182220] hover:bg-[#9b7c52] text-white cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Custom Plan</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {paymentPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-stone-50 border border-stone-200 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.68rem] uppercase font-bold text-stone-800">
                      Option #{idx + 1}: {plan.title}
                    </span>
                    {paymentPlans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentPlan(idx)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Remove plan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-mono text-[0.62rem] uppercase text-stone-600 block">
                        Plan Title
                      </label>
                      <input
                        type="text"
                        value={plan.title}
                        onChange={(e) => updatePaymentPlan(idx, "title", e.target.value)}
                        placeholder="e.g. Standard 5 Years"
                        className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[0.62rem] uppercase text-stone-600 block">
                        Down Payment %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={plan.downPaymentPercentage}
                        onChange={(e) =>
                          updatePaymentPlan(
                            idx,
                            "downPaymentPercentage",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[0.62rem] uppercase text-stone-600 block">
                        Years
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={plan.installmentYears}
                        onChange={(e) =>
                          updatePaymentPlan(
                            idx,
                            "installmentYears",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[0.62rem] uppercase text-stone-600 block">
                        Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={plan.discountPercentage || 0}
                        onChange={(e) =>
                          updatePaymentPlan(
                            idx,
                            "discountPercentage",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#182220] text-[#c5a880] font-semibold hover:bg-[#9b7c52] hover:text-white transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Building2 className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? isEdit
                      ? "Updating..."
                      : "Launching..."
                    : isEdit
                    ? "Save Changes"
                    : "Launch Project"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
