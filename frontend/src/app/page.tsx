"use client";

import { useState } from "react";
import { Navigation } from "@/components/nova/Navigation";
import { Hero } from "@/components/nova/Hero";
import { IntroStatement } from "@/components/nova/IntroStatement";
import { ProjectScroll } from "@/components/nova/ProjectScroll";
import { HomeProjectsSection } from "@/components/nova/HomeProjectsSection";
import { BlueprintSection } from "@/components/nova/BlueprintSection";
import { FeaturedProject } from "@/components/nova/FeaturedProject";
import { ThreeDArchitecture } from "@/components/nova/ThreeDArchitecture";
import { Stats } from "@/components/nova/Stats";
import { FinalCTA } from "@/components/nova/FinalCTA";
import { PublicInquiryModal } from "@/components/public/PublicInquiryModal";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

export default function Home() {
  useSmoothScroll();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const handleOpenInquiry = (projectId?: string) => {
    setSelectedProjectId(projectId);
    setIsInquiryModalOpen(true);
  };

  return (
    <main className="bg-[#f8f6f2] text-[#182220]">
      <Navigation onOpenInquiry={() => handleOpenInquiry()} />
      <Hero />
      <IntroStatement />
      <ProjectScroll />
      {/* Live Architectural Developments Section */}
      <HomeProjectsSection onOpenInquiry={handleOpenInquiry} />
      <BlueprintSection />
      <FeaturedProject />
      {/* <ThreeDArchitecture /> */}
      <Stats />
      <FinalCTA onOpenInquiry={() => handleOpenInquiry()} />

      {/* Public Client Inquiry Dialog */}
      <PublicInquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false);
          setSelectedProjectId(undefined);
        }}
        preselectedProjectId={selectedProjectId}
      />
    </main>
  );
}

