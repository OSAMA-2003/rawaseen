"use client";

import React, { useState } from "react";
import { AuthGuard } from "../../components/dashboard/AuthGuard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../../components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f8f7f4] text-stone-900 flex">
        {/* Navigation Sidebar */}
        <DashboardSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Workspace Main Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader onMenuToggle={() => setIsMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
