"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Search,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

export function DashboardHeader({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const getBreadcrumbTitle = () => {
    if (pathname === "/dashboard") return t("dashboard.overview");
    if (pathname.startsWith("/dashboard/leads")) return t("dashboard.leads");
    if (pathname.startsWith("/dashboard/followups")) return t("dashboard.followups");
    if (pathname.startsWith("/dashboard/projects")) return t("dashboard.projects");
    if (pathname.startsWith("/dashboard/units")) return t("dashboard.units");
    if (pathname.startsWith("/dashboard/team")) return t("dashboard.team");
    return t("dashboard.workspace");
  };

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle navigation drawer"
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-stone-400 uppercase tracking-wider hidden sm:inline">
            {t("dashboard.workspace")}
          </span>
          <span className="text-stone-300 hidden sm:inline">&bull;</span>
          <span className="text-stone-900 uppercase tracking-wider font-semibold">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right side: Search, Language Switcher, Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Search Mockup */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder={t("dashboard.searchPlaceholder")}
            className={`w-64 bg-stone-50 border border-stone-200 px-3.5 py-1.5 ${isRTL ? "pr-9 text-right" : "pl-9 text-left"} text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#c5a880] focus:bg-white transition-colors`}
          />
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-2 h-3.5 w-3.5 text-stone-400`} />
        </div>

        {/* Interactive Language Switcher */}
        <LanguageSwitcher variant="minimal" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-colors"
          >
            <div className="h-7 w-7 rounded-none bg-[#c5a880]/20 border border-[#c5a880]/40 text-[#8c6b3e] font-mono text-xs flex items-center justify-center font-bold">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "RW"}
            </div>
            <div className={`hidden md:block ${isRTL ? "text-right" : "text-left"}`}>
              <div className="text-xs font-semibold text-stone-900 leading-none">
                {user?.name || "Staff Member"}
              </div>
              <div className="font-mono text-[0.6rem] text-[#8c6b3e] uppercase tracking-wider mt-0.5 font-medium">
                {user?.role || t("dashboard.guest")}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-stone-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-56 bg-white border border-stone-200 shadow-xl z-50 p-2 space-y-1`}>
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs font-semibold text-stone-900">{user?.name}</p>
                  <p className="font-mono text-[0.65rem] text-stone-500 truncate">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 font-mono text-[0.6rem] text-[#8c6b3e] uppercase tracking-wider px-1.5 py-0.5 border border-[#c5a880]/30 bg-[#c5a880]/10">
                    Role: {user?.role}
                  </span>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-mono tracking-wider uppercase text-[0.68rem]"
                >
                  <Shield className="h-3.5 w-3.5 text-[#9b7c52]" />
                  {t("dashboard.overview")}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-mono tracking-wider uppercase text-[0.68rem] ${isRTL ? "text-right" : "text-left"} border-t border-stone-100 mt-1`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("dashboard.signOut")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
