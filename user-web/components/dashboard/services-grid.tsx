"use client";

import { Sparkles } from "lucide-react";
import { ServiceCard } from "./service-card";
import { services } from "@/lib/data/services";

/**
 * Services grid component
 * Displays 2x2 grid of service cards with enhanced header
 */
export function ServicesGrid() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Our Services</h2>
          <p className="text-xs text-muted-foreground">Choose what you need help with</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
