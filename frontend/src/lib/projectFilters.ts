import { IProject, PropertyType } from "@/types/project";
import { IUnit, UnitStatus, UnitFinishing, UnitView } from "@/types/unit";

export interface ProjectFilterCriteria {
  searchQuery?: string;
  governorate?: string;
  city?: string;
  area?: string;
  propertyType?: string; // "ALL" | PropertyType
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: string; // "ALL" | "1" | "2" | "3" | "4+"
  bathrooms?: string; // "ALL" | "1" | "2" | "3+"
  projectStatus?: string; // "ALL" | "UNDER_CONSTRUCTION" | "READY" | "NEAR_DELIVERY"
  paymentType?: "ALL" | "CASH" | "INSTALLMENTS";
  minDownPayment?: number;
  maxDownPayment?: number;
  installmentDuration?: string; // "ALL" | "1" | "3" | "5" | "7" | "10"
  finishing?: string; // "ALL" | "CORE_AND_SHELL" | "SEMI_FINISHED" | "FULLY_FINISHED"
  view?: string; // "ALL" | "GARDEN" | "POOL" | "STREET" | "SEA" | "COMPOUND"
  availableUnitsOnly?: boolean;
  sortBy?: "newest" | "priceAsc" | "priceDesc" | "areaDesc";
}

export interface FilteredProjectResult {
  project: IProject;
  matchingUnits: IUnit[];
  totalUnitsInProject: number;
}

/**
 * Checks if a specific unit matches all unit-level criteria
 */
export function doesUnitMatchCriteria(unit: IUnit, criteria: ProjectFilterCriteria): boolean {
  // Availability
  if (criteria.availableUnitsOnly && unit.status !== "AVAILABLE") {
    return false;
  }

  // Property Type
  if (criteria.propertyType && criteria.propertyType !== "ALL") {
    const unitType = (unit.type || "").toUpperCase().replace(/[\s-]/g, "_");
    const targetType = criteria.propertyType.toUpperCase().replace(/[\s-]/g, "_");
    if (unitType !== targetType) return false;
  }

  // Price range
  if (typeof criteria.minPrice === "number" && !isNaN(criteria.minPrice)) {
    if (unit.price < criteria.minPrice) return false;
  }
  if (typeof criteria.maxPrice === "number" && !isNaN(criteria.maxPrice) && criteria.maxPrice > 0) {
    if (unit.price > criteria.maxPrice) return false;
  }

  // Area range
  if (typeof criteria.minArea === "number" && !isNaN(criteria.minArea)) {
    if (unit.area < criteria.minArea) return false;
  }
  if (typeof criteria.maxArea === "number" && !isNaN(criteria.maxArea) && criteria.maxArea > 0) {
    if (unit.area > criteria.maxArea) return false;
  }

  // Bedrooms
  if (criteria.bedrooms && criteria.bedrooms !== "ALL") {
    if (criteria.bedrooms === "4+") {
      if (unit.bedrooms < 4) return false;
    } else {
      const targetBeds = parseInt(criteria.bedrooms, 10);
      if (!isNaN(targetBeds) && unit.bedrooms !== targetBeds) return false;
    }
  }

  // Bathrooms
  if (criteria.bathrooms && criteria.bathrooms !== "ALL") {
    if (criteria.bathrooms === "3+") {
      if (unit.bathrooms < 3) return false;
    } else {
      const targetBaths = parseInt(criteria.bathrooms, 10);
      if (!isNaN(targetBaths) && unit.bathrooms !== targetBaths) return false;
    }
  }

  // Finishing
  if (criteria.finishing && criteria.finishing !== "ALL") {
    const unitFinishing = (unit.finishing || "").toUpperCase().replace(/[\s-]/g, "_");
    const targetFinishing = criteria.finishing.toUpperCase().replace(/[\s-]/g, "_");
    if (unitFinishing !== targetFinishing) return false;
  }

  // View
  if (criteria.view && criteria.view !== "ALL") {
    const unitView = (unit.view || "").toUpperCase().replace(/[\s-]/g, "_");
    const targetView = criteria.view.toUpperCase().replace(/[\s-]/g, "_");
    if (unitView !== targetView) return false;
  }

  // Down payment percentage or amount
  if (typeof criteria.minDownPayment === "number" && !isNaN(criteria.minDownPayment)) {
    const dp = unit.downPaymentPercentage || (unit.price > 0 && unit.downPayment ? (unit.downPayment / unit.price) * 100 : 0);
    if (dp < criteria.minDownPayment) return false;
  }
  if (typeof criteria.maxDownPayment === "number" && !isNaN(criteria.maxDownPayment) && criteria.maxDownPayment > 0) {
    const dp = unit.downPaymentPercentage || (unit.price > 0 && unit.downPayment ? (unit.downPayment / unit.price) * 100 : 0);
    if (dp > criteria.maxDownPayment) return false;
  }

  // Installment duration (years)
  if (criteria.installmentDuration && criteria.installmentDuration !== "ALL") {
    const targetYears = parseInt(criteria.installmentDuration, 10);
    if (!isNaN(targetYears)) {
      const unitYears = unit.installmentYears || 0;
      if (unitYears < targetYears) return false;
    }
  }

  return true;
}

/**
 * Checks if any unit-level criteria are currently active
 */
export function hasActiveUnitLevelCriteria(criteria: ProjectFilterCriteria): boolean {
  if (criteria.propertyType && criteria.propertyType !== "ALL") return true;
  if (typeof criteria.minPrice === "number" && criteria.minPrice > 0) return true;
  if (typeof criteria.maxPrice === "number" && criteria.maxPrice > 0) return true;
  if (typeof criteria.minArea === "number" && criteria.minArea > 0) return true;
  if (typeof criteria.maxArea === "number" && criteria.maxArea > 0) return true;
  if (criteria.bedrooms && criteria.bedrooms !== "ALL") return true;
  if (criteria.bathrooms && criteria.bathrooms !== "ALL") return true;
  if (criteria.finishing && criteria.finishing !== "ALL") return true;
  if (criteria.view && criteria.view !== "ALL") return true;
  if (typeof criteria.minDownPayment === "number" && criteria.minDownPayment > 0) return true;
  if (typeof criteria.maxDownPayment === "number" && criteria.maxDownPayment > 0) return true;
  if (criteria.installmentDuration && criteria.installmentDuration !== "ALL") return true;
  if (criteria.availableUnitsOnly) return true;
  return false;
}

/**
 * Normalizes status strings for flexible matching
 */
function normalizeStatus(st?: string): string {
  const s = (st || "").toUpperCase().replace(/[\s-]/g, "_").trim();
  if (s === "COMPLETED") return "READY";
  if (s === "COMING_SOON") return "NEAR_DELIVERY";
  return s;
}

/**
 * Filters projects based on project data AND their constituent units
 */
export function filterProjectsWithUnits(
  projects: IProject[],
  allUnits: IUnit[],
  criteria: ProjectFilterCriteria
): FilteredProjectResult[] {
  const query = (criteria.searchQuery || "").toLowerCase().trim();
  const isUnitCriteriaActive = hasActiveUnitLevelCriteria(criteria);

  // Group units by projectId
  const unitsByProjectId = new Map<string, IUnit[]>();
  allUnits.forEach((unit) => {
    const pId = typeof unit.projectId === "object" ? unit.projectId?._id : unit.projectId;
    if (!pId) return;
    const existing = unitsByProjectId.get(pId) || [];
    existing.push(unit);
    unitsByProjectId.set(pId, existing);
  });

  const results: FilteredProjectResult[] = [];

  for (const project of projects) {
    // 1. Project-level filters:
    // Location: Governorate
    if (criteria.governorate && criteria.governorate !== "ALL") {
      if (project.location?.governorate?.toLowerCase() !== criteria.governorate.toLowerCase()) {
        continue;
      }
    }

    // Location: City
    if (criteria.city && criteria.city !== "ALL") {
      if (project.location?.city?.toLowerCase() !== criteria.city.toLowerCase()) {
        continue;
      }
    }

    // Location: Area
    if (criteria.area && criteria.area !== "ALL") {
      if (project.location?.area?.toLowerCase() !== criteria.area.toLowerCase()) {
        continue;
      }
    }

    // Project Status
    if (criteria.projectStatus && criteria.projectStatus !== "ALL") {
      const pStatus = normalizeStatus(project.status);
      const targetStatus = normalizeStatus(criteria.projectStatus);
      if (pStatus !== targetStatus) {
        continue;
      }
    }

    // Payment Type (Cash / Installments)
    if (criteria.paymentType && criteria.paymentType !== "ALL") {
      if (criteria.paymentType === "INSTALLMENTS") {
        const hasPlans = project.paymentPlans && project.paymentPlans.length > 0;
        if (!hasPlans) continue;
      }
    }

    // Search Query matching
    if (query) {
      const matchNameEn = project.name.en?.toLowerCase().includes(query);
      const matchNameAr = project.name.ar?.includes(query);
      const matchCity = project.location?.city?.toLowerCase().includes(query);
      const matchGov = project.location?.governorate?.toLowerCase().includes(query);
      const matchArea = project.location?.area?.toLowerCase().includes(query);
      const matchAddress = project.location?.address?.toLowerCase().includes(query);
      const matchDev = project.developer?.toLowerCase().includes(query);
      const matchDesc = project.description?.en?.toLowerCase().includes(query) || project.description?.ar?.includes(query);

      if (!matchNameEn && !matchNameAr && !matchCity && !matchGov && !matchArea && !matchAddress && !matchDev && !matchDesc) {
        continue;
      }
    }

    // 2. Unit-level matching:
    const projectUnits = unitsByProjectId.get(project._id) || [];

    if (isUnitCriteriaActive) {
      if (projectUnits.length > 0) {
        // Find all units in this project that match all unit-level criteria
        const matchingUnits = projectUnits.filter((u) => doesUnitMatchCriteria(u, criteria));

        // If units exist for this project, at least one must match!
        if (matchingUnits.length === 0) {
          continue;
        }

        results.push({
          project,
          matchingUnits,
          totalUnitsInProject: projectUnits.length,
        });
      } else {
        // Project has no units logged yet (e.g. newly launched project or admin created)
        // If criteria requires unit-exclusive properties, exclude project:
        const hasStrictUnitOnlyCriteria =
          (criteria.bedrooms && criteria.bedrooms !== "ALL") ||
          (criteria.bathrooms && criteria.bathrooms !== "ALL") ||
          (criteria.finishing && criteria.finishing !== "ALL") ||
          (criteria.view && criteria.view !== "ALL") ||
          criteria.availableUnitsOnly;

        if (hasStrictUnitOnlyCriteria) {
          continue;
        }

        // Check if project's own specifications match the criteria:
        if (criteria.propertyType && criteria.propertyType !== "ALL") {
          const pType = (project.projectType || "").toUpperCase();
          const pTypes = (project.projectTypes || []).map((t) => t.toUpperCase());
          const target = criteria.propertyType.toUpperCase();
          if (pType !== target && !pTypes.includes(target)) continue;
        }

        if (typeof criteria.minPrice === "number" && criteria.minPrice > 0) {
          const topPrice = project.maxPrice || project.startingPrice;
          if (topPrice < criteria.minPrice) continue;
        }
        if (typeof criteria.maxPrice === "number" && criteria.maxPrice > 0) {
          if (project.startingPrice > criteria.maxPrice) continue;
        }

        if (typeof criteria.minArea === "number" && criteria.minArea > 0) {
          const topArea = project.maxArea || project.minArea || 0;
          if (topArea < criteria.minArea) continue;
        }
        if (typeof criteria.maxArea === "number" && criteria.maxArea > 0) {
          const lowArea = project.minArea || 0;
          if (lowArea > criteria.maxArea) continue;
        }

        if (criteria.installmentDuration && criteria.installmentDuration !== "ALL") {
          const targetY = parseInt(criteria.installmentDuration, 10);
          const hasPlan = project.paymentPlans?.some((p) => p.installmentYears >= targetY);
          if (!hasPlan) continue;
        }

        if (typeof criteria.maxDownPayment === "number" && criteria.maxDownPayment > 0) {
          const hasPlan = project.paymentPlans?.some((p) => p.downPaymentPercentage <= criteria.maxDownPayment!);
          if (!hasPlan) continue;
        }

        results.push({
          project,
          matchingUnits: [],
          totalUnitsInProject: 0,
        });
      }
    } else {
      // No unit-level criteria specified
      if (criteria.availableUnitsOnly && (project.availableUnits || 0) <= 0) {
        continue;
      }

      results.push({
        project,
        matchingUnits: projectUnits,
        totalUnitsInProject: projectUnits.length,
      });
    }
  }

  // 3. Sorting
  const sortBy = criteria.sortBy || "newest";
  results.sort((a, b) => {
    if (sortBy === "priceAsc") {
      return a.project.startingPrice - b.project.startingPrice;
    }
    if (sortBy === "priceDesc") {
      return b.project.startingPrice - a.project.startingPrice;
    }
    if (sortBy === "areaDesc") {
      const areaA = a.project.maxArea || a.project.minArea || 0;
      const areaB = b.project.maxArea || b.project.minArea || 0;
      return areaB - areaA;
    }
    // Newest
    return new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime();
  });

  return results;
}
