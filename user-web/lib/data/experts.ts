/**
 * Mock data for expert consultations
 * In production, this would come from the database
 */

import type { Expert, ExpertReview, ConsultationBooking, AvailabilitySlot } from "@/types/expert";

/**
 * Mock experts data
 */
export const MOCK_EXPERTS: Expert[] = [
  {
    id: "exp-1",
    name: "Dr. Priya Sharma",
    avatar: "https://i.pravatar.cc/150?u=priya",
    designation: "PhD in Computer Science, IIT Delhi",
    bio: "10+ years of experience in academic research and mentoring. Specializing in machine learning, data structures, and algorithm design. I have helped over 500 students with their research papers and dissertations.",
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    totalSessions: 523,
    specializations: ["programming", "data_analysis", "research_methodology", "medicine"],
    pricePerSession: 1500,
    currency: "INR",
    availability: "available",
    responseTime: "Usually responds within 2 hours",
    languages: ["English", "Hindi"],
    education: "PhD Computer Science, IIT Delhi",
    experience: "10+ years in academia and industry",
    featured: true,
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "exp-2",
    name: "Prof. Rajesh Kumar",
    avatar: "https://i.pravatar.cc/150?u=rajesh",
    designation: "Professor of Mathematics, DU",
    bio: "Mathematics professor with expertise in calculus, linear algebra, and statistics. I make complex concepts simple and help students build strong foundations.",
    verified: true,
    rating: 4.8,
    reviewCount: 203,
    totalSessions: 678,
    specializations: ["mathematics", "data_analysis", "science"],
    pricePerSession: 1200,
    currency: "INR",
    availability: "available",
    responseTime: "Usually responds within 1 hour",
    languages: ["English", "Hindi"],
    education: "MSc Mathematics, PhD Statistics",
    experience: "15+ years teaching experience",
    featured: true,
    createdAt: new Date("2022-11-20"),
  },
  {
    id: "exp-3",
    name: "Dr. Ananya Verma",
    avatar: "https://i.pravatar.cc/150?u=ananya",
    designation: "Research Scientist, AIIMS",
    bio: "Medical research expert with published papers in leading journals. I help students with medical research methodology, literature reviews, and scientific writing.",
    verified: true,
    rating: 4.7,
    reviewCount: 89,
    totalSessions: 234,
    specializations: ["medicine", "research_methodology", "academic_writing"],
    pricePerSession: 2000,
    currency: "INR",
    availability: "busy",
    responseTime: "Usually responds within 4 hours",
    languages: ["English", "Hindi"],
    education: "MBBS, MD, PhD from AIIMS",
    experience: "8+ years in medical research",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "exp-4",
    name: "Vikram Singh",
    avatar: "https://i.pravatar.cc/150?u=vikram",
    designation: "Senior Software Engineer, Google",
    bio: "Software engineer with 8 years of industry experience. I help students with coding interviews, system design, and practical programming skills.",
    verified: true,
    rating: 4.9,
    reviewCount: 312,
    totalSessions: 892,
    specializations: ["programming", "engineering", "medicine"],
    pricePerSession: 1800,
    currency: "INR",
    availability: "available",
    responseTime: "Usually responds within 30 minutes",
    languages: ["English", "Hindi", "Punjabi"],
    education: "BTech CSE, IIT Bombay",
    experience: "8 years at top tech companies",
    featured: true,
    createdAt: new Date("2023-02-01"),
  },
  {
    id: "exp-5",
    name: "Dr. Meera Nair",
    avatar: "https://i.pravatar.cc/150?u=meera",
    designation: "Business Consultant, Former McKinsey",
    bio: "MBA from IIM-A with consulting background. I help students with case studies, business strategy, and management concepts.",
    verified: true,
    rating: 4.6,
    reviewCount: 145,
    totalSessions: 456,
    specializations: ["business", "academic_writing", "medicine"],
    pricePerSession: 2500,
    currency: "INR",
    availability: "offline",
    responseTime: "Usually responds within 6 hours",
    languages: ["English", "Hindi", "Malayalam"],
    education: "MBA from IIM Ahmedabad",
    experience: "12 years in consulting",
    createdAt: new Date("2023-04-15"),
  },
  {
    id: "exp-6",
    name: "Arjun Reddy",
    avatar: "https://i.pravatar.cc/150?u=arjun",
    designation: "Civil Services Mentor",
    bio: "IAS officer (Retd.) with 25 years of service. I mentor aspirants for UPSC and other competitive exams.",
    verified: true,
    rating: 4.8,
    reviewCount: 278,
    totalSessions: 1024,
    specializations: ["law", "other"],
    pricePerSession: 3000,
    currency: "INR",
    availability: "available",
    responseTime: "Usually responds within 3 hours",
    languages: ["English", "Hindi", "Telugu"],
    education: "IIT + IIM + LBSNAA",
    experience: "25 years in civil services",
    createdAt: new Date("2022-08-20"),
  },
  {
    id: "exp-7",
    name: "Dr. Shalini Gupta",
    avatar: "https://i.pravatar.cc/150?u=shalini",
    designation: "Academic Writing Expert, JNU",
    bio: "Expert in academic writing, thesis guidance, and research paper publication. I have helped students publish in top-tier journals.",
    verified: true,
    rating: 4.7,
    reviewCount: 167,
    totalSessions: 534,
    specializations: ["academic_writing", "research_methodology", "arts"],
    pricePerSession: 1400,
    currency: "INR",
    availability: "available",
    responseTime: "Usually responds within 2 hours",
    languages: ["English", "Hindi"],
    education: "PhD English Literature, JNU",
    experience: "12 years in academia",
    createdAt: new Date("2023-01-05"),
  },
  {
    id: "exp-8",
    name: "Karan Mehta",
    avatar: "https://i.pravatar.cc/150?u=karan",
    designation: "Data Scientist, Amazon",
    bio: "Data scientist specializing in ML/AI, Python, and big data technologies. I help students with projects, placements, and skill development.",
    verified: true,
    rating: 4.8,
    reviewCount: 198,
    totalSessions: 612,
    specializations: ["data_analysis", "programming", "mathematics"],
    pricePerSession: 1600,
    currency: "INR",
    availability: "busy",
    responseTime: "Usually responds within 1 hour",
    languages: ["English", "Hindi"],
    education: "MTech Data Science, IIIT-H",
    experience: "6 years in data science",
    createdAt: new Date("2023-05-01"),
  },
];

/**
 * Mock reviews data
 */
export const MOCK_REVIEWS: ExpertReview[] = [
  {
    id: "rev-1",
    expertId: "exp-1",
    clientId: "user-1",
    bookingId: "book-1",
    rating: 5,
    comment: "Dr. Sharma was incredibly helpful with my machine learning project. She explained complex concepts clearly and provided actionable feedback. Highly recommended!",
    clientName: "Amit P.",
    createdAt: new Date("2024-01-10"),
    helpful: 12,
  },
  {
    id: "rev-2",
    expertId: "exp-1",
    clientId: "user-2",
    bookingId: "book-2",
    rating: 5,
    comment: "Excellent session! She helped me structure my research paper perfectly. Very patient and knowledgeable.",
    clientName: "Neha S.",
    createdAt: new Date("2024-01-08"),
    helpful: 8,
  },
  {
    id: "rev-3",
    expertId: "exp-1",
    clientId: "user-3",
    bookingId: "book-3",
    rating: 4,
    comment: "Good consultation. Helped me understand algorithm complexity better. Would have liked more time for questions.",
    clientName: "Rahul K.",
    createdAt: new Date("2024-01-05"),
    helpful: 5,
  },
  {
    id: "rev-4",
    expertId: "exp-2",
    clientId: "user-4",
    bookingId: "book-4",
    rating: 5,
    comment: "Prof. Kumar makes mathematics fun! He helped me understand linear algebra concepts I had been struggling with for months.",
    clientName: "Priya M.",
    createdAt: new Date("2024-01-12"),
    helpful: 15,
  },
  {
    id: "rev-5",
    expertId: "exp-4",
    clientId: "user-5",
    bookingId: "book-5",
    rating: 5,
    comment: "Vikram sir helped me prepare for my Google interview. His system design tips were invaluable. Got the offer!",
    clientName: "Varun T.",
    createdAt: new Date("2024-01-11"),
    helpful: 23,
  },
];

/**
 * Mock bookings data
 */
export const MOCK_BOOKINGS: ConsultationBooking[] = [
  {
    id: "book-upcoming-1",
    expertId: "exp-1",
    clientId: "current-user",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    startTime: "14:00",
    endTime: "15:00",
    duration: 60,
    topic: "Machine Learning Project Review",
    status: "upcoming",
    meetLink: "https://meet.google.com/abc-defg-hij",
    totalAmount: 1500,
    expertAmount: 1000,
    platformFee: 500,
    currency: "INR",
    paymentStatus: "completed",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "book-completed-1",
    expertId: "exp-2",
    clientId: "current-user",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    startTime: "11:00",
    endTime: "12:00",
    duration: 60,
    topic: "Calculus Help",
    status: "completed",
    totalAmount: 1200,
    expertAmount: 800,
    platformFee: 400,
    currency: "INR",
    paymentStatus: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Get expert by ID
 */
export function getExpertById(id: string): Expert | undefined {
  return MOCK_EXPERTS.find((expert) => expert.id === id);
}

/**
 * Get reviews for an expert
 */
export function getExpertReviews(expertId: string): ExpertReview[] {
  return MOCK_REVIEWS.filter((review) => review.expertId === expertId);
}

/**
 * Get user's bookings
 */
export function getUserBookings(userId: string): ConsultationBooking[] {
  return MOCK_BOOKINGS.filter((booking) => booking.clientId === userId);
}

/**
 * Get featured experts
 */
export function getFeaturedExperts(): Expert[] {
  return MOCK_EXPERTS.filter((expert) => expert.featured);
}
