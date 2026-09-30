"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a09] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo-white.png"
            alt="Rawasin"
            className="h-9 w-auto object-contain animate-pulse"
          />
          <div className="flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-[#a7a29a]">
            <div className="h-3.5 w-3.5 border-2 border-[#c5a880] border-t-transparent animate-spin" />
            <span>Verifying Enterprise Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
