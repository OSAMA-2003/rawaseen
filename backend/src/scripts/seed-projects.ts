import { connectDB } from "../config/db";
import { Project, Unit, ProjectStatus, PropertyType, UnitType, UnitFinishing, UnitView, UnitStatus } from "../models";

const PROJECTS_SEED_DATA = [
  {
    name: {
      en: "Rawasin Horizon",
      ar: "رواسين هورايزون",
    },
    slug: "rawasin-horizon",
    developer: "Rawasin Real Estate",
    description: {
      en: "An architectural landmark in New Sohag City combining contemporary sculptural stone facades, expansive double-height interiors, and private sky courtyards designed for permanent serenity.",
      ar: "تحفة معمارية رائدة في مدينة سوهاج الجديدة تجمع بين الواجهات المعمارية المعاصرة، والمساحات المزدوجة الارتفاع، والأفنية الخاصة المصممة لسكينة تدوم.",
    },
    projectType: PropertyType.APARTMENT,
    projectTypes: [PropertyType.APARTMENT, PropertyType.DUPLEX, PropertyType.PENTHOUSE],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    coverImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "Main Boulevard, New Sohag City",
      city: "New Sohag City",
      governorate: "Sohag",
      area: "Central District",
      coordinates: {
        lat: 26.559,
        lng: 31.6957,
      },
      latitude: 26.559,
      longitude: 31.6957,
    },
    amenities: [
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
    ],
    startingPrice: 2850000,
    maxPrice: 6200000,
    minArea: 135,
    maxArea: 320,
    deliveryDate: "Q4 2026",
    paymentPlans: [
      {
        title: "10% Down Payment / 7 Years",
        downPaymentPercentage: 10,
        installmentYears: 7,
        monthlyInstallment: 30500,
        installmentFrequency: "MONTHLY",
        description: "10% down payment with comfortable monthly installments over 7 years.",
      },
      {
        title: "15% Down Payment / 8 Years",
        downPaymentPercentage: 15,
        installmentYears: 8,
        monthlyInstallment: 25200,
        installmentFrequency: "MONTHLY",
        description: "15% down payment with extended 8-year financing schedule.",
      },
    ],
    unitsCount: 84,
    totalUnits: 84,
    availableUnits: 19,
    isFeatured: true,
  },
  {
    name: {
      en: "Rawasin Al-Hada Residences",
      ar: "مساكن رواسين الهدا",
    },
    slug: "rawasin-al-hada-residences",
    developer: "Rawasin Real Estate",
    description: {
      en: "Exclusive sanctuary of private villas and duplex residences nestled in the serene district of New Sohag City, drawn around natural limestone, shaded porticos, and water sanctuaries.",
      ar: "ملاذ حصري من الفلل والمنازل السكنية في مدينة سوهاج الجديدة، شُيدت بأرقى الخامات الطبيعية، والممرات المظللة، والمسطحات المائية الساحرة.",
    },
    projectType: PropertyType.VILLA,
    projectTypes: [PropertyType.VILLA, PropertyType.TWIN_HOUSE, PropertyType.TOWNHOUSE],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "Corniche Promenade, New Sohag City",
      city: "New Sohag City",
      governorate: "Sohag",
      area: "Corniche District",
      coordinates: {
        lat: 26.562,
        lng: 31.699,
      },
      latitude: 26.562,
      longitude: 31.699,
    },
    amenities: [
      "Parking",
      "Private Pool",
      "Swimming Pool",
      "Clubhouse",
      "Gym",
      "Security",
      "CCTV",
      "Kids Area",
      "Green Areas",
      "Mosque",
      "Walking Area",
    ],
    startingPrice: 4500000,
    maxPrice: 9200000,
    minArea: 280,
    maxArea: 580,
    deliveryDate: "Q2 2027",
    paymentPlans: [
      {
        title: "10% Down Payment / 7 Years",
        downPaymentPercentage: 10,
        installmentYears: 7,
        monthlyInstallment: 48000,
        installmentFrequency: "MONTHLY",
        description: "10% reservation down payment, quarterly and monthly installments.",
      },
      {
        title: "20% Down Payment / 10 Years",
        downPaymentPercentage: 20,
        installmentYears: 10,
        monthlyInstallment: 30000,
        installmentFrequency: "MONTHLY",
        description: "Luxury extended plan over a decade.",
      },
    ],
    unitsCount: 36,
    totalUnits: 36,
    availableUnits: 8,
    isFeatured: true,
  },
  {
    name: {
      en: "Rawasin Central Tower",
      ar: "برج رواسين سنترال",
    },
    slug: "rawasin-central-tower",
    developer: "Rawasin Real Estate",
    description: {
      en: "High-rise modern vertical ecosystem towering over Sohag commercial corridor, blending smart residential studios and penthouses with exclusive commercial boutiques.",
      ar: "منظومة معمارية رأسية شاهقة على محور سوهاج التجاري الحيوي، تجمع بين الاستوديوهات والبنتهاوس السكني الفاخر والمساحات التجارية الراقية.",
    },
    projectType: PropertyType.APARTMENT,
    projectTypes: [PropertyType.APARTMENT, PropertyType.COMMERCIAL, PropertyType.OFFICE],
    status: ProjectStatus.NEAR_DELIVERY,
    coverImage:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "Al-Gomhouria Street, Sohag",
      city: "Sohag",
      governorate: "Sohag",
      area: "East Sohag",
      coordinates: {
        lat: 26.5569,
        lng: 31.6948,
      },
      latitude: 26.5569,
      longitude: 31.6948,
    },
    amenities: [
      "Parking",
      "Swimming Pool",
      "Gym",
      "Security",
      "CCTV",
      "Commercial Area",
      "Mosque",
      "Walking Area",
    ],
    startingPrice: 1950000,
    maxPrice: 5100000,
    minArea: 85,
    maxArea: 240,
    deliveryDate: "Near Delivery (Q1 2026)",
    paymentPlans: [
      {
        title: "10% Down Payment / 5 Years",
        downPaymentPercentage: 10,
        installmentYears: 5,
        monthlyInstallment: 29200,
        installmentFrequency: "MONTHLY",
        description: "10% down payment with immediate handover scheduling.",
      },
    ],
    unitsCount: 120,
    totalUnits: 120,
    availableUnits: 14,
    isFeatured: false,
  },
  {
    name: {
      en: "Rawasin Narjis Oasis",
      ar: "واحة رواسين النرجس",
    },
    slug: "rawasin-narjis-oasis",
    developer: "Rawasin Real Estate",
    description: {
      en: "Contemporary family-oriented community featuring modern townhouses and garden apartments surrounded by pocket parks, walking boulevards, and community amenities in New Sohag City.",
      ar: "مجتمع عائلي متطور يضم تاون هاوس عصري وشقق بحدائق خاصة، محاطة بالمسطحات الخضراء ومسارات المشي والمرافق الحيوية المتكاملة في مدينة سوهاج الجديدة.",
    },
    projectType: PropertyType.TOWNHOUSE,
    projectTypes: [PropertyType.TOWNHOUSE, PropertyType.TWIN_HOUSE, PropertyType.APARTMENT],
    status: ProjectStatus.READY,
    coverImage:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "University Boulevard, New Sohag City",
      city: "New Sohag City",
      governorate: "Sohag",
      area: "Universities District",
      coordinates: {
        lat: 26.565,
        lng: 31.688,
      },
      latitude: 26.565,
      longitude: 31.688,
    },
    amenities: [
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
    ],
    startingPrice: 2150000,
    maxPrice: 4300000,
    minArea: 145,
    maxArea: 310,
    deliveryDate: "Ready for Delivery",
    paymentPlans: [
      {
        title: "Immediate Handover Plan / 5 Years",
        downPaymentPercentage: 15,
        installmentYears: 5,
        monthlyInstallment: 30400,
        installmentFrequency: "MONTHLY",
        description: "15% down payment with key handover within 30 days.",
      },
    ],
    unitsCount: 60,
    totalUnits: 60,
    availableUnits: 7,
    isFeatured: false,
  },
  {
    name: {
      en: "Rawasin Nile Sanctuary",
      ar: "ملاذ رواسين النيلي",
    },
    slug: "rawasin-coastal-sanctuary",
    developer: "Rawasin Real Estate",
    description: {
      en: "Ultra-luxury waterfront resort villas and private river chalets on the Nile Corniche of Sohag, boasting sunset horizons and private river moorings.",
      ar: "فلل وشاليهات منتجعية فاخرة على واجهة كورنيش النيل في سوهاج، بإطلالات خلابة على غروب شمس النيل ومراسٍ خاصة.",
    },
    projectType: PropertyType.VILLA,
    projectTypes: [PropertyType.VILLA, PropertyType.CHALET, PropertyType.DUPLEX],
    status: ProjectStatus.UNDER_CONSTRUCTION,
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "Nile Corniche Promenade",
      city: "Sohag",
      governorate: "Sohag",
      area: "Nile Corniche",
      coordinates: {
        lat: 26.56,
        lng: 31.7,
      },
      latitude: 26.56,
      longitude: 31.7,
    },
    amenities: [
      "Parking",
      "Private Pool",
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
    ],
    startingPrice: 6800000,
    maxPrice: 14500000,
    minArea: 260,
    maxArea: 720,
    deliveryDate: "Q4 2027",
    paymentPlans: [
      {
        title: "10% Down Payment / 7 Years",
        downPaymentPercentage: 10,
        installmentYears: 7,
        monthlyInstallment: 72800,
        installmentFrequency: "MONTHLY",
        description: "10% down payment with milestone construction disbursements.",
      },
    ],
    unitsCount: 20,
    totalUnits: 20,
    availableUnits: 6,
    isFeatured: true,
  },
  {
    name: {
      en: "Skyline Residence",
      ar: "سكاي لاين ريزيدنس",
    },
    slug: "skyline-residence",
    developer: "Rawasin Developments",
    description: {
      en: "Premier integrated residential development in Sohag New City, featuring contemporary apartments, duplex lofts, vibrant green courtyards, and state-of-the-art community clubhouse.",
      ar: "مشروع سكني متكامل رائد في مدينة سوهاج الجديدة، يضم شقق عصرية، دوبلكسات واسعة، مساحات خضراء ممتدة، وكلوب هاوس متكامل الخدمات.",
    },
    projectType: PropertyType.APARTMENT,
    projectTypes: [PropertyType.APARTMENT, PropertyType.DUPLEX, PropertyType.PENTHOUSE],
    status: ProjectStatus.NEAR_DELIVERY,
    coverImage:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80",
    ],
    masterPlan:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=80",
    location: {
      address: "University Avenue Promenade",
      city: "Sohag New City",
      governorate: "Sohag",
      area: "Central District",
      coordinates: {
        lat: 26.559,
        lng: 31.6957,
      },
      latitude: 26.559,
      longitude: 31.6957,
    },
    amenities: [
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
    ],
    startingPrice: 1850000,
    maxPrice: 3400000,
    minArea: 120,
    maxArea: 210,
    deliveryDate: "Near Delivery (Q3 2026)",
    paymentPlans: [
      {
        title: "10% Down Payment / 7 Years",
        downPaymentPercentage: 10,
        installmentYears: 7,
        monthlyInstallment: 19800,
        installmentFrequency: "MONTHLY",
        description: "10% down payment with equal installments over 7 full years.",
      },
    ],
    unitsCount: 96,
    totalUnits: 96,
    availableUnits: 15,
    isFeatured: true,
  },
];

const UNITS_SEED_TEMPLATE = [
  // For Rawasin Horizon
  {
    projectSlug: "rawasin-horizon",
    unitNumber: "H-401",
    type: UnitType.PENTHOUSE,
    floor: 4,
    area: 320,
    bedrooms: 4,
    bathrooms: 4,
    price: 5200000,
    downPayment: 520000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 55700,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.POOL,
    status: UnitStatus.AVAILABLE,
    features: ["Private Sky Terrace", "Double-Height 6.2m Ceiling", "Smart KNX Hub"],
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
  },
  {
    projectSlug: "rawasin-horizon",
    unitNumber: "H-203",
    type: UnitType.APARTMENT,
    floor: 2,
    area: 145,
    bedrooms: 3,
    bathrooms: 3,
    price: 2850000,
    downPayment: 285000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 30500,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.GARDEN,
    status: UnitStatus.AVAILABLE,
    features: ["Panoramic Garden View Balcony", "German Kitchen Cabinetry"],
    images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"],
  },
  {
    projectSlug: "rawasin-horizon",
    unitNumber: "H-105",
    type: UnitType.DUPLEX,
    floor: 1,
    area: 235,
    bedrooms: 3,
    bathrooms: 3,
    price: 3950000,
    downPayment: 395000,
    downPaymentPercentage: 10,
    installmentYears: 8,
    monthlyInstallment: 37000,
    finishing: UnitFinishing.SEMI_FINISHED,
    view: UnitView.COMPOUND,
    status: UnitStatus.AVAILABLE,
    features: ["Private Ground Garden Patio", "Direct Underground Parking Lift"],
    images: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"],
  },
  // For Rawasin Al-Hada
  {
    projectSlug: "rawasin-al-hada-residences",
    unitNumber: "Villa-01",
    type: UnitType.VILLA,
    floor: 0,
    area: 580,
    bedrooms: 5,
    bathrooms: 6,
    price: 8900000,
    downPayment: 890000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 95300,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.GARDEN,
    status: UnitStatus.AVAILABLE,
    features: ["Private Swimming Pool & Sun Deck", "Private Elevator", "Home Cinema"],
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
  },
  {
    projectSlug: "rawasin-al-hada-residences",
    unitNumber: "Twin-04",
    type: UnitType.TWIN_HOUSE,
    floor: 0,
    area: 360,
    bedrooms: 4,
    bathrooms: 4,
    price: 5400000,
    downPayment: 540000,
    downPaymentPercentage: 10,
    installmentYears: 8,
    monthlyInstallment: 50600,
    finishing: UnitFinishing.SEMI_FINISHED,
    view: UnitView.COMPOUND,
    status: UnitStatus.AVAILABLE,
    features: ["Expansive Private Landscaped Backyard", "Rooftop Barbecue Terrace"],
    images: ["https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80"],
  },
  // For Rawasin Central Tower
  {
    projectSlug: "rawasin-central-tower",
    unitNumber: "T-1402",
    type: UnitType.APARTMENT,
    floor: 14,
    area: 125,
    bedrooms: 2,
    bathrooms: 2,
    price: 2450000,
    downPayment: 245000,
    downPaymentPercentage: 10,
    installmentYears: 5,
    monthlyInstallment: 36700,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.STREET,
    status: UnitStatus.AVAILABLE,
    features: ["Floor-to-Ceiling High Glass Wall", "Sohag Skyline Panorama"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
  },
  // For Rawasin Narjis Oasis
  {
    projectSlug: "rawasin-narjis-oasis",
    unitNumber: "Town-102",
    type: UnitType.TOWNHOUSE,
    floor: 0,
    area: 245,
    bedrooms: 3,
    bathrooms: 3,
    price: 2650000,
    downPayment: 265000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 28400,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.GARDEN,
    status: UnitStatus.AVAILABLE,
    features: ["Private Garden Lawn", "Adjacent to Community Park & Mosque"],
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"],
  },
  // For Rawasin Coastal Sanctuary
  {
    projectSlug: "rawasin-coastal-sanctuary",
    unitNumber: "Villa-Sea02",
    type: UnitType.VILLA,
    floor: 0,
    area: 720,
    bedrooms: 6,
    bathrooms: 7,
    price: 9800000,
    downPayment: 980000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 105000,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.SEA,
    status: UnitStatus.AVAILABLE,
    features: ["Direct Private River Berth", "Nile Sunset Facing", "Infinity Pool"],
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"],
  },
  // For Skyline Residence
  {
    projectSlug: "skyline-residence",
    unitNumber: "A-101",
    type: UnitType.APARTMENT,
    floor: 1,
    area: 135,
    bedrooms: 3,
    bathrooms: 2,
    price: 1850000,
    downPayment: 185000,
    downPaymentPercentage: 10,
    installmentYears: 7,
    monthlyInstallment: 19800,
    finishing: UnitFinishing.FULLY_FINISHED,
    view: UnitView.GARDEN,
    status: UnitStatus.AVAILABLE,
    features: ["Landscaped Courtyard Facing", "Spacious Master Suite with Dressing Room"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
  },
  {
    projectSlug: "skyline-residence",
    unitNumber: "D-01",
    type: UnitType.DUPLEX,
    floor: 0,
    area: 210,
    bedrooms: 4,
    bathrooms: 3,
    price: 3200000,
    downPayment: 320000,
    downPaymentPercentage: 10,
    installmentYears: 10,
    monthlyInstallment: 24000,
    finishing: UnitFinishing.CORE_AND_SHELL,
    view: UnitView.COMPOUND,
    status: UnitStatus.AVAILABLE,
    features: ["Private Ground Garden (65 sqm)", "Internal Architectural Staircase"],
    images: ["https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"],
  },
];

async function seedProjectsAndUnits() {
  console.log("🌱 Connecting to MongoDB to seed rich projects & units...");
  await connectDB();

  console.log("Upserting projects...");
  const projectMap = new Map<string, string>();

  for (const projData of PROJECTS_SEED_DATA) {
    const updated = await Project.findOneAndUpdate(
      { slug: projData.slug },
      { $set: projData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    projectMap.set(projData.slug, updated._id.toString());
    console.log(`✅ Project upserted: ${projData.name.en} (${updated._id})`);
  }

  console.log("\nUpserting units...");
  for (const unitData of UNITS_SEED_TEMPLATE) {
    const projectId = projectMap.get(unitData.projectSlug);
    if (!projectId) {
      console.warn(`Could not find project id for slug ${unitData.projectSlug}`);
      continue;
    }

    const { projectSlug, ...unitFields } = unitData;
    const updatedUnit = await Unit.findOneAndUpdate(
      { projectId, unitNumber: unitFields.unitNumber },
      { $set: { ...unitFields, projectId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Unit upserted: ${unitFields.unitNumber} in ${projectSlug} (${updatedUnit._id})`);
  }

  console.log("\n🎉 Seed completed successfully!");
  process.exit(0);
}

seedProjectsAndUnits().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
