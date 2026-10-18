import { PaginationMeta } from "../utils/apiResponse";
import { Project, IProjectDocument, Unit } from "../models";
import { ApiError } from "../utils/apiError";
import { CreateProjectInput, GetProjectsQuery, UpdateProjectInput } from "../validators/project.validator";

export interface PaginatedProjectsResult {
  projects: IProjectDocument[];
  meta: PaginationMeta;
}

export class ProjectService {
  static async getProjects(query: GetProjectsQuery): Promise<PaginatedProjectsResult> {
    const andConditions: any[] = [];

    // Filter by city
    if (query.city && query.city !== "ALL") {
      andConditions.push({ "location.city": { $regex: query.city, $options: "i" } });
    }

    // Filter by governorate
    if (query.governorate && query.governorate !== "ALL") {
      andConditions.push({ "location.governorate": { $regex: query.governorate, $options: "i" } });
    }

    // Filter by district/area
    if (query.area && query.area !== "ALL") {
      andConditions.push({ "location.area": { $regex: query.area, $options: "i" } });
    }

    // Filter by status with flexible alias mapping
    const statusVal = query.status || query.projectStatus;
    if (statusVal && statusVal !== "ALL") {
      const s = statusVal.toUpperCase();
      if (s === "READY") {
        andConditions.push({ status: { $in: ["READY", "COMPLETED"] } });
      } else if (s === "NEAR_DELIVERY") {
        andConditions.push({ status: { $in: ["NEAR_DELIVERY", "COMING_SOON"] } });
      } else {
        andConditions.push({ status: statusVal });
      }
    }

    // Filter by Property Type
    if (query.propertyType && query.propertyType !== "ALL") {
      const targetType = query.propertyType.toUpperCase();
      andConditions.push({
        $or: [
          { projectType: targetType },
          { projectTypes: targetType },
        ],
      });
    }

    // Filter by featured flag
    if (query.isFeatured !== undefined) {
      andConditions.push({ isFeatured: query.isFeatured });
    }

    // Price range filters
    if (query.minPrice !== undefined) {
      andConditions.push({
        $or: [
          { maxPrice: { $gte: query.minPrice } },
          { startingPrice: { $gte: query.minPrice } },
        ],
      });
    }
    if (query.maxPrice !== undefined) {
      andConditions.push({
        startingPrice: { $lte: query.maxPrice },
      });
    }

    // Area range filters
    if (query.minArea !== undefined) {
      andConditions.push({
        $or: [
          { maxArea: { $gte: query.minArea } },
          { minArea: { $gte: query.minArea } },
        ],
      });
    }
    if (query.maxArea !== undefined) {
      andConditions.push({
        $or: [
          { minArea: { $lte: query.maxArea } },
          { maxArea: { $lte: query.maxArea } },
        ],
      });
    }

    // Installment duration filter (years)
    const installmentYearsVal = query.installmentYears ?? query.installmentDuration;
    if (installmentYearsVal !== undefined) {
      const unitProjectIdsWithYears = await Unit.distinct("projectId", {
        installmentYears: { $gte: installmentYearsVal },
      });
      andConditions.push({
        $or: [
          { "paymentPlans.installmentYears": { $gte: installmentYearsVal } },
          { _id: { $in: unitProjectIdsWithYears } },
        ],
      });
    }

    // Down payment filters (%)
    const downPaymentLimit = query.downPaymentPercentage ?? query.maxDownPayment;
    if (downPaymentLimit !== undefined) {
      const unitProjectIdsWithDownPayment = await Unit.distinct("projectId", {
        downPaymentPercentage: { $lte: downPaymentLimit },
      });
      andConditions.push({
        $or: [
          { "paymentPlans.downPaymentPercentage": { $lte: downPaymentLimit } },
          { _id: { $in: unitProjectIdsWithDownPayment } },
        ],
      });
    }

    // Amenities filters
    if (query.amenity && query.amenity !== "ALL") {
      andConditions.push({ amenities: { $regex: query.amenity, $options: "i" } });
    }
    if (query.amenities) {
      const list = Array.isArray(query.amenities) ? query.amenities : [query.amenities];
      andConditions.push({ amenities: { $all: list } });
    }

    // Text search filter
    if (query.search) {
      const searchRegex = { $regex: query.search, $options: "i" };
      andConditions.push({
        $or: [
          { "name.en": searchRegex },
          { "name.ar": searchRegex },
          { "location.city": searchRegex },
          { "location.governorate": searchRegex },
          { "location.area": searchRegex },
          { "location.address": searchRegex },
          { developer: searchRegex },
        ],
      });
    }

    // Unit-dependent filtering:
    // If unit-level criteria (bedrooms, bathrooms, finishing, view, availableUnitsOnly, etc.) are specified,
    // find all projects that have AT LEAST ONE unit matching these criteria!
    const unitFilter: Record<string, any> = {};
    let isUnitFilterActive = false;

    if (query.availableUnitsOnly) {
      unitFilter.status = "AVAILABLE";
      isUnitFilterActive = true;
    }

    if (query.bedrooms && query.bedrooms !== "ALL") {
      isUnitFilterActive = true;
      if (query.bedrooms === "4+" || String(query.bedrooms).includes("+")) {
        unitFilter.bedrooms = { $gte: 4 };
      } else {
        const beds = parseInt(query.bedrooms, 10);
        if (!isNaN(beds)) unitFilter.bedrooms = beds;
      }
    }

    if (query.bathrooms && query.bathrooms !== "ALL") {
      isUnitFilterActive = true;
      if (query.bathrooms === "3+" || String(query.bathrooms).includes("+")) {
        unitFilter.bathrooms = { $gte: 3 };
      } else {
        const baths = parseInt(query.bathrooms, 10);
        if (!isNaN(baths)) unitFilter.bathrooms = baths;
      }
    }

    if (query.finishing && query.finishing !== "ALL") {
      isUnitFilterActive = true;
      unitFilter.finishing = query.finishing.toUpperCase();
    }

    if (query.view && query.view !== "ALL") {
      isUnitFilterActive = true;
      unitFilter.view = query.view.toUpperCase();
    }

    if (isUnitFilterActive) {
      const matchingProjectIds = await Unit.distinct("projectId", unitFilter);
      andConditions.push({ _id: { $in: matchingProjectIds } });
    }

    const filter: Record<string, any> = andConditions.length > 0 ? { $and: andConditions } : {};

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || "createdAt"]: query.sortOrder === "asc" ? 1 : -1,
    };

    const [projects, total] = await Promise.all([
      Project.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      projects,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getProjectByIdOrSlug(identifier: string) {
    let project: IProjectDocument | null = null;
    const mongoose = require("mongoose");

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      project = await Project.findById(identifier);
    }

    if (!project) {
      project = await Project.findOne({ slug: identifier.toLowerCase() });
    }

    if (!project) {
      const cleanSlug = identifier.toLowerCase().replace(/^proj-/, "");
      project = await Project.findOne({ slug: cleanSlug });
    }

    if (!project) {
      const words = identifier.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().split(/\s+/).filter(Boolean);
      for (const word of words) {
        if (word.length >= 3 && !["the", "and", "for"].includes(word)) {
          project = await Project.findOne({ slug: { $regex: word, $options: "i" } });
          if (project) break;
        }
      }
    }

    if (!project) {
      throw ApiError.notFound(`Project '${identifier}' not found`);
    }

    // Calculate real-time unit statistics for this project
    const unitStats = await Unit.aggregate([
      { $match: { projectId: project._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          minArea: { $min: "$area" },
          maxArea: { $max: "$area" },
        },
      },
    ]);

    const statsSummary = {
      totalUnits: 0,
      availableUnits: 0,
      reservedUnits: 0,
      soldUnits: 0,
      minPrice: project.startingPrice,
      maxPrice: project.maxPrice || project.startingPrice,
      minArea: project.minArea,
      maxArea: project.maxArea,
    };

    unitStats.forEach((stat) => {
      statsSummary.totalUnits += stat.count;
      if (stat._id === "AVAILABLE") statsSummary.availableUnits = stat.count;
      if (stat._id === "RESERVED") statsSummary.reservedUnits = stat.count;
      if (stat._id === "SOLD") statsSummary.soldUnits = stat.count;
      if (stat.minPrice && stat.minPrice < statsSummary.minPrice) statsSummary.minPrice = stat.minPrice;
      if (stat.maxPrice && stat.maxPrice > statsSummary.maxPrice) statsSummary.maxPrice = stat.maxPrice;
      if (stat.minArea && (!statsSummary.minArea || stat.minArea < statsSummary.minArea)) {
        statsSummary.minArea = stat.minArea;
      }
      if (stat.maxArea && (!statsSummary.maxArea || stat.maxArea > statsSummary.maxArea)) {
        statsSummary.maxArea = stat.maxArea;
      }
    });

    return {
      project,
      unitStats: statsSummary,
    };
  }

  static async getProjectBySlug(slug: string) {
    return this.getProjectByIdOrSlug(slug);
  }

  static async getProjectById(id: string) {
    return this.getProjectByIdOrSlug(id);
  }

  static async createProject(input: CreateProjectInput): Promise<IProjectDocument> {
    if (input.slug) {
      const existingSlug = await Project.findOne({ slug: input.slug.toLowerCase() });
      if (existingSlug) {
        throw ApiError.conflict(`Project with slug '${input.slug}' already exists`);
      }
    }

    const project = new Project(input);
    await project.save();
    return project;
  }

  static async updateProject(id: string, input: UpdateProjectInput): Promise<IProjectDocument> {
    const project = await Project.findById(id);
    if (!project) {
      throw ApiError.notFound("Project not found");
    }

    if (input.slug && input.slug.toLowerCase() !== project.slug) {
      const existingSlug = await Project.findOne({
        slug: input.slug.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw ApiError.conflict(`Project with slug '${input.slug}' already exists`);
      }
    }

    Object.assign(project, input);
    await project.save();
    return project;
  }

  static async deleteProject(id: string) {
    const project = await Project.findById(id);
    if (!project) {
      throw ApiError.notFound("Project not found");
    }

    // Cascade delete associated units
    const deleteUnitsResult = await Unit.deleteMany({ projectId: id });
    await project.deleteOne();

    return {
      deletedProjectId: id,
      deletedUnitsCount: deleteUnitsResult.deletedCount,
    };
  }
}
