import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BannerCarousel } from "@/components/dashboard/banner-carousel";
import { ServicesGrid } from "@/components/dashboard/services-grid";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { CampusPulse } from "@/components/dashboard/campus-pulse";
import { FadeInSection } from "@/components/dashboard/page-transition";

/**
 * Dashboard home page
 * Main dashboard view with header, banners, services, campus pulse, and recent projects
 * Enhanced with Framer Motion animations for smooth transitions
 */
export default function DashboardHomePage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <DashboardHeader />

      {/* Content with staggered animations */}
      <div className="flex-1 space-y-8 p-4 lg:p-6">
        {/* Banner Carousel */}
        <FadeInSection delay={0}>
          <BannerCarousel />
        </FadeInSection>

        {/* Services Grid */}
        <FadeInSection delay={0.1}>
          <ServicesGrid />
        </FadeInSection>

        {/* Campus Pulse - U17: Trending at University */}
        <FadeInSection delay={0.2}>
          <CampusPulse />
        </FadeInSection>

        {/* Recent Projects */}
        <FadeInSection delay={0.3}>
          <RecentProjects />
        </FadeInSection>
      </div>
    </div>
  );
}
