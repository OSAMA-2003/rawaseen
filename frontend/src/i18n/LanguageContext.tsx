"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import i18n, { SupportedLanguage } from "./config";
import { useTranslation as useI18nTranslation } from "react-i18next";

interface LanguageContextType {
  language: SupportedLanguage;
  direction: "ltr" | "rtl";
  isRTL: boolean;
  changeLanguage: (lang: SupportedLanguage) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, options?: any) => string;
  getLocalized: (enVal?: string, arVal?: string) => string;
  formatPrice: (amount?: number) => string;
  localizeStatus: (status: string) => string;
  localizeUnitType: (type: string) => string;
  localizeAmenity: (amenity: string) => string;
  localizeCity: (city: string) => string;
  localizeFinishing: (finishing?: string) => string;
  localizeView: (view?: string) => string;
}

const statusMap: Record<string, { en: string; ar: string }> = {
  ACTIVE: { en: "Active", ar: "متاح للحجز والبيع" },
  AVAILABLE: { en: "Available", ar: "متاح" },
  COMING_SOON: { en: "Coming Soon", ar: "قريباً" },
  NEAR_DELIVERY: { en: "Near Delivery", ar: "تسليم وشيك" },
  UNDER_CONSTRUCTION: { en: "Under Construction", ar: "تحت الإنشاء" },
  COMPLETED: { en: "Ready / Completed", ar: "جاهز للتسليم / مكتمل" },
  READY: { en: "Ready to Move", ar: "جاهز للاستلام الفوري" },
  OFF_PLAN: { en: "Off-Plan", ar: "على الخارطة" },
  RESERVED: { en: "Reserved", ar: "محجوز" },
  SOLD: { en: "Sold", ar: "مباع" },
  SOLD_OUT: { en: "Sold Out", ar: "مباع بالكامل" },
};

const unitTypeMap: Record<string, { en: string; ar: string }> = {
  APARTMENT: { en: "Apartment", ar: "شقة سكنية" },
  VILLA: { en: "Villa", ar: "فيلا مستقلة" },
  TOWNHOUSE: { en: "Townhouse", ar: "تاون هاوس" },
  TWIN_HOUSE: { en: "Twin House", ar: "توين هاوس" },
  DUPLEX: { en: "Duplex", ar: "دوبلكس" },
  CHALET: { en: "Chalet", ar: "شاليه" },
  COMMERCIAL: { en: "Commercial", ar: "تجاري" },
  LAND: { en: "Land", ar: "أرض استثمارية" },
  PENTHOUSE: { en: "Penthouse", ar: "بنتهاوس" },
  OFFICE: { en: "Office", ar: "مكتب إداري" },
};

const finishingMap: Record<string, { en: string; ar: string }> = {
  CORE_AND_SHELL: { en: "Core & Shell", ar: "بدون تشطيب (محارة وبناء)" },
  SEMI_FINISHED: { en: "Semi Finished", ar: "نصف تشطيب" },
  FULLY_FINISHED: { en: "Fully Finished", ar: "تشطيب كامل فاخر" },
};

const viewMap: Record<string, { en: string; ar: string }> = {
  GARDEN: { en: "Garden View", ar: "إطلالة حديقة" },
  POOL: { en: "Pool View", ar: "إطلالة مسبح" },
  STREET: { en: "Main Street", ar: "إطلالة شارع رئيسي" },
  SEA: { en: "Direct Sea View", ar: "إطلالة بحرية مباشرة" },
  COMPOUND: { en: "Compound View", ar: "إطلالة داخل الكمبوند" },
};

const amenityMap: Record<string, { en: string; ar: string }> = {
  "Parking": { en: "Parking", ar: "مواقف سيارات" },
  "Swimming Pool": { en: "Swimming Pool", ar: "مسبح" },
  "Private Pool": { en: "Private Pool", ar: "مسبح خاص" },
  "Clubhouse": { en: "Clubhouse", ar: "كلوب هاوس" },
  "Gym": { en: "Fitness & Gym", ar: "جيم ونادي صحي" },
  "Security": { en: "24/7 Security", ar: "أمن وحراسة 24/7" },
  "CCTV": { en: "CCTV Surveillance", ar: "كاميرات مراقبة متطورة" },
  "Kids Area": { en: "Kids Play Area", ar: "منطقة ألعاب أطفال" },
  "Green Areas": { en: "Green Landscaped Areas", ar: "مساحات خضراء ولاندسكيب" },
  "Commercial Area": { en: "Commercial Hub", ar: "منطقة تجارية ومطاعم" },
  "Mosque": { en: "Mosque", ar: "مسجد" },
  "Walking Area": { en: "Walking & Jogging Boulevard", ar: "مسار للمشي والركض" },
  "Smart Home Automation": { en: "Smart Home", ar: "أنظمة منزلية ذكية" },
  "Concierge & Security 24/7": { en: "Concierge 24/7", ar: "خدمة كونسيرج وأمن 24/7" },
  "Underground Parking": { en: "Underground Parking", ar: "مواقف سفلية خاصة" },
  "Wellness Spa & Gym": { en: "Wellness Spa & Gym", ar: "سبا ونادي استرخاء" },
  "Sky Lounge": { en: "Sky Lounge", ar: "سكاي لاونج بانورامي" },
};

const cityMap: Record<string, { en: string; ar: string }> = {
  "New Sohag City": { en: "New Sohag City", ar: "مدينة سوهاج الجديدة" },
  "Sohag": { en: "Sohag", ar: "سوهاج" },
  "Sohag New City": { en: "New Sohag City", ar: "مدينة سوهاج الجديدة" },
  "Cairo": { en: "Cairo", ar: "القاهرة" },
  "New Cairo": { en: "New Cairo", ar: "القاهرة الجديدة" },
  "Sheikh Zayed": { en: "Sheikh Zayed", ar: "الشيخ زايد" },
  "Giza": { en: "Giza", ar: "الجيزة" },
  "Alexandria": { en: "Alexandria", ar: "الإسكندرية" },
  "North Coast": { en: "North Coast", ar: "الساحل الشمالي" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18nTranslation();
  const [language, setLanguage] = useState<SupportedLanguage>("ar");

  const direction = language === "ar" ? "rtl" : "ltr";
  const isRTL = direction === "rtl";

  // Synchronize document dir and lang attributes
  const syncDocument = useCallback((lang: SupportedLanguage) => {
    if (typeof document !== "undefined") {
      const dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      if (lang === "ar") {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  }, []);

  useEffect(() => {
    syncDocument(language);
    i18n.changeLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("rawasin_lang", "ar");
    }
  }, [language, syncDocument]);

  const changeLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rawasin_lang", lang);
    }
    i18n.changeLanguage(lang);
    syncDocument(lang);
  };

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage = language === "en" ? "ar" : "en";
    changeLanguage(nextLang);
  };

  const getLocalized = (enVal?: string, arVal?: string): string => {
    if (language === "ar") {
      return arVal || enVal || "";
    }
    return enVal || arVal || "";
  };

  // Format all numbers/prices using English digits (0-9) regardless of language
  const formatPrice = (amount?: number): string => {
    if (typeof amount !== "number" || isNaN(amount)) return "—";
    const formattedNumber = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(amount);
    return language === "ar" ? `${formattedNumber} ج.م` : `${formattedNumber} EGP`;
  };

  const localizeStatus = (status: string): string => {
    const key = (status || "").toUpperCase().replace(/[\s-]/g, "_").trim();
    if (statusMap[key]) {
      return language === "ar" ? statusMap[key].ar : statusMap[key].en;
    }
    return status.replace(/_/g, " ");
  };

  const localizeUnitType = (type: string): string => {
    const key = (type || "").toUpperCase().replace(/[\s-]/g, "_").trim();
    if (unitTypeMap[key]) {
      return language === "ar" ? unitTypeMap[key].ar : unitTypeMap[key].en;
    }
    return type;
  };

  const localizeFinishing = (finishing?: string): string => {
    if (!finishing) return "—";
    const key = finishing.toUpperCase().replace(/[\s-]/g, "_").trim();
    if (finishingMap[key]) {
      return language === "ar" ? finishingMap[key].ar : finishingMap[key].en;
    }
    return finishing;
  };

  const localizeView = (view?: string): string => {
    if (!view) return "—";
    const key = view.toUpperCase().replace(/[\s-]/g, "_").trim();
    if (viewMap[key]) {
      return language === "ar" ? viewMap[key].ar : viewMap[key].en;
    }
    return view;
  };

  const localizeAmenity = (amenity: string): string => {
    const trimmed = (amenity || "").trim();
    if (amenityMap[trimmed]) {
      return language === "ar" ? amenityMap[trimmed].ar : amenityMap[trimmed].en;
    }
    return amenity;
  };

  const localizeCity = (city: string): string => {
    const trimmed = (city || "").trim();
    if (cityMap[trimmed]) {
      return language === "ar" ? cityMap[trimmed].ar : cityMap[trimmed].en;
    }
    return city;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        changeLanguage,
        setLanguage: changeLanguage,
        toggleLanguage,
        t,
        getLocalized,
        formatPrice,
        localizeStatus,
        localizeUnitType,
        localizeFinishing,
        localizeView,
        localizeAmenity,
        localizeCity,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
