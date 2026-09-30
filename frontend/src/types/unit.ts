export type UnitType =
  | "APARTMENT"
  | "DUPLEX"
  | "PENTHOUSE"
  | "COMMERCIAL"
  | "OFFICE"
  | "VILLA"
  | "TOWNHOUSE"
  | "TWIN_HOUSE"
  | "CHALET"
  | "LAND";

export type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type UnitFinishing =
  | "CORE_AND_SHELL"
  | "SEMI_FINISHED"
  | "FULLY_FINISHED";

export type UnitView =
  | "GARDEN"
  | "POOL"
  | "STREET"
  | "SEA"
  | "COMPOUND";

export interface IUnit {
  _id: string;
  projectId:
    | string
    | {
        _id: string;
        name: {
          en: string;
          ar: string;
        };
        slug?: string;
        coverImage?: string;
        status?: string;
      };
  unitNumber: string;
  type: UnitType;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  downPayment?: number;
  downPaymentPercentage?: number;
  installmentYears?: number;
  monthlyInstallment?: number;
  finishing?: UnitFinishing | string;
  view?: UnitView | string;
  status: UnitStatus;
  features?: string[];
  description?: { en: string; ar: string } | string;
  images?: string[];
  floorPlanUrl?: string;
  floorPlan?: string;
  createdAt: string;
  updatedAt: string;
}
