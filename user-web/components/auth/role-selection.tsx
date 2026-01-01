"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, Building2, ArrowRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "student",
    icon: GraduationCap,
    title: "Student",
    description:
      "Get expert help with your academic projects. From essays to dissertations, we have you covered.",
    href: "/signup/student",
    color: "primary",
  },
  {
    id: "professional",
    icon: Briefcase,
    title: "Job Seeker",
    description:
      "Professional assistance for career growth. Resumes, portfolios, and interview prep.",
    href: "/signup/professional",
    color: "accent",
  },
  {
    id: "business",
    icon: Building2,
    title: "Business",
    description:
      "Scale your business with expert support. Content, research, and professional documentation.",
    href: "/signup/professional?type=business",
    color: "secondary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Role selection screen with 3 premium cards
 * Allows users to choose their account type
 */
export function RoleSelection() {
  const router = useRouter();

  const handleRoleSelect = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Choose Your Path</h1>
        <p className="text-muted-foreground">
          Select the option that best describes you
        </p>
      </div>

      {/* Role cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-3"
      >
        {roles.map((role) => (
          <motion.div key={role.id} variants={cardVariants}>
            <Card
              onClick={() => handleRoleSelect(role.href)}
              className={cn(
                "group cursor-pointer transition-all duration-300",
                "hover:border-primary hover:shadow-lg hover:shadow-primary/10",
                "hover:-translate-y-1"
              )}
            >
              <CardHeader className="text-center">
                {/* Icon */}
                <div
                  className={cn(
                    "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                    role.color === "primary" && "bg-primary/10 text-primary",
                    role.color === "accent" && "bg-blue-500/10 text-blue-500",
                    role.color === "secondary" && "bg-secondary/50 text-foreground"
                  )}
                >
                  <role.icon className="h-8 w-8" />
                </div>

                {/* Title */}
                <CardTitle className="text-xl">{role.title}</CardTitle>

                {/* Description */}
                <CardDescription className="text-sm">
                  {role.description}
                </CardDescription>

                {/* Arrow indicator */}
                <div className="mt-4 flex justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Login link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
