import { PaginationMeta } from "../utils/apiResponse";
import { IUnitDocument, Project, Unit, PropertyType } from "../models";
import { ApiError } from "../utils/apiError";
import { CreateUnitInput, GetUnitsQuery, UpdateUnitInput } from "../validators/unit.validator";

export interface PaginatedUnitsResult {
  units: IUnitDocument[];
  meta: PaginationMeta;
}

export class UnitService {
  /**
   * Synchronizes project metrics based on its current units
   */
  private static async syncProjectAggregates(projectId: string) {
    try {
      const stats = await Unit.aggregate([
        { $match: { projectId: new (require("mongoose").Types.ObjectId)(projectId) } },
        {
          $group: {
            _id: null,
            totalUnits: { $sum: 1 },
            availableUnits: {
              $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] },
            },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            minArea: { $min: "$area" },
            maxArea: { $max: "$area" },
            types: { $addToSet: "$type" },
          },
        },
      ]);

      if (stats.length > 0) {
        const s = stats[0];
        await Project.findByIdAndUpdate(projectId, {
          startingPrice: s.minPrice,
          maxPrice: s.maxPrice,
          minArea: s.minArea,
          maxArea: s.maxArea,
          unitsCount: s.totalUnits,
          totalUnits: s.totalUnits,
          availableUnits: s.availableUnits,
          projectTypes: s.types,
        });
      }
    } catch (err) {
      console.warn("Could not sync project aggregates:", err);
    }
  }

  static async getUnits(query: GetUnitsQuery): Promise<PaginatedUnitsResult> {
    const andConditions: any[] = [];

    if (query.projectId) {
      andConditions.push({ projectId: query.projectId });
    }

    if (query.type && query.type !== "ALL") {
      andConditions.push({ type: query.type.toUpperCase() });
    }

    if (query.status && query.status !== "ALL") {
      andConditions.push({ status: query.status.toUpperCase() });
    }

    if (query.finishing && query.finishing !== "ALL") {
      andConditions.push({ finishing: query.finishing.toUpperCase() });
    }

    if (query.view && query.view !== "ALL") {
      andConditions.push({ view: query.view.toUpperCase() });
    }

    if (query.bedrooms !== undefined && query.bedrooms !== "ALL") {
      const bStr = String(query.bedrooms);
      if (bStr === "4+" || bStr.includes("+")) {
        andConditions.push({ bedrooms: { $gte: 4 } });
      } else {
        const b = parseInt(bStr, 10);
        if (!isNaN(b)) andConditions.push({ bedrooms: b });
      }
    }

    if (query.bathrooms !== undefined && query.bathrooms !== "ALL") {
      const bStr = String(query.bathrooms);
      if (bStr === "3+" || bStr.includes("+")) {
        andConditions.push({ bathrooms: { $gte: 3 } });
      } else {
        const b = parseInt(bStr, 10);
        if (!isNaN(b)) andConditions.push({ bathrooms: b });
      }
    }

    if (query.floor !== undefined && query.floor !== "ALL") {
      const fStr = String(query.floor);
      if (fStr === "5+" || fStr.includes("+")) {
        andConditions.push({ floor: { $gte: 5 } });
      } else {
        const f = parseInt(fStr, 10);
        if (!isNaN(f)) andConditions.push({ floor: f });
      }
    }

    if (query.installmentYears !== undefined) {
      andConditions.push({ installmentYears: { $gte: query.installmentYears } });
    }

    if (query.minPrice !== undefined) {
      andConditions.push({ price: { $gte: query.minPrice } });
    }
    if (query.maxPrice !== undefined) {
      andConditions.push({ price: { $lte: query.maxPrice } });
    }

    if (query.minArea !== undefined) {
      andConditions.push({ area: { $gte: query.minArea } });
    }
    if (query.maxArea !== undefined) {
      andConditions.push({ area: { $lte: query.maxArea } });
    }

    if (query.downPaymentPercentage !== undefined) {
      andConditions.push({ downPaymentPercentage: { $lte: query.downPaymentPercentage } });
    }

    if (query.maxDownPayment !== undefined) {
      andConditions.push({ downPayment: { $lte: query.maxDownPayment } });
    }

    if (query.minDownPayment !== undefined) {
      andConditions.push({ downPayment: { $gte: query.minDownPayment } });
    }

    if (query.monthlyInstallment !== undefined) {
      andConditions.push({ monthlyInstallment: { $lte: query.monthlyInstallment } });
    }

    // Location filter via parent project
    if (
      (query.city && query.city !== "ALL") ||
      (query.governorate && query.governorate !== "ALL") ||
      (query.area && query.area !== "ALL")
    ) {
      const projFilter: Record<string, any> = {};
      if (query.city && query.city !== "ALL") {
        projFilter["location.city"] = { $regex: query.city, $options: "i" };
      }
      if (query.governorate && query.governorate !== "ALL") {
        projFilter["location.governorate"] = { $regex: query.governorate, $options: "i" };
      }
      if (query.area && query.area !== "ALL") {
        projFilter["location.area"] = { $regex: query.area, $options: "i" };
      }

      const matchingProjectIds = await Project.find(projFilter).distinct("_id");
      if (query.projectId) {
        andConditions.push({
          projectId: {
            $in: [query.projectId].filter((id) =>
              matchingProjectIds.map(String).includes(String(id))
            ),
          },
        });
      } else {
        andConditions.push({ projectId: { $in: matchingProjectIds } });
      }
    }

    // Text search query (unit code, project name, or area)
    if (query.search) {
      const searchRegex = { $regex: query.search, $options: "i" };
      const matchingProjectIds = await Project.find({
        $or: [
          { "name.en": searchRegex },
          { "name.ar": searchRegex },
          { "location.city": searchRegex },
          { "location.area": searchRegex },
          { developer: searchRegex },
        ],
      }).distinct("_id");

      andConditions.push({
        $or: [
          { unitNumber: searchRegex },
          { projectId: { $in: matchingProjectIds } },
        ],
      });
    }

    const filter: Record<string, any> = andConditions.length > 0 ? { $and: andConditions } : {};

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const sortOptions: Record<string, 1 | -1> = {
      [query.sortBy || "createdAt"]: query.sortOrder === "asc" ? 1 : -1,
    };

    const [units, total] = await Promise.all([
      Unit.find(filter)
        .populate("projectId", "name slug location coverImage status developer startingPrice")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Unit.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      units,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getUnitById(id: string): Promise<IUnitDocument> {
    const unit = await Unit.findById(id).populate("projectId", "name slug location coverImage startingPrice status developer paymentPlans");
    if (!unit) {
      throw ApiError.notFound(`Unit with ID '${id}' not found`);
    }
    return unit;
  }

  static async createUnit(input: CreateUnitInput): Promise<IUnitDocument> {
    // 1. Verify parent project exists
    const project = await Project.findById(input.projectId);
    if (!project) {
      throw ApiError.notFound(`Parent Project with ID '${input.projectId}' not found`);
    }

    // 2. Check for duplicate unit number in this project
    const existingUnit = await Unit.findOne({
      projectId: input.projectId,
      unitNumber: input.unitNumber.trim(),
    });
    if (existingUnit) {
      throw ApiError.conflict(
        `Unit with number '${input.unitNumber}' already exists in project '${project.name.en}'`
      );
    }

    const data: any = { ...input };
    if (data.floorPlanUrl && !data.floorPlan) {
      data.floorPlan = data.floorPlanUrl;
    }

    const unit = new Unit(data);
    await unit.save();

    // Sync project aggregates
    await this.syncProjectAggregates(input.projectId);

    return unit;
  }

  static async updateUnit(id: string, input: UpdateUnitInput): Promise<IUnitDocument> {
    const unit = await Unit.findById(id);
    if (!unit) {
      throw ApiError.notFound("Unit not found");
    }

    // If updating unit number or project, check uniqueness
    const targetProjectId = input.projectId || unit.projectId.toString();
    const targetUnitNumber = input.unitNumber ? input.unitNumber.trim() : unit.unitNumber;

    if (input.projectId || input.unitNumber) {
      const existing = await Unit.findOne({
        projectId: targetProjectId,
        unitNumber: targetUnitNumber,
        _id: { $ne: id },
      });
      if (existing) {
        throw ApiError.conflict(`Unit '${targetUnitNumber}' already exists in the target project`);
      }
    }

    const originalProjectId = unit.projectId.toString();
    const data: any = { ...input };
    if (data.floorPlanUrl && !data.floorPlan) {
      data.floorPlan = data.floorPlanUrl;
    }
    Object.assign(unit, data);
    await unit.save();

    // Sync project aggregates
    await this.syncProjectAggregates(targetProjectId);
    if (originalProjectId !== targetProjectId) {
      await this.syncProjectAggregates(originalProjectId);
    }

    return unit;
  }

  static async deleteUnit(id: string): Promise<IUnitDocument> {
    const unit = await Unit.findById(id);
    if (!unit) {
      throw ApiError.notFound("Unit not found");
    }

    const projectId = unit.projectId.toString();
    await unit.deleteOne();

    // Sync project aggregates
    await this.syncProjectAggregates(projectId);

    return unit;
  }
}
