"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

interface PageLoaderProps {
  isLoading?: boolean;
  text?: string;
  fullScreen?: boolean;
  minDuration?: number; // Minimum display time in ms to avoid flicker
}

export function PageLoader({
  isLoading = true,
  text,
  fullScreen = true,
  minDuration = 400,
}: PageLoaderProps) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(isLoading);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setFading(false);
    } else {
      // Start fade out animation
      setFading(true);
      timeoutId = setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, 500); // 500ms fade transition
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  if (!visible) return null;

  const defaultText =
    language === "ar"
            ? "جاري تحميل البيانات..."
      : "LOADING RAWASIN ARCHITECTURE...";

  const displayText = text || defaultText;

  const containerClasses = fullScreen
    ? `fixed inset-0 z-[99999] bg-[#0a0a09] text-white flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`
    : `min-h-[70vh] w-full bg-[#0a0a09] text-white flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`;

  return (
    <div className={containerClasses} dir="ltr">
      {/* Background radial gold glow */}
      <div className="absolute w-64 h-64 bg-[#c5a880]/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Logo with gentle pulsing animation */}
        <div className="relative">
          <img
            src="/logo-white.png"
            alt="Rawasin Real Estate"
            className="h-10 md:h-12 w-auto object-contain animate-pulse filter drop-shadow-[0_0_20px_rgba(197,168,128,0.25)]"
          />
        </div>

        {/* Loading Indicator Spinner & Status Text */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 border-2 border-[#c5a880] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-[#a7a29a] font-medium">
              {displayText}
            </span>
          </div>

          {/* Architectural accent gold progress line animation */}
          <div className="w-36 h-[2px] bg-stone-800/80 overflow-hidden relative rounded-full mt-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a880] to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Page Initial Refresh Loader
 * Shows on initial page refresh/mount and fades out gracefully once React hydration completes.
 */
export function GlobalRefreshLoader() {
  const [isMountLoading, setIsMountLoading] = useState(true);

  useEffect(() => {
    // Smooth initial mount dismissal after window loads or component mounts
    const timer = setTimeout(() => {
      setIsMountLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return <PageLoader isLoading={isMountLoading} fullScreen={true} />;
}
