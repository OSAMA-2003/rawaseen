"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Kanban,
  List,
  Search,
  Plus,
  RefreshCw,
  Phone,
  MessageSquare,
  Building2,
  ChevronRight,
  Filter,
  User,
  Coins,
  Sparkles,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { ILead, KanbanBoardData, LeadSource, LeadStatus } from "../../../types/crm";
import { CreateLeadModal } from "../../../components/crm/CreateLeadModal";
import { LeadDetailDrawer } from "../../../components/crm/LeadDetailDrawer";

const STAGES: {
  key: LeadStatus;
  title: string;
  titleAr: string;
  badgeColor: string;
  headerBorder: string;
}[] = [
  {
    key: "NEW",
    title: "New Leads",
    titleAr: "عملاء جدد",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    headerBorder: "border-blue-500",
  },
  {
    key: "CONTACTED",
    title: "Contacted",
    titleAr: "تم التواصل",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    headerBorder: "border-purple-500",
  },
  {
    key: "INTERESTED",
    title: "Interested",
    titleAr: "مهتم",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    headerBorder: "border-amber-500",
  },
  {
    key: "SITE_VISIT",
    title: "Site Visit",
    titleAr: "معاينة ميدانية",
    badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
    headerBorder: "border-sky-500",
  },
  {
    key: "NEGOTIATION",
    title: "Negotiation",
    titleAr: "تفاوض",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    headerBorder: "border-indigo-500",
  },
  {
    key: "WON",
    title: "Won Deals",
    titleAr: "صفقات ناجحة",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    headerBorder: "border-emerald-500",
  },
  {
    key: "LOST",
    title: "Lost",
    titleAr: "غير مكتمل",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    headerBorder: "border-rose-500",
  },
];

export default function LeadsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [kanbanData, setKanbanData] = useState<KanbanBoardData>({
    NEW: [],
    CONTACTED: [],
    INTERESTED: [],
    SITE_VISIT: [],
    NEGOTIATION: [],
    WON: [],
    LOST: [],
  });
  const [allLeads, setAllLeads] = useState<ILead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getLeadPrice = (lead: ILead) => {
    return (
      lead.unitId?.price ||
      (lead.projectId as any)?.startingPrice ||
      lead.budget
    );
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Parallel fetch kanban aggregation and list
      const [kanbanRes, listRes] = await Promise.all([
        api.get<KanbanBoardData>("/leads/kanban"),
        api.get<ILead[]>("/leads?limit=100"),
      ]);

      if (kanbanRes.data) {
        setKanbanData(kanbanRes.data);
      }
      if (listRes.data) {
        setAllLeads(listRes.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load CRM data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadUpdated = (updatedLead: ILead) => {
    // Update local lead in drawer
    setSelectedLead(updatedLead);
    // Refresh board
    fetchLeads();
  };

  const handleLeadCreated = (newLead: ILead) => {
    fetchLeads();
  };

  const handleQuickAdvance = async (e: React.MouseEvent, lead: ILead) => {
    e.stopPropagation();
    const stageFlow: LeadStatus[] = [
      "NEW",
      "CONTACTED",
      "INTERESTED",
      "SITE_VISIT",
      "NEGOTIATION",
      "WON",
    ];
    const currentIndex = stageFlow.indexOf(lead.status);
    if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIndex + 1];
      try {
        await api.patch(`/leads/${lead._id}`, { status: nextStage });
        toast.success(`Advanced ${lead.name} to ${nextStage}`);
        fetchLeads();
      } catch (err: any) {
        toast.error(err.message || "Failed to advance stage");
      }
    }
  };

  // Filter leads by search and source
  const filteredKanbanData = useMemo(() => {
    const result: KanbanBoardData = {
      NEW: [],
      CONTACTED: [],
      INTERESTED: [],
      SITE_VISIT: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    };

    const q = searchQuery.toLowerCase().trim();

    for (const stage of Object.keys(kanbanData) as LeadStatus[]) {
      result[stage] = (kanbanData[stage] || []).filter((lead) => {
        const matchesSearch =
          !q ||
          lead.name.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          (lead.email && lead.email.toLowerCase().includes(q));

        const matchesSource =
          selectedSource === "ALL" || lead.source === selectedSource;

        return matchesSearch && matchesSource;
      });
    }

    return result;
  }, [kanbanData, searchQuery, selectedSource]);

  const totalLeadsCount = useMemo(() => {
    return Object.values(filteredKanbanData).reduce(
      (sum, list) => sum + list.length,
      0
    );
  }, [filteredKanbanData]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#9b7c52]">
            <Sparkles className="h-3 w-3" />
            <span>Real Estate CRM & Deal Pipeline</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-normal text-stone-900">
              CRM Leads & Pipeline
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 border border-stone-200 bg-white text-[#9b7c52] shadow-xs">
              {totalLeadsCount} Leads
            </span>
          </div>
        </div>

        {/* View Switcher, Search & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-stone-200 bg-stone-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-white text-stone-900 font-semibold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-stone-900 font-semibold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by client or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-60 bg-white border border-stone-300 px-3 py-1.5 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9b7c52] shadow-xs"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
          </div>

          {/* Source Dropdown Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-white border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#9b7c52] font-mono uppercase text-[0.68rem] shadow-xs"
          >
            <option value="ALL">All Sources</option>
            <option value="WEBSITE_INQUIRY">Website Form</option>
            <option value="DIRECT_CALL">Direct Call</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WALK_IN">Sales Center</option>
            <option value="CAMPAIGN">Campaign</option>
            <option value="REFERRAL">Referral</option>
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchLeads}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* New Lead Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#9b7c52] transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Main Board View: Kanban */}
      {viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-6 select-none min-h-[calc(100vh-250px)]">
          {STAGES.map((stage) => {
            const leadsInStage = filteredKanbanData[stage.key] || [];

            return (
              <div
                key={stage.key}
                className="w-80 shrink-0 bg-stone-50 border border-stone-200 flex flex-col justify-between max-h-[calc(100vh-250px)] shadow-xs"
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-b border-stone-200 bg-white border-t-2 ${stage.headerBorder} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-stone-900 tracking-wide">
                      {stage.title}
                    </h3>
                    <span className="font-mono text-[0.65rem] text-stone-500">
                      {stage.titleAr}
                    </span>
                  </div>
                  <span className="font-mono text-[0.65rem] px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 font-semibold">
                    {leadsInStage.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {leadsInStage.length === 0 ? (
                    <div className="py-8 text-center text-stone-400 font-mono text-[0.68rem] border border-dashed border-stone-200 bg-white/50">
                      No leads in this stage
                    </div>
                  ) : (
                    leadsInStage.map((lead) => (
                      <div
                        key={lead._id}
                        onClick={() => setSelectedLead(lead)}
                        className="group p-3.5 bg-white hover:bg-stone-50/80 border border-stone-200 hover:border-stone-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 relative"
                      >
                        {/* Card Header: Client Name & Source */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-stone-900 group-hover:text-[#9b7c52] transition-colors leading-tight">
                            {lead.name}
                          </h4>
                          <span className="font-mono text-[0.6rem] text-stone-500 uppercase tracking-wider shrink-0">
                            {lead.source.replace("_", " ")}
                          </span>
                        </div>

                        {/* Phone & Project */}
                        <div className="space-y-1 font-mono text-[0.68rem] text-stone-600">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-stone-400" />
                            <span>{lead.phone}</span>
                          </div>

                          {lead.projectId?.name?.en && (
                            <div className="flex items-center gap-1.5 text-stone-800">
                              <Building2 className="h-3 w-3 text-[#9b7c52]" />
                              <span className="truncate">
                                {lead.projectId.name.en}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Budget & Next Stage Quick Advance */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="font-mono text-[0.68rem] text-[#9b7c52] font-semibold">
                            {formatCurrency(getLeadPrice(lead))}
                          </span>

                          {/* Quick advance to next stage if not won/lost */}
                          {lead.status !== "WON" && lead.status !== "LOST" && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdvance(e, lead)}
                              title="Advance to next pipeline stage"
                              className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Assigned Agent & Last Activity */}
                        <div className="flex items-center justify-between font-mono text-[0.6rem] text-stone-400 pt-1">
                          <span className="truncate">
                            {lead.assignedTo?.name
                              ? `Agent: ${lead.assignedTo.name}`
                              : "Unassigned"}
                          </span>
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-[0.65rem] text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-normal">Client Name</th>
                  <th className="py-3 px-4 font-normal">Phone</th>
                  <th className="py-3 px-4 font-normal">Project</th>
                  <th className="py-3 px-4 font-normal">Price</th>
                  <th className="py-3 px-4 font-normal">Stage</th>
                  <th className="py-3 px-4 font-normal">Source</th>
                  <th className="py-3 px-4 font-normal">Assigned Agent</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-stone-500 font-mono text-xs"
                    >
                      No leads match current criteria.
                    </td>
                  </tr>
                ) : (
                  allLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-stone-900 font-sans font-medium text-xs">
                        {lead.name}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{lead.phone}</td>
                      <td className="py-3 px-4 text-stone-800">
                        {lead.projectId?.name?.en || "—"}
                      </td>
                      <td className="py-3 px-4 text-[#9b7c52] font-semibold">
                        {formatCurrency(getLeadPrice(lead))}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 border text-[0.6rem] uppercase tracking-wider bg-stone-100 border-stone-200 text-stone-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[0.65rem] uppercase">
                        {lead.source.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {lead.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="font-mono text-[0.65rem] text-[#9b7c52] hover:underline uppercase tracking-wider cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Inspector Drawer for Lead Details */}
      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={handleLeadUpdated}
      />

      {/* Modal Dialog for Registering New Lead */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeadCreated={handleLeadCreated}
      />
    </div>
  );
}
