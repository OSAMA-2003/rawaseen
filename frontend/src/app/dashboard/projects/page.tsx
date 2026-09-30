"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  MapPin,
  KeyRound,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  Layers,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Bed,
  Bath,
  Maximize2,
  Compass,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { IProject, ProjectStatus, PropertyType } from "../../../types/project";
import { IUnit, UnitFinishing, UnitView } from "../../../types/unit";
import { CreateProjectModal } from "../../../components/projects/CreateProjectModal";
import { STATIC_PROJECTS, STATIC_UNITS } from "@/data/staticData";
import {
  filterProjectsWithUnits,
  ProjectFilterCriteria,
} from "../../../lib/projectFilters";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [units, setUnits] = useState<IUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedArea, setSelectedArea] = useState<string>("ALL");

  // Advanced Filters
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [bedrooms, setBedrooms] = useState<string>("ALL");
  const [bathrooms, setBathrooms] = useState<string>("ALL");
  const [maxDownPayment, setMaxDownPayment] = useState<string>("");
  const [installmentDuration, setInstallmentDuration] = useState<string>("ALL");
  const [finishing, setFinishing] = useState<string>("ALL");
  const [view, setView] = useState<string>("ALL");
  const [availableUnitsOnly, setAvailableUnitsOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projRes, unitsRes] = await Promise.allSettled([
        api.get<IProject[]>("/projects?limit=100"),
        api.get<IUnit[]>("/units?limit=100"),
      ]);

      if (
        projRes.status === "fulfilled" &&
        projRes.value.data &&
        Array.isArray(projRes.value.data) &&
        projRes.value.data.length > 0
      ) {
        setProjects(projRes.value.data);
      } else {
        setProjects(STATIC_PROJECTS);
      }

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
    } catch (err: any) {
      console.warn("Could not load projects/units from server, falling back to static data:", err);
      setProjects(STATIC_PROJECTS);
      setUnits(STATIC_UNITS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectSaved = () => {
    fetchData();
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleEditClick = (project: IProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete '${name}' and its associated units?`)) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      toast.success(`Project '${name}' deleted`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    }
  };

  // Distinct cities and areas from projects
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.city) set.add(p.location.city.trim());
    });
    return Array.from(set);
  }, [projects]);

  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.location?.area) set.add(p.location.area.trim());
    });
    return Array.from(set);
  }, [projects]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedStatus !== "ALL") count++;
    if (selectedType !== "ALL") count++;
    if (selectedCity !== "ALL") count++;
    if (selectedArea !== "ALL") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (minArea) count++;
    if (maxArea) count++;
    if (bedrooms !== "ALL") count++;
    if (bathrooms !== "ALL") count++;
    if (maxDownPayment) count++;
    if (installmentDuration !== "ALL") count++;
    if (finishing !== "ALL") count++;
    if (view !== "ALL") count++;
    if (availableUnitsOnly) count++;
    return count;
  }, [
    searchQuery,
    selectedStatus,
    selectedType,
    selectedCity,
    selectedArea,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    maxDownPayment,
    installmentDuration,
    finishing,
    view,
    availableUnitsOnly,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedType("ALL");
    setSelectedCity("ALL");
    setSelectedArea("ALL");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBedrooms("ALL");
    setBathrooms("ALL");
    setMaxDownPayment("");
    setInstallmentDuration("ALL");
    setFinishing("ALL");
    setView("ALL");
    setAvailableUnitsOnly(false);
  };

  // Unit-dependent filtering using the robust filter engine
  const filteredProjectResults = useMemo(() => {
    const criteria: ProjectFilterCriteria = {
      searchQuery,
      projectStatus: selectedStatus,
      propertyType: selectedType,
      city: selectedCity,
      area: selectedArea,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      bedrooms,
      bathrooms,
      maxDownPayment: maxDownPayment ? parseFloat(maxDownPayment) : undefined,
      installmentDuration,
      finishing,
      view,
      availableUnitsOnly,
    };

    return filterProjectsWithUnits(projects, units, criteria);
  }, [
    projects,
    units,
    searchQuery,
    selectedStatus,
    selectedType,
    selectedCity,
    selectedArea,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    maxDownPayment,
    installmentDuration,
    finishing,
    view,
    availableUnitsOnly,
  ]);

  // Top KPI metrics
  const activeCount = projects.filter(
    (p) => p.status === "ACTIVE" || p.status === "UNDER_CONSTRUCTION"
  ).length;
  const readyCount = projects.filter(
    (p) => p.status === "READY" || p.status === "NEAR_DELIVERY" || p.status === "COMPLETED"
  ).length;
  const totalUnitsCalculated = projects.reduce(
    (sum, p) => sum + (p.unitsCount ?? p.totalUnits ?? 0),
    0
  );

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "READY":
        return "bg-teal-50 text-teal-800 border-teal-300";
      case "NEAR_DELIVERY":
        return "bg-cyan-50 text-cyan-800 border-cyan-300";
      case "UNDER_CONSTRUCTION":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "OFF_PLAN":
        return "bg-indigo-50 text-indigo-800 border-indigo-300";
      case "COMING_SOON":
        return "bg-blue-50 text-blue-800 border-blue-300";
      case "SOLD_OUT":
        return "bg-rose-50 text-rose-800 border-rose-300";
      case "INACTIVE":
        return "bg-stone-100 text-stone-700 border-stone-300";
      case "PLANNING":
      default:
        return "bg-[#c5a880]/15 text-[#8c6b3e] border-[#c5a880]/40";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6 text-stone-900">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Commercial & Residential Portfolio</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-stone-950">
              Projects Portfolio
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 border border-stone-200 bg-stone-100 text-stone-800 font-semibold">
              {filteredProjectResults.length} of {projects.length} Developments
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
            title="Refresh projects"
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
              <span>Launch Project</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <div className="font-mono text-[0.65rem] uppercase text-stone-500 mb-1">
            Total Projects
          </div>
          <div className="text-2xl font-light text-stone-950">{projects.length}</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <div className="font-mono text-[0.65rem] uppercase text-stone-500 mb-1">
            In Construction / Active
          </div>
          <div className="text-2xl font-light text-amber-700">{activeCount}</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <div className="font-mono text-[0.65rem] uppercase text-stone-500 mb-1">
            Ready & Near Delivery
          </div>
          <div className="text-2xl font-light text-teal-700">{readyCount}</div>
        </div>

        <div className="p-4 bg-white border border-stone-200 shadow-xs">
          <div className="font-mono text-[0.65rem] uppercase text-stone-500 mb-1">
            Inventory Units Logged
          </div>
          <div className="text-2xl font-light text-[#9b7c52]">{totalUnitsCalculated}</div>
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
                placeholder="Search title, city, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 bg-stone-50 border border-stone-300 px-3 py-1.5 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] focus:bg-white"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            </div>

            {/* City / Location Select */}
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
              <option value="ACTIVE">Active</option>
              <option value="READY">Ready for Handover</option>
              <option value="NEAR_DELIVERY">Near Delivery</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="OFF_PLAN">Off-Plan Launch</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="COMPLETED">Completed</option>
              <option value="SOLD_OUT">Sold Out</option>
              <option value="PLANNING">Planning</option>
            </select>

            {/* Property Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem]"
            >
              <option value="ALL">All Property Types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="TWIN_HOUSE">Twin House</option>
              <option value="DUPLEX">Duplex</option>
              <option value="CHALET">Chalet</option>
              <option value="PENTHOUSE">Penthouse</option>
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
                  Space Range (m²)
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
                  {["ALL", "1", "2", "3", "4+"].map((b) => (
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
                      {b}
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

            {/* Row 2: Financing, Finishing & View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Down Payment % */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Max Down Payment %
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10 or 15%"
                  value={maxDownPayment}
                  onChange={(e) => setMaxDownPayment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#9b7c52]"
                />
              </div>

              {/* Installment Years */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Min Installment Years
                </label>
                <select
                  value={installmentDuration}
                  onChange={(e) => setInstallmentDuration(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
                >
                  <option value="ALL">Any Installment Term</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="7">7+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>

              {/* Finishing Level */}
              <div className="space-y-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-700 font-bold block">
                  Unit Finishing Level
                </label>
                <select
                  value={finishing}
                  onChange={(e) => setFinishing(e.target.value)}
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
                  Scenic View
                </label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value)}
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
            </div>

            {/* Row 3: Neighborhood Area & Available Only checkbox */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                {uniqueAreas.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[0.65rem] uppercase text-stone-600">
                      Neighborhood:
                    </span>
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="bg-stone-50 border border-stone-300 px-2.5 py-1 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono text-[0.68rem]"
                    >
                      <option value="ALL">All Neighborhoods</option>
                      {uniqueAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={availableUnitsOnly}
                    onChange={(e) => setAvailableUnitsOnly(e.target.checked)}
                    className="w-4 h-4 text-[#9b7c52] accent-[#9b7c52] rounded border-stone-300"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-800 font-semibold">
                    Projects With Available Inventory Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-stone-400">
          Loading development portfolio...
        </div>
      ) : filteredProjectResults.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-300 bg-white p-8 space-y-3 shadow-sm">
          <Building2 className="h-8 w-8 text-stone-400 mx-auto" />
          <h3 className="text-sm font-medium text-stone-900">No projects match filter criteria</h3>
          <p className="font-mono text-xs text-stone-500 max-w-sm mx-auto">
            {activeFiltersCount > 0
              ? "Try resetting some filters or broadening your price and area criteria."
              : "No developments currently available in portfolio."}
          </p>
          {activeFiltersCount > 0 ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#182220] text-[#c5a880] hover:bg-[#9b7c52] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          ) : (
            canManage && (
              <button
                type="button"
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#182220] text-[#c5a880] hover:bg-[#9b7c52] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Launch Project</span>
              </button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjectResults.map(({ project, matchingUnits, totalUnitsInProject }) => {
            const types =
              project.projectTypes && project.projectTypes.length > 0
                ? project.projectTypes
                : project.projectType
                ? [project.projectType]
                : [];

            return (
              <div
                key={project._id}
                className="group bg-white border border-stone-200 hover:border-[#c5a880] transition-all flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Cover Image & Status Pill */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.name.en}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 left-3 font-mono text-[0.62rem] uppercase tracking-wider px-2 py-0.5 border shadow-sm ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status.replace("_", " ")}
                    </span>

                    {/* Delivery Date Badge */}
                    {project.deliveryDate && (
                      <span className="absolute top-3 right-3 font-mono text-[0.62rem] bg-black/60 text-stone-200 px-2 py-0.5 backdrop-blur-xs">
                        {project.deliveryDate}
                      </span>
                    )}

                    {/* City & Area pill */}
                    <div className="absolute bottom-2.5 left-3 text-white flex items-center gap-1 font-mono text-xs drop-shadow">
                      <MapPin className="h-3 w-3 text-[#c5a880]" />
                      <span>
                        {project.location.city}
                        {project.location.area ? ` &bull; ${project.location.area}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-stone-900 group-hover:text-[#9b7c52] transition-colors line-clamp-1">
                          {project.name.en}
                        </h3>
                        <span className="font-mono text-xs text-stone-500 shrink-0" dir="rtl">
                          {project.name.ar}
                        </span>
                      </div>

                      <p className="font-mono text-[0.68rem] text-stone-500 mt-1 line-clamp-1">
                        {project.location.address}
                      </p>
                    </div>

                    {/* Property Types Badges */}
                    {types.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {types.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[0.62rem] px-2 py-0.5 bg-[#fbf9f6] text-stone-700 border border-stone-200 capitalize"
                          >
                            {t.toString().toLowerCase().replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Starting Price & Area Range */}
                    <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-[0.62rem] text-stone-400 uppercase block">
                          Starting Price
                        </span>
                        <span className="text-stone-950 font-bold text-sm">
                          {formatCurrency(project.startingPrice)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[0.62rem] text-stone-400 uppercase block">
                          Space Range
                        </span>
                        <span className="text-stone-800 text-xs font-semibold">
                          {project.minArea && project.maxArea
                            ? `${project.minArea} - ${project.maxArea} m²`
                            : project.minArea
                            ? `From ${project.minArea} m²`
                            : "Flexible Layouts"}
                        </span>
                      </div>
                    </div>

                    {/* Matching Units & Inventory Indicator */}
                    <div className="pt-2 flex items-center justify-between text-xs font-mono text-stone-500">
                      <span>Inventory:</span>
                      <span className="text-stone-800 font-semibold">
                        {matchingUnits.length > 0
                          ? `${matchingUnits.length} matching units`
                          : `${totalUnitsInProject} total units`}
                      </span>
                    </div>

                    {/* Amenities Preview */}
                    {project.amenities && project.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="font-mono text-[0.6rem] px-1.5 py-0.5 bg-stone-50 text-stone-600 border border-stone-200"
                          >
                            {a}
                          </span>
                        ))}
                        {project.amenities.length > 3 && (
                          <span className="font-mono text-[0.6rem] px-1 text-stone-400">
                            +{project.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3.5 border-t border-stone-100 bg-[#fbf9f6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/units?projectId=${project._id}`}
                      className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-stone-800 hover:text-[#9b7c52] transition-colors font-medium px-2 py-1 bg-white border border-stone-200 hover:border-stone-400"
                    >
                      <KeyRound className="h-3 w-3 text-[#9b7c52]" />
                      <span>Units</span>
                    </Link>

                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                      title="View public page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(project)}
                        className="p-1.5 text-stone-600 hover:text-[#9b7c52] hover:bg-stone-200 transition-colors cursor-pointer"
                        title="Edit project details"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {user?.role === "ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project._id, project.name.en)}
                        title="Delete project"
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

      {/* Create / Edit Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onProjectCreated={handleProjectSaved}
        initialProject={editingProject}
      />
    </div>
  );
}
