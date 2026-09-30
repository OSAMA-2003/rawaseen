"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  KeyRound,
  Users,
  CalendarCheck,
  UserCog,
  ExternalLink,
  LogOut,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  managerOrAdminOnly?: boolean;
  badge?: string;
}

const NAV_ITEMS: { category: string; items: NavItem[] }[] = [
  {
    category: "WORKSPACE",
    items: [
      {
        label: "Overview",
        labelAr: "نظرة عامة",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "CRM Leads & Pipeline",
        labelAr: "إدارة العملاء والفرص",
        href: "/dashboard/leads",
        icon: Users,
      },
      {
        label: "Follow-Ups & Tasks",
        labelAr: "المهام والمتابعات",
        href: "/dashboard/followups",
        icon: CalendarCheck,
      },
    ],
  },
  {
    category: "PORTFOLIO & ASSETS",
    items: [
      {
        label: "Projects Catalog",
        labelAr: "كتالوج المشاريع",
        href: "/dashboard/projects",
        icon: Building2,
      },
      {
        label: "Unit Inventory",
        labelAr: "مخزون الوحدات",
        href: "/dashboard/units",
        icon: KeyRound,
      },
    ],
  },
  {
    category: "MANAGEMENT",
    items: [
      {
        label: "Team & Staff",
        labelAr: "فريق العمل",
        href: "/dashboard/team",
        icon: UserCog,
        managerOrAdminOnly: true,
      },
    ],
  },
];

export function DashboardSidebar({
  isMobileOpen,
  setIsMobileOpen,
}: {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-[#c5a880]/15 text-[#8c6b3e] border-[#c5a880]/40";
      case "MANAGER":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "SALES":
      default:
        return "bg-blue-50 text-blue-800 border-blue-300";
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white text-stone-800 border-r border-stone-200 select-none shadow-xs">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-stone-200">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo-black.png"
              alt="Rawasin"
              className="h-8 w-auto object-contain transition-opacity group-hover:opacity-85"
            />
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-stone-500 font-semibold">
              Enterprise Suite
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[0.6rem] tracking-wider text-emerald-700 uppercase font-semibold">
                Atlas Connected
              </span>
            </div>
          </div>
        </div>

        {/* Current User Role Header Pill */}
        {user && (
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="h-6 w-6 rounded-none bg-stone-200 text-stone-800 font-mono text-[0.65rem] flex items-center justify-center font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-stone-900 font-medium truncate">
                {user.name}
              </span>
            </div>
            <span
              className={`font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 border ${getRoleBadgeStyle(
                user.role
              )}`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-270px)]">
          {NAV_ITEMS.map((group) => {
            const filteredItems = group.items.filter((item) => {
              if (item.adminOnly && user?.role !== "ADMIN") return false;
              if (
                item.managerOrAdminOnly &&
                user?.role !== "ADMIN" &&
                user?.role !== "MANAGER"
              )
                return false;
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                <div className="px-3 pb-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-stone-400 font-semibold">
                  {group.category}
                </div>
                {filteredItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center justify-between px-3 py-2.5 transition-all duration-200 border ${
                        isActive
                          ? "bg-stone-100 text-stone-950 border-[#c5a880] font-semibold shadow-xs"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-950 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? "text-[#9b7c52]"
                              : "text-stone-400 group-hover:text-stone-800"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs tracking-wide">{item.label}</span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="h-1.5 w-1.5 bg-[#9b7c52] rounded-none" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors font-mono tracking-wider uppercase text-[0.68rem]"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
            Public Website
          </span>
          <ChevronRight className="h-3 w-3 text-stone-400" />
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-mono tracking-wider uppercase text-[0.68rem] border border-transparent hover:border-rose-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        >
          <div
            className="w-80 h-full max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
