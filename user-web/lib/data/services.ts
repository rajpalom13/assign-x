import {
  FileText,
  Search,
  Stethoscope,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  disabled?: boolean;
  badge?: string;
}

/**
 * Dashboard services configuration
 * Displayed in 2x2 grid on home page
 */
export const services: Service[] = [
  {
    id: "project-support",
    title: "Project Support",
    description: "Get expert help with your projects",
    icon: FileText,
    href: "/projects/new",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "ai-plag-report",
    title: "AI/Plag Report",
    description: "Check originality & AI detection",
    icon: Search,
    href: "/services/report",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "consult-doctor",
    title: "Consult Doctor",
    description: "Medical consultation service",
    icon: Stethoscope,
    href: "/services/consult",
    color: "bg-green-500/10 text-green-500",
    disabled: true,
    badge: "Coming Soon",
  },
  {
    id: "ref-generator",
    title: "Ref. Generator",
    description: "Generate citations for free",
    icon: BookOpen,
    href: "https://www.citethisforme.com/",
    color: "bg-purple-500/10 text-purple-500",
    badge: "Free",
  },
];
