"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Award,
  Shield,
  TrendingUp,
  Calendar,
  History,
  Search,
  CalendarClock,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExpertCard,
  ExpertFiltersComponent,
  SessionCard,
} from "@/components/experts";
import {
  MOCK_EXPERTS,
  MOCK_BOOKINGS,
  getFeaturedExperts,
  getExpertById,
} from "@/lib/data/experts";
import type { Expert, ExpertFilters, ConsultationBooking } from "@/types/expert";

/**
 * Default filter state
 */
const DEFAULT_FILTERS: ExpertFilters = {
  specializations: [],
  minRating: 0,
  maxPrice: 5000,
  availability: [],
  languages: [],
  sortBy: "rating",
};

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/**
 * Expert Listing Page
 * Displays grid of experts with filtering and search
 * Also shows user's booked appointments
 */
export default function ExpertsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpertFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"explore" | "bookings">("explore");
  const [bookingFilter, setBookingFilter] = useState<"upcoming" | "past">("upcoming");

  const featuredExperts = getFeaturedExperts();

  /**
   * Get user's bookings with expert info
   * In production, this would be fetched from the database
   */
  const userBookings = useMemo(() => {
    return MOCK_BOOKINGS.map((booking) => {
      const expert = getExpertById(booking.expertId);
      return { booking, expert };
    }).filter((item) => item.expert !== undefined);
  }, []);

  /**
   * Filter bookings by status (upcoming vs past)
   */
  const filteredBookings = useMemo(() => {
    const now = new Date();
    return userBookings.filter(({ booking }) => {
      const bookingDate = new Date(booking.date);
      if (bookingFilter === "upcoming") {
        return (
          bookingDate >= now ||
          booking.status === "upcoming" ||
          booking.status === "in_progress"
        );
      } else {
        return (
          bookingDate < now ||
          booking.status === "completed" ||
          booking.status === "cancelled" ||
          booking.status === "no_show"
        );
      }
    });
  }, [userBookings, bookingFilter]);

  /**
   * Filter and sort experts
   */
  const filteredExperts = useMemo(() => {
    let result = [...MOCK_EXPERTS];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (expert) =>
          expert.name.toLowerCase().includes(query) ||
          expert.designation.toLowerCase().includes(query)
      );
    }

    // Specialization filter
    if (filters.specializations.length > 0) {
      result = result.filter((expert) =>
        expert.specializations.some((spec) =>
          filters.specializations.includes(spec)
        )
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((expert) => expert.rating >= filters.minRating);
    }

    // Price filter
    if (filters.maxPrice < 5000) {
      result = result.filter(
        (expert) => expert.pricePerSession <= filters.maxPrice
      );
    }

    // Availability filter
    if (filters.availability.length > 0) {
      result = result.filter((expert) =>
        filters.availability.includes(expert.availability)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price_low":
        result.sort((a, b) => a.pricePerSession - b.pricePerSession);
        break;
      case "price_high":
        result.sort((a, b) => b.pricePerSession - a.pricePerSession);
        break;
      case "sessions":
        result.sort((a, b) => b.totalSessions - a.totalSessions);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [filters, searchQuery]);

  /**
   * Handle expert card click
   */
  const handleExpertClick = (expertId: string) => {
    router.push(`/experts/${expertId}`);
  };

  /**
   * Handle book button click
   */
  const handleBookClick = (expertId: string) => {
    router.push(`/experts/booking/${expertId}`);
  };

  /**
   * Handle join meet action
   */
  const handleJoinMeet = (meetLink?: string) => {
    if (meetLink) {
      window.open(meetLink, "_blank");
    }
  };

  /**
   * Handle leave review action
   */
  const handleLeaveReview = (bookingId: string) => {
    // In production, open review modal/page
    console.log("Leave review for booking:", bookingId);
  };

  /**
   * Handle cancel booking action
   */
  const handleCancelBooking = (bookingId: string) => {
    // In production, show confirmation and cancel
    console.log("Cancel booking:", bookingId);
  };

  /**
   * Render the bookings tab content
   */
  const renderBookingsContent = () => (
    <div className="space-y-6">
      {/* Bookings Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={bookingFilter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setBookingFilter("upcoming")}
          className="gap-2"
        >
          <CalendarClock className="h-4 w-4" />
          Upcoming
        </Button>
        <Button
          variant={bookingFilter === "past" ? "default" : "outline"}
          size="sm"
          onClick={() => setBookingFilter("past")}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Past Sessions
        </Button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            {bookingFilter === "upcoming" ? (
              <>
                <CalendarClock className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="text-muted-foreground">
                    No upcoming appointments
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Book a session with an expert to get started
                  </p>
                </div>
                <Button onClick={() => setActiveTab("explore")} className="mt-2">
                  <Search className="h-4 w-4 mr-2" />
                  Find Experts
                </Button>
              </>
            ) : (
              <>
                <CalendarCheck className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="text-muted-foreground">No past sessions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your completed sessions will appear here
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {filteredBookings.map(({ booking, expert }) => (
            <motion.div key={booking.id} variants={itemVariants}>
              <SessionCard
                booking={booking}
                expert={{
                  id: expert!.id,
                  name: expert!.name,
                  avatar: expert!.avatar,
                  designation: expert!.designation,
                }}
                onJoinMeet={() => handleJoinMeet(booking.meetLink)}
                onLeaveReview={() => handleLeaveReview(booking.id)}
                onCancel={() => handleCancelBooking(booking.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Booking Stats Summary */}
      {userBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">
                {userBookings.filter(({ booking }) => booking.status === "upcoming").length}
              </p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-500">
                {userBookings.filter(({ booking }) => booking.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{userBookings.length}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">
                ₹{userBookings.reduce((sum, { booking }) => sum + booking.totalAmount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="mesh-background mesh-gradient-experts min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Expert Consultations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Book one-on-one sessions with verified experts. Get personalized
            guidance for your academic and professional goals.
          </p>

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "explore" | "bookings")}
            className="w-full max-w-md mx-auto mt-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explore" className="gap-2">
                <Search className="h-4 w-4" />
                Find Experts
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="h-4 w-4" />
                My Bookings
                {userBookings.filter(({ booking }) => booking.status === "upcoming").length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {userBookings.filter(({ booking }) => booking.status === "upcoming").length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Conditional Content Based on Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "bookings" ? (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderBookingsContent()}
            </motion.div>
          ) : (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: Users, label: "Verified Experts", value: "50+" },
                  { icon: Award, label: "Sessions Completed", value: "5,000+" },
                  { icon: TrendingUp, label: "Average Rating", value: "4.8" },
                  { icon: Shield, label: "Money-back Guarantee", value: "100%" },
                ].map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Featured Experts */}
              {featuredExperts.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Featured Experts</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {featuredExperts.slice(0, 2).map((expert) => (
                      <ExpertCard
                        key={expert.id}
                        expert={expert}
                        variant="featured"
                        onClick={() => handleExpertClick(expert.id)}
                        onBook={() => handleBookClick(expert.id)}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ExpertFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={setSearchQuery}
                  searchQuery={searchQuery}
                />
              </motion.div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredExperts.length} expert{filteredExperts.length !== 1 && "s"}{" "}
                  found
                </p>
              </div>

              {/* Experts Grid */}
              {filteredExperts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No experts found matching your criteria.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search query.
                  </p>
                </Card>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4"
                >
                  {filteredExperts.map((expert) => (
                    <motion.div key={expert.id} variants={itemVariants}>
                      <ExpertCard
                        expert={expert}
                        onClick={() => handleExpertClick(expert.id)}
                        onBook={() => handleBookClick(expert.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Trust Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-muted/30 rounded-lg p-6 text-center space-y-4"
              >
                <h3 className="font-semibold">Why Book Through AssignX?</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <Shield className="h-5 w-5 mx-auto text-green-500" />
                    <p className="font-medium">Secure Payments</p>
                    <p className="text-muted-foreground">
                      All transactions are processed securely through our platform
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Award className="h-5 w-5 mx-auto text-blue-500" />
                    <p className="font-medium">Verified Experts</p>
                    <p className="text-muted-foreground">
                      All experts are verified for their credentials and expertise
                    </p>
                  </div>
                  <div className="space-y-1">
                    <TrendingUp className="h-5 w-5 mx-auto text-primary" />
                    <p className="font-medium">Money-back Guarantee</p>
                    <p className="text-muted-foreground">
                      Full refund if the expert doesn&apos;t show up
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
