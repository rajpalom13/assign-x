"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  Clock,
  Video,
  MessageSquare,
  Shield,
  Globe,
  GraduationCap,
  Briefcase,
  Flag,
  ThumbsUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import { getExpertById, getExpertReviews } from "@/lib/data/experts";
import type { ExpertSpecialization } from "@/types/expert";

/**
 * Specialization labels
 */
const SPEC_LABELS: Record<ExpertSpecialization, string> = {
  academic_writing: "Academic Writing",
  research_methodology: "Research Methodology",
  data_analysis: "Data Analysis",
  programming: "Programming",
  mathematics: "Mathematics",
  science: "Science",
  business: "Business",
  engineering: "Engineering",
  law: "Law",
  medicine: "Medicine",
  arts: "Arts",
  other: "Other",
};

/**
 * Expert Profile Page
 * Displays full expert profile with reviews and booking option
 */
export default function ExpertProfilePage({
  params,
}: {
  params: Promise<{ expertId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");

  const expert = getExpertById(resolvedParams.expertId);
  const reviews = getExpertReviews(resolvedParams.expertId);

  // Handle expert not found
  if (!expert) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Expert not found</p>
          <Button
            variant="link"
            onClick={() => router.push("/experts")}
            className="mt-4"
          >
            Back to Experts
          </Button>
        </Card>
      </div>
    );
  }

  /**
   * Get initials from name
   */
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get availability color
   */
  const getAvailabilityColor = (status: typeof expert.availability) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  /**
   * Get availability text
   */
  const getAvailabilityText = (status: typeof expert.availability) => {
    switch (status) {
      case "available":
        return "Available Now";
      case "busy":
        return "Currently Busy";
      case "offline":
        return "Offline";
    }
  };

  return (
    <div className="mesh-background mesh-gradient-top-right min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/experts")}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experts
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                      <AvatarImage src={expert.avatar} alt={expert.name} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(expert.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-background",
                        getAvailabilityColor(expert.availability)
                      )}
                    />
                  </div>
                  <Badge
                    variant={
                      expert.availability === "available"
                        ? "default"
                        : "secondary"
                    }
                    className="gap-1"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        getAvailabilityColor(expert.availability)
                      )}
                    />
                    {getAvailabilityText(expert.availability)}
                  </Badge>
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{expert.name}</h1>
                    {expert.verified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500 mx-auto md:mx-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {expert.designation}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{expert.rating}</span>
                      <span className="text-muted-foreground">
                        ({expert.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{expert.totalSessions} sessions</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{expert.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    {expert.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {SPEC_LABELS[spec]}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div>
                      <span className="text-2xl font-bold">
                        {formatINR(expert.pricePerSession)}
                      </span>
                      <span className="text-muted-foreground">/session</span>
                    </div>
                    <Button
                      size="lg"
                      onClick={() =>
                        router.push(`/experts/booking/${expert.id}`)
                      }
                      className="w-full sm:w-auto"
                    >
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: Shield, text: "Verified Expert" },
            { icon: Video, text: "Google Meet Session" },
            { icon: Shield, text: "Money-back Guarantee" },
            { icon: MessageSquare, text: "24/7 Support" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3"
            >
              <item.icon className="h-4 w-4 text-green-500 shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({expert.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4 mt-4">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {expert.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  {expert.education && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Education</p>
                        <p className="text-sm text-muted-foreground">
                          {expert.education}
                        </p>
                      </div>
                    </div>
                  )}

                  {expert.experience && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Experience</p>
                        <p className="text-sm text-muted-foreground">
                          {expert.experience}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Languages</p>
                      <p className="text-sm text-muted-foreground">
                        {expert.languages.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-4">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No reviews yet</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.clientAvatar} />
                            <AvatarFallback>
                              {review.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {review.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(review.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                      {review.helpful && review.helpful > 0 && (
                        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{review.helpful} found this helpful</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Report Button */}
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="h-4 w-4 mr-1" />
            Report Expert
          </Button>
        </div>

        {/* Sticky Book Button (Mobile) */}
        <div className="fixed bottom-24 left-4 right-4 md:hidden z-40">
          <Button
            size="lg"
            className="w-full shadow-lg"
            onClick={() => router.push(`/experts/booking/${expert.id}`)}
          >
            Book Consultation - {formatINR(expert.pricePerSession)}
          </Button>
        </div>
      </div>
    </div>
  );
}
