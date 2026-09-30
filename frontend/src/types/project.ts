export type ProjectStatus =
  | "ACTIVE"
  | "COMING_SOON"
  | "SOLD_OUT"
  | "INACTIVE"
  | "PLANNING"
  | "UNDER_CONSTRUCTION"
  | "COMPLETED"
  | "OFF_PLAN"
  | "READY"
  | "NEAR_DELIVERY";

export type PropertyType =
  | "APARTMENT"
  | "VILLA"
  | "TOWNHOUSE"
  | "TWIN_HOUSE"
  | "DUPLEX"
  | "CHALET"
  | "COMMERCIAL"
  | "LAND"
  | "PENTHOUSE"
  | "OFFICE";

export type InstallmentFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMI_ANNUAL"
  | "ANNUAL";

export interface IPaymentPlan {
  _id?: string;
  title: string;
  downPaymentPercentage: number;
  installmentYears: number;
  monthlyInstallment?: number;
  installmentFrequency?: InstallmentFrequency;
  discountPercentage?: number;
  deliveryPaymentPercentage?: number;
  description?: string;
}

export interface IProject {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  description: {
    en: string;
    ar: string;
  };
  developer: string;
  projectType?: PropertyType | string;
  projectTypes?: PropertyType[];
  status: ProjectStatus;
  coverImage: string;
  images?: string[];
  gallery: string[];
  masterPlan?: string;
  location: {
    address: string;
    city: string;
    governorate: string;
    area?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    latitude?: number;
    longitude?: number;
  };
  startingPrice: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  deliveryDate?: string;
  amenities: string[];
  paymentPlans?: IPaymentPlan[];
  unitsCount?: number;
  totalUnits?: number;
  availableUnits?: number;
  isFeatured: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}
