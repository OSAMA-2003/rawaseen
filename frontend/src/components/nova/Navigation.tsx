"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Languages, Menu, X, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

interface NavigationProps {
  onOpenInquiry?: () => void;
}

export function Navigation({ onOpenInquiry }: NavigationProps = {}) {
  const { t, language, setLanguage } = useLanguage();

  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const isArabic = language === "ar";

  const languagesList = [
    {
      code: "ar" as const,
      nativeName: "العربية",
      englishName: "Arabic",
      badge: "AR",
      subtext: "جمهورية مصر العربية",
    },
    {
      code: "en" as const,
      nativeName: "English",
      englishName: "English",
      badge: "EN",
      subtext: "International",
    },
  ];

  const links = [
    {
      label: isArabic ? "الرئيسية" : "Home",
      href: "/",
    },
    {
      label: t("nav.projects"),
      href: "/projects",
    },
    {
      label: t("nav.units"),
      href: "/units",
    },
    {
      label: t("nav.vision"),
      href: "/#vision",
    },
    {
      label: t("nav.blueprint"),
      href: "/#about",
    },
    {
      label: t("nav.contact"),
      href: "#contact",
    },
  ];

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };

    if (langDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownOpen]);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;

      raf = requestAnimationFrame(() => {
        setCompact(window.scrollY > 60);
        raf = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setLangDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Floating Capsule Header */}
      <header
        ref={navRef}
        className={`fixed inset-x-0 z-50 flex justify-center px-4 transition-all duration-500 ${compact ? "top-3 md:top-4" : "top-5 md:top-7"
          }`}
      >
        <nav
          aria-label="Primary"
          className={`flex w-full max-w-[1360px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#152320]/90 px-4 py-2.5 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.32)] backdrop-blur-2xl transition-all duration-300 md:rounded-full md:px-7 md:py-3 ${compact
            ? "py-2 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.4)] md:py-2.5"
            : ""
            }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 transition-opacity duration-300 hover:opacity-90"
            aria-label="Rawasin Home"
          >
            <img
              src="/logo-white.png"
              alt="Rawasin"
              className="h-7 w-auto object-contain brightness-110 sm:h-8 md:h-9"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group relative py-1 font-mono text-[0.78rem] tracking-wide text-stone-200/90 transition-colors hover:text-[#c5a880]"
                >
                  {link.label}

                  <span className="absolute inset-x-0 bottom-0 h-[1.5px] origin-center scale-x-0 bg-[#c5a880] transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {/* Professional Language Switcher Dropdown */}
            <div ref={langDropdownRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
                aria-label={isArabic ? "تغيير لغة الموقع" : "Change site language"}
                className={`group flex items-center gap-2 rounded-full border transition-all duration-300 px-3.5 py-1.5 backdrop-blur-md cursor-pointer ${
                  langDropdownOpen
                    ? "border-[#c5a880] bg-[#c5a880]/15 text-white shadow-[0_0_20px_rgba(197,168,128,0.25)]"
                    : "border-white/15 bg-white/[0.06] text-stone-200 hover:border-[#c5a880]/60 hover:bg-[#c5a880]/10 hover:text-white"
                }`}
              >
                <Languages className="h-3.5 w-3.5 text-[#c5a880] transition-transform duration-300 group-hover:rotate-12" />

                <span className="font-mono text-[0.7rem] font-semibold tracking-wider text-stone-100">
                  {isArabic ? "العربية" : "English"}
                </span>

                <span className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[0.6rem] text-[#c5a880] font-bold uppercase tracking-wider">
                  {isArabic ? "AR" : "EN"}
                </span>

                <ChevronDown
                  className={`h-3 w-3 text-stone-400 transition-transform duration-300 ${
                    langDropdownOpen ? "rotate-180 text-[#c5a880]" : "group-hover:translate-y-0.5"
                  }`}
                />
              </button>

              {/* Floating Dropdown Menu */}
              {langDropdownOpen && (
                <div
                  role="listbox"
                  className={`absolute ${
                    isArabic ? "left-0" : "right-0"
                  } top-full mt-2.5 w-60 rounded-2xl border border-white/15 bg-[#121f1c]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-200`}
                >
                  <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-stone-400">
                      {isArabic ? "اختر اللغة" : "Select Language"}
                    </span>
                    <span className="font-mono text-[0.6rem] text-[#c5a880] font-semibold">
                      {isArabic ? "2 لغات" : "2 Languages"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {languagesList.map((item) => {
                      const isSelected = language === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setLanguage(item.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                            item.code === "ar" ? "text-right" : "text-left"
                          } ${
                            isSelected
                              ? "bg-[#c5a880]/20 text-white border border-[#c5a880]/40 shadow-xs"
                              : "text-stone-300 hover:bg-white/[0.08] hover:text-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[0.65rem] font-bold ${
                                isSelected
                                  ? "bg-[#c5a880] text-[#111c1a]"
                                  : "bg-white/10 text-stone-300"
                              }`}
                            >
                              {item.badge}
                            </span>

                            <div className="flex flex-col leading-tight">
                              <span
                                className={`text-xs font-semibold ${
                                  item.code === "ar" ? "font-arabic" : "font-sans"
                                }`}
                              >
                                {item.nativeName}
                              </span>
                              <span className="font-mono text-[0.58rem] text-stone-400">
                                {item.englishName} • {item.subtext}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="h-4 w-4 text-[#c5a880] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={isArabic ? "فتح القائمة" : "Open menu"}
              className="flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] p-2.5 text-stone-200 transition-all duration-300 hover:bg-white/[0.14] hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-0 z-[60] bg-[#111c1a] text-white transition-[clip-path,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden ${open
          ? "pointer-events-auto [clip-path:inset(0_0_0%_0)] opacity-100"
          : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0"
          }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between p-6 sm:p-8">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              aria-label="Rawasin Home"
            >
              <img
                src="/logo-white.png"
                alt="Rawasin"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-3">
              {/* Mobile Language Switcher Segmented Control */}
              <div className="flex items-center rounded-full border border-white/15 bg-white/[0.06] p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`rounded-full px-3 py-1 font-mono text-[0.68rem] font-semibold transition-all duration-300 cursor-pointer ${
                    language === "ar"
                      ? "bg-[#c5a880] text-[#111c1a] shadow-sm font-bold"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-full px-3 py-1 font-mono text-[0.68rem] font-semibold transition-all duration-300 cursor-pointer ${
                    language === "en"
                      ? "bg-[#c5a880] text-[#111c1a] shadow-sm font-bold"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={isArabic ? "إغلاق القائمة" : "Close menu"}
                className="cursor-pointer rounded-xl bg-white/10 p-2 text-stone-300 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Drawer Navigation Links */}
          <ul className="my-auto space-y-4">
            {links.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-2 text-3xl font-medium tracking-tight text-stone-100 transition-colors hover:text-[#d1ad75]"
                >
                  <span className="font-mono text-xs tracking-wider text-[#d1ad75]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>


        </div>
      </div>
    </>
  );
}
