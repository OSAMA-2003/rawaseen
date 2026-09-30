"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  KeyRound,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Trash2,
  Edit,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  Compass,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Layers,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { IUnit, UnitStatus, UnitType, UnitFinishing, UnitView } from "../../../types/unit";
import { IProject } from "../../../types/project";
import { CreateUnitModal } from "../../../components/units/CreateUnitModal";
import { STATIC_PROJECTS, STATIC_UNITS } from "@/data/staticData";

function UnitsInventoryContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "ALL";

  const { user } = useAuth();
  const [units, setUnits] = useState<IUnit[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  // Advanced Filters
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("ALL");
  const [bathrooms, setBathrooms] = useState<string>("ALL");
  const [floor, setFloor] = useState<string>("ALL");
  const [selectedFinishing, setSelectedFinishing] = useState<string>("ALL");
  const [selectedView, setSelectedView] = useState<string>("ALL");
  const [maxDownPayment, setMaxDownPayment] = useState("");
  const [installmentYears, setInstallmentYears] = useState("ALL");
  const [maxMonthlyInstallment, setMaxMonthlyInstallment] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IUnit | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    const pId = searchParams.get("projectId");
    if (pId) {
      setSelectedProjectId(pId);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [unitsRes, projectsRes] = await Promise.allSettled([
        api.get<IUnit[]>("/units?limit=100"),
        api.get<IProject[]>("/projects?limit=100"),
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
      console.warn("Could not load inventory data from server, falling back to static data:", err);
      setUnits(STATIC_UNITS);
      setProjects(STATIC_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnitSaved = () => {
    fetchData();
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const handleEditClick = (unit: IUnit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
    try {
      await api.patch(`/units/${unitId}`, { status: newStatus });
      toast.success(`Unit status changed to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update unit status");
    }
  };

  const handleDeleteUnit = async (unitId: string, unitNumber: string) => {
    if (!confirm(`Delete unit '${unitNumber}' permanently?`)) return;

    try {
      await api.delete(`/units/${unitId}`);
      toast.success(`Unit '${unitNumber}' removed from inventory`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete unit");
    }
  };

  // Distinct cities from projects
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.city) set.add(p.location.city.trim());
    });
    return Array.from(set);
  }, [projects]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedProjectId !== "ALL") count++;
    if (selectedStatus !== "ALL") count++;
    if (selectedType !== "ALL") count++;
    if (selectedCity !== "ALL") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (minArea) count++;
    if (maxArea) count++;
    if (bedrooms !== "ALL") count++;
    if (bathrooms !== "ALL") count++;
    if (floor !== "ALL") count++;
    if (selectedFinishing !== "ALL") count++;
    if (selectedView !== "ALL") count++;
    if (maxDownPayment) count++;
    if (installmentYears !== "ALL") count++;
    if (maxMonthlyInstallment) count++;
    return count;
  }, [
    searchQuery,
    selectedProjectId,
    selectedStatus,
    selectedType,
    selectedCity,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    floor,
    selectedFinishing,
    selectedView,
    maxDownPayment,
    installmentYears,
    maxMonthlyInstallment,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProjectId("ALL");
    setSelectedStatus("ALL");
    setSelectedType("ALL");
    setSelectedCity("ALL");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("ALL");
    setBathrooms("ALL");
    setFloor("ALL");
    setSelectedFinishing("ALL");
    setSelectedView("ALL");
    setMaxDownPayment("");
    setInstallmentYears("ALL");
    setMaxMonthlyInstallment("");
  };

  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const minP = minPrice ? parseFloat(minPrice) : undefined;
    const maxP = maxPrice ? parseFloat(maxPrice) : undefined;
    const minA = minArea ? parseFloat(minArea) : undefined;
    const maxA = maxArea ? parseFloat(maxArea) : undefined;
    const maxDp = maxDownPayment ? parseFloat(maxDownPayment) : undefined;
    const maxMo = maxMonthlyInstallment ? parseFloat(maxMonthlyInstallment) : undefined;

    return units.filter((u) => {
      const proj =
        typeof u.projectId === "object" && u.projectId !== null
          ? (u.projectId as any)
          : null;
      const projId = proj?._id || (typeof u.projectId === "string" ? u.projectId : "");
      const projNameEn = proj?.name?.en?.toLowerCase() || "";
      const projNameAr = proj?.name?.ar || "";
      const projCity = proj?.location?.city || "";
      const projArea = proj?.location?.area || "";

      // 1. Text Search
      if (q) {
        const matchesUnitCode = u.unitNumber.toLowerCase().includes(q);
        const matchesProjEn = projNameEn.includes(q);
        const matchesProjAr = projNameAr.includes(q);
        const matchesCity = projCity.toLowerCase().includes(q);
        const matchesArea = projArea.toLowerCase().includes(q);
        if (!matchesUnitCode && !matchesProjEn && !matchesProjAr && !matchesCity && !matchesArea) {
          return false;
        }
      }

      // 2. Project
      if (selectedProjectId !== "ALL" && projId !== selectedProjectId) {
        return false;
      }

      // 3. Status
      if (selectedStatus !== "ALL" && u.status !== selectedStatus) {
        return false;
      }

      // 4. Type
      if (selectedType !== "ALL" && u.type !== selectedType) {
        return false;
      }

      // 5. City
      if (selectedCity !== "ALL" && projCity.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // 6. Price Range
      if (minP !== undefined && u.price < minP) return false;
      if (maxP !== undefined && u.price > maxP) return false;

      // 7. Area Range
      if (minA !== undefined && u.area < minA) return false;
      if (maxA !== undefined && u.area > maxA) return false;

      // 8. Bedrooms
      if (bedrooms !== "ALL") {
        if (bedrooms === "4+") {
          if (u.bedrooms < 4) return false;
        } else {
          if (u.bedrooms !== parseInt(bedrooms, 10)) return false;
        }
      }

      // 9. Bathrooms
      if (bathrooms !== "ALL") {
        if (bathrooms === "3+") {
          if (u.bathrooms < 3) return false;
        } else {
          if (u.bathrooms !== parseInt(bathrooms, 10)) return false;
        }
      }

      // 10. Floor
      if (floor !== "ALL") {
        if (floor === "5+") {
          if ((u.floor ?? 0) < 5) return false;
        } else {
          if ((u.floor ?? 0) !== parseInt(floor, 10)) return false;
        }
      }

      // 11. Finishing
      if (selectedFinishing !== "ALL" && u.finishing !== selectedFinishing) {
        return false;
      }

      // 12. View
      if (selectedView !== "ALL" && u.view !== selectedView) {
        return false;
      }

      // 13. Down Payment
      if (maxDp !== undefined) {
        const dp = u.downPayment ?? (u.price * (u.downPaymentPercentage ?? 10)) / 100;
        if (dp > maxDp) return false;
      }

      // 14. Installment Years
      if (installmentYears !== "ALL") {
        const reqYears = parseInt(installmentYears, 10);
        if ((u.installmentYears ?? 0) < reqYears) return false;
      }

      // 15. Monthly Installment
      if (maxMo !== undefined && u.monthlyInstallment && u.monthlyInstallment > maxMo) {
        return false;
      }

      return true;
    });
  }, [
    units,
    searchQuery,
    selectedProjectId,
    selectedStatus,
    selectedType,
    selectedCity,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    floor,
    selectedFinishing,
    selectedView,
    maxDownPayment,
    installmentYears,
    maxMonthlyInstallment,
  ]);

  // Inventory KPI metrics
  const availableCount = units.filter((u) => u.status === "AVAILABLE").length;
  const reservedCount = units.filter((u) => u.status === "RESERVED").length;
  const soldCount = units.filter((u) => u.status === "SOLD").length;

  const totalValue = useMemo(() => {
    return units.reduce((sum, u) => sum + (u.price || 0), 0);
  }, [units]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: UnitStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "RESERVED":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "SOLD":
        return "bg-blue-50 text-blue-800 border-blue-300";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  const getFinishingLabel = (f?: string) => {
    switch (f) {
      case "FULLY_FINISHED":
        return "Fully Finished (تشطيب كامل)";
      case "SEMI_FINISHED":
        return "Semi Finished (نصف تشطيب)";
      case "CORE_AND_SHELL":
        return "Core & Shell (عظم)";
      default:
        return f || "Finished";
    }
  };

  const getViewLabel = (v?: string) => {
    switch (v) {
      case "GARDEN":
        return "Garden View (حديقة)";
      case "POOL":
        return "Pool View (مسبح)";
      case "SEA":
        return "Sea View (بحر)";
      case "STREET":
        return "Street View (شارع)";
      case "COMPOUND":
        return "Open View (مفتوح)";
      default:
        return v || "Scenic";
    }
  };

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6 text-stone-900">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Real Estate Asset & Availability Control</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-stone-950">
              Unit Inventory & Assets
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 border border-stone-200 bg-stone-100 text-[#9b7c52] font-semibold">
              {filteredUnits.length} of {units.length} Units Listed
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-950 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh inventory"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#182220] text-[#c5a880] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#9b7c52] hover:text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Inventory Unit</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-stone-500 block mb-1">
            Total Inventory
          </span>
          <div className="text-xl font-light text-stone-950">{units.length} Units</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-emerald-700 block mb-1">
            Available For Sale
          </span>
          <div className="text-xl font-light text-emerald-700">{availableCount} Units</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-amber-700 block mb-1">
            Reserved / In Contract
          </span>
          <div className="text-xl font-light text-amber-700">{reservedCount} Units</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[#9b7c52] block mb-1">
            Total Portfolio Value
          </span>
          <div className="text-base font-mono font-bold text-[#9b7c52] truncate">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      {/* Main Filter Control Bar */}
      <div className="bg-white border border-stone-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search unit #, project, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-stone-50 border border-stone-300 px-3 py-1.5 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            </div>

            {/* Project Filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
            >
              <option value="ALL">All Development Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name.en} ({p.name.ar})
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
            >
              <option value="ALL">All Cities / Places</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem]"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem]"
            >
              <option value="ALL">All Types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="TWIN_HOUSE">Twin House</option>
              <option value="DUPLEX">Duplex</option>
              <option value="PENTHOUSE">Penthouse</option>
              <option value="CHALET">Chalet</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="OFFICE">Office</option>
              <option value="LAND">Land</option>
            </select>
          </div>

          {/* Controls: More Filters & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                isAdvancedOpen || activeFiltersCount > 0
                  ? "bg-[#182220] text-[#c5a880] border-[#182220]"
                  : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>More Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#9b7c52] text-white text-[0.6rem] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
              {isAdvancedOpen ? (
                <ChevronUp className="h-3 w-3 ml-0.5" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-0.5" />
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {isAdvancedOpen && (
          <div className="pt-4 border-t border-stone-200 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Price Range (EGP)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                </div>
              </div>

              {/* Area Range */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Area Range (m²)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min m²"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                  <input
                    type="number"
                    placeholder="Max m²"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Bedrooms
                </label>
                <div className="flex gap-1">
                  {["ALL", "0", "1", "2", "3", "4+"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBedrooms(b)}
                      className={`flex-1 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                        bedrooms === b
                          ? "bg-[#182220] text-[#c5a880] border-[#182220] font-bold"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {b === "0" ? "Studio" : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Bathrooms
                </label>
                <div className="flex gap-1">
                  {["ALL", "1", "2", "3+"].map((ba) => (
                    <button
                      key={ba}
                      type="button"
                      onClick={() => setBathrooms(ba)}
                      className={`flex-1 py-1.5 text-xs font-mono border transition-colors cursor-pointer ${
                        bathrooms === ba
                          ? "bg-[#182220] text-[#c5a880] border-[#182220] font-bold"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {ba}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Finishing, View, Floor & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Finishing Level */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Finishing Specification
                </label>
                <select
                  value={selectedFinishing}
                  onChange={(e) => setSelectedFinishing(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem]"
                >
                  <option value="ALL">All Finishing</option>
                  <option value="FULLY_FINISHED">Fully Finished (تشطيب كامل)</option>
                  <option value="SEMI_FINISHED">Semi Finished (نصف تشطيب)</option>
                  <option value="CORE_AND_SHELL">Core & Shell (عظم)</option>
                </select>
              </div>

              {/* Scenic View */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Panoramic View
                </label>
                <select
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem]"
                >
                  <option value="ALL">All Views</option>
                  <option value="GARDEN">Garden View</option>
                  <option value="POOL">Pool View</option>
                  <option value="SEA">Sea View</option>
                  <option value="STREET">Street View</option>
                  <option value="COMPOUND">Compound / Open View</option>
                </select>
              </div>

              {/* Floor Level */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Floor Level
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
                >
                  <option value="ALL">Any Floor</option>
                  <option value="0">Ground Floor (0)</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                  <option value="4">4th Floor</option>
                  <option value="5+">5th Floor or Higher</option>
                </select>
              </div>

              {/* Installment Years */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Min Installment Term
                </label>
                <select
                  value={installmentYears}
                  onChange={(e) => setInstallmentYears(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
                >
                  <option value="ALL">Any Terms</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="7">7+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>
            </div>

            {/* Row 3: Down Payment & Monthly Installment caps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Max Down Payment Cash
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={maxDownPayment}
                  onChange={(e) => setMaxDownPayment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Max Monthly Installment (EGP)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75000"
                  value={maxMonthlyInstallment}
                  onChange={(e) => setMaxMonthlyInstallment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-stone-500">
          Loading unit inventory...
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-300 bg-white p-8 space-y-3 shadow-xs">
          <KeyRound className="h-8 w-8 text-stone-400 mx-auto opacity-50" />
          <h3 className="text-sm font-medium text-stone-900">No units match filter criteria</h3>
          <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
            {activeFiltersCount > 0
              ? "Try resetting some filters or broadening your price and area criteria."
              : "No units registered in inventory yet."}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#182220] hover:bg-[#9b7c52] text-[#c5a880] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          ) : (
            canManage && (
              <button
                type="button"
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#182220] hover:bg-[#9b7c52] text-[#c5a880] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Unit</span>
              </button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUnits.map((unit) => {
            const proj =
              typeof unit.projectId === "object" && unit.projectId !== null
                ? (unit.projectId as any)
                : null;
            const projectNameEn = proj?.name?.en || "Development";
            const projectSlug = proj?.slug;
            const unitImage =
              unit.images && unit.images.length > 0
                ? unit.images[0]
                : proj?.coverImage ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

            return (
              <div
                key={unit._id}
                className="bg-white border border-stone-200 hover:border-[#c5a880] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
              >
                <div>
                  {/* Unit Image Banner */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={unitImage}
                      alt={unit.unitNumber}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Unit Code Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-black/75 text-white font-mono text-[0.62rem] font-bold px-2 py-0.5 backdrop-blur-md">
                      {unit.unitNumber}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`absolute top-2.5 right-2.5 font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 border backdrop-blur-md ${getStatusBadge(
                        unit.status
                      )}`}
                    >
                      {unit.status}
                    </span>

                    {/* Bottom Image Info */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white font-mono text-[0.68rem]">
                      <span className="bg-black/60 px-2 py-0.5 backdrop-blur-xs font-semibold">{unit.area} m²</span>
                      <Link
                        href={`/units/${unit._id}`}
                        target="_blank"
                        className="bg-black/60 px-2 py-0.5 backdrop-blur-xs text-[#c5a880] hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Public View</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Header: Unit #, Project & Status */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/units/${unit._id}`}
                            target="_blank"
                            className="text-base font-semibold text-stone-900 hover:text-[#9b7c52] transition-colors"
                          >
                            {unit.unitNumber}
                          </Link>
                          <span className="font-mono text-[0.62rem] px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 capitalize">
                            {unit.type.toLowerCase().replace("_", " ")}
                          </span>
                        </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500 mt-0.5">
                        <Building2 className="h-3 w-3 text-[#9b7c52]" />
                        {projectSlug ? (
                          <Link
                            href={`/projects/${projectSlug}`}
                            target="_blank"
                            className="hover:underline text-stone-700 truncate"
                          >
                            {projectNameEn}
                          </Link>
                        ) : (
                          <span className="truncate">{projectNameEn}</span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 border ${getStatusBadge(
                        unit.status
                      )}`}
                    >
                      {unit.status}
                    </span>
                  </div>

                  {/* Specs: Area, Beds, Baths, Floor */}
                  <div className="grid grid-cols-4 gap-2 py-2.5 border-y border-stone-100 font-mono text-xs text-stone-700 my-2.5">
                    <div className="flex items-center gap-1">
                      <Maximize2 className="h-3 w-3 text-stone-400" />
                      <span>{unit.area} m²</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3 text-stone-400" />
                      <span>{unit.bedrooms} Bed</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3 text-stone-400" />
                      <span>{unit.bathrooms} Bath</span>
                    </div>

                    <div className="text-right">
                      <span className="text-stone-500 text-[0.65rem]">
                        Fl {unit.floor ?? 1}
                      </span>
                    </div>
                  </div>

                  {/* Finishing & View Badges */}
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {unit.finishing && (
                      <span className="font-mono text-[0.6rem] px-2 py-0.5 bg-[#fbf9f6] text-stone-700 border border-stone-200">
                        {getFinishingLabel(unit.finishing)}
                      </span>
                    )}
                    {unit.view && (
                      <span className="font-mono text-[0.6rem] px-2 py-0.5 bg-stone-50 text-stone-600 border border-stone-200">
                        {getViewLabel(unit.view)}
                      </span>
                    )}
                  </div>

                  {/* Pricing & Installment Terms */}
                  <div className="pt-2 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[0.62rem] text-stone-400 uppercase block">
                        Full Price
                      </span>
                      <span className="text-stone-950 font-bold text-sm">
                        {formatCurrency(unit.price)}
                      </span>
                    </div>

                    {unit.monthlyInstallment ? (
                      <div className="text-right">
                        <span className="text-[0.62rem] text-stone-400 uppercase block">
                          Monthly Installment
                        </span>
                        <span className="text-[#8c6b3e] font-semibold text-xs">
                          {formatCurrency(unit.monthlyInstallment)}/mo
                        </span>
                      </div>
                    ) : unit.downPayment ? (
                      <div className="text-right">
                        <span className="text-[0.62rem] text-stone-400 uppercase block">
                          Down Payment
                        </span>
                        <span className="text-stone-800 text-xs">
                          {formatCurrency(unit.downPayment)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons & Edit / Delete */}
              <div className="p-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-wider">
                    {unit.status !== "AVAILABLE" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(unit._id, "AVAILABLE")}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                      >
                        Available
                      </button>
                    )}
                    {unit.status !== "RESERVED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(unit._id, "RESERVED")}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors cursor-pointer"
                      >
                        Reserve
                      </button>
                    )}
                    {unit.status !== "SOLD" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(unit._id, "SOLD")}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 transition-colors cursor-pointer"
                      >
                        Sold
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(unit)}
                        title="Edit unit specifications"
                        className="p-1.5 text-stone-600 hover:text-[#9b7c52] hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {user?.role === "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit._id, unit.unitNumber)}
                        title="Delete unit permanently"
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      <CreateUnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        onUnitCreated={handleUnitSaved}
        preselectedProjectId={
          selectedProjectId !== "ALL" ? selectedProjectId : undefined
        }
        initialUnit={editingUnit}
      />
    </div>
  );
}

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-mono text-xs text-[#706c64]">
          Loading unit inventory...
        </div>
      }
    >
      <UnitsInventoryContent />
    </Suspense>
  );
}
