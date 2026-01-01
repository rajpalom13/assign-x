"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, FolderCheck, Plus, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWallet, getProjects } from "@/lib/actions/data";

/**
 * Stats Card Component
 * Floating card with Wallet Balance + Total Projects Completed
 * Implements U87 from feature spec
 */
export function StatsCard() {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [projectsCompleted, setProjectsCompleted] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [wallet, projects] = await Promise.all([
          getWallet(),
          getProjects("completed"),
        ]);
        setWalletBalance(wallet?.balance || 0);
        setProjectsCompleted(projects?.length || 0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-primary/10">
          {/* Wallet Balance */}
          <Link href="/wallet" className="block p-4 hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Wallet Balance
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                ₹{walletBalance?.toLocaleString("en-IN") || "0"}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Available Credits
            </p>
          </Link>

          {/* Projects Completed */}
          <Link href="/projects?tab=history" className="block p-4 hover:bg-primary/5 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <FolderCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground font-medium">
                Projects Done
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {projectsCompleted}
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Completed
            </p>
          </Link>
        </div>

        {/* Top-up button */}
        <div className="border-t border-primary/10 p-3">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/wallet?action=topup">
              <Plus className="h-4 w-4 mr-2" />
              Add Money to Wallet
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
