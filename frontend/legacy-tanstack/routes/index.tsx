import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/nova/Navigation";
import { Hero } from "@/components/nova/Hero";
import { IntroStatement } from "@/components/nova/IntroStatement";
import { ProjectScroll } from "@/components/nova/ProjectScroll";
import { BlueprintSection } from "@/components/nova/BlueprintSection";
import { FeaturedProject } from "@/components/nova/FeaturedProject";
import { ThreeDArchitecture } from "@/components/nova/ThreeDArchitecture";
import { Stats } from "@/components/nova/Stats";
import { FinalCTA } from "@/components/nova/FinalCTA";
import { CustomCursor } from "@/components/nova/CustomCursor";
import { useSmoothScroll } from "@/lib/useSmoothScroll";

const TITLE = "NOVA — We shape places that endure";
const DESC =
  "NOVA is a Saudi real estate developer building architecture of permanence in Riyadh. Explore The Horizon and our vision for how people experience space.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useSmoothScroll();

  return (
    <main>
      <CustomCursor />
      <Navigation />
      <Hero />
      <IntroStatement />
      <ProjectScroll />
      <BlueprintSection />
      <FeaturedProject />
      <ThreeDArchitecture />
      <Stats />
      <FinalCTA />
    </main>
  );
}
