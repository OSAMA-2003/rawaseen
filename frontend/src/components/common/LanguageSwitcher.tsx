"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "minimal" | "button";
}

export function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-wider text-stone-700 hover:text-stone-900 transition-colors cursor-pointer ${className}`}
        aria-label="Toggle language"
        title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
      >
        <Globe className="h-3.5 w-3.5 text-[#9b7c52]" />
        <span>{language === "en" ? "عربي" : "EN"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-2 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 hover:border-stone-400 transition-all font-mono text-[0.7rem] uppercase tracking-wider text-stone-800 shadow-2xs cursor-pointer ${className}`}
      aria-label="Toggle language"
      title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="h-3.5 w-3.5 text-[#9b7c52]" />
      <span className="font-semibold text-stone-900">
        {language === "en" ? "العربية" : "English"}
      </span>
      <span className="text-[0.6rem] text-stone-400">
        {language === "en" ? "AR" : "EN"}
      </span>
    </button>
  );
}
