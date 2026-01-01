/**
 * Mock data for Student Connect module
 * Batch 7: Student Connect
 */

import type { Tutor, Resource, StudyGroup, Question, Answer, TimeSlot } from "@/types/connect";

/**
 * Featured tutors data
 */
export const featuredTutors: Tutor[] = [
  {
    id: "tutor-1",
    name: "Dr. Sarah Mitchell",
    avatar: "/avatars/sarah.jpg",
    verified: true,
    rating: 4.9,
    reviewCount: 234,
    subjects: ["Mathematics", "Statistics", "Data Science"],
    expertise: "master",
    hourlyRate: 45,
    currency: "USD",
    availability: "available",
    bio: "PhD in Applied Mathematics with 10+ years of teaching experience. Specialized in helping students understand complex concepts through practical examples.",
    completedSessions: 1250,
    responseTime: "< 1 hour",
    languages: ["English", "Spanish"],
    education: "PhD, MIT",
    featured: true,
  },
  {
    id: "tutor-2",
    name: "Prof. James Chen",
    avatar: "/avatars/james.jpg",
    verified: true,
    rating: 4.8,
    reviewCount: 189,
    subjects: ["Computer Science", "Programming", "AI/ML"],
    expertise: "expert",
    hourlyRate: 55,
    currency: "USD",
    availability: "available",
    bio: "Former Google engineer turned educator. I make complex tech concepts accessible and fun to learn.",
    completedSessions: 890,
    responseTime: "< 2 hours",
    languages: ["English", "Mandarin"],
    education: "MS, Stanford",
    featured: true,
  },
  {
    id: "tutor-3",
    name: "Emma Williams",
    avatar: "/avatars/emma.jpg",
    verified: true,
    rating: 4.7,
    reviewCount: 156,
    subjects: ["English Literature", "Creative Writing", "Essay Writing"],
    expertise: "expert",
    hourlyRate: 35,
    currency: "USD",
    availability: "busy",
    bio: "Published author and writing coach. I help students find their voice and craft compelling narratives.",
    completedSessions: 650,
    responseTime: "< 3 hours",
    languages: ["English"],
    education: "MFA, Columbia",
    featured: true,
  },
  {
    id: "tutor-4",
    name: "Dr. Raj Patel",
    avatar: "/avatars/raj.jpg",
    verified: true,
    rating: 4.9,
    reviewCount: 312,
    subjects: ["Physics", "Engineering", "Mechanics"],
    expertise: "master",
    hourlyRate: 50,
    currency: "USD",
    availability: "available",
    bio: "Engineering professor with a passion for making physics intuitive. Complex problems, simple solutions.",
    completedSessions: 1450,
    responseTime: "< 1 hour",
    languages: ["English", "Hindi"],
    education: "PhD, Cambridge",
    featured: true,
  },
];

/**
 * All tutors including non-featured
 */
export const allTutors: Tutor[] = [
  ...featuredTutors,
  {
    id: "tutor-5",
    name: "Lisa Thompson",
    verified: true,
    rating: 4.6,
    reviewCount: 78,
    subjects: ["Biology", "Chemistry", "Biochemistry"],
    expertise: "intermediate",
    hourlyRate: 30,
    currency: "USD",
    availability: "available",
    bio: "Medical student passionate about teaching life sciences.",
    completedSessions: 280,
    responseTime: "< 4 hours",
    languages: ["English"],
    education: "MD Candidate, Johns Hopkins",
  },
  {
    id: "tutor-6",
    name: "Michael Brown",
    verified: false,
    rating: 4.5,
    reviewCount: 45,
    subjects: ["Economics", "Finance", "Accounting"],
    expertise: "intermediate",
    hourlyRate: 28,
    currency: "USD",
    availability: "offline",
    bio: "MBA graduate helping students master business fundamentals.",
    completedSessions: 150,
    responseTime: "< 6 hours",
    languages: ["English"],
    education: "MBA, Wharton",
  },
];

/**
 * Shared resources data
 */
export const sharedResources: Resource[] = [
  {
    id: "res-1",
    title: "Complete APA 7th Edition Guide",
    description: "Comprehensive guide covering all aspects of APA formatting with examples and templates.",
    type: "guide",
    subject: "Academic Writing",
    author: {
      id: "user-1",
      name: "Academic Hub",
      avatar: "/avatars/academic-hub.jpg",
    },
    downloads: 12500,
    rating: 4.8,
    ratingCount: 456,
    createdAt: new Date("2024-01-15"),
    fileSize: "2.4 MB",
    fileType: "PDF",
    isPremium: false,
  },
  {
    id: "res-2",
    title: "Statistics Cheat Sheet Bundle",
    description: "10 essential cheat sheets covering probability, hypothesis testing, regression, and more.",
    type: "notes",
    subject: "Statistics",
    author: {
      id: "user-2",
      name: "Stats Pro",
    },
    downloads: 8900,
    rating: 4.9,
    ratingCount: 234,
    createdAt: new Date("2024-02-20"),
    fileSize: "5.1 MB",
    fileType: "PDF",
    isPremium: true,
    price: 4.99,
  },
  {
    id: "res-3",
    title: "Research Paper Template",
    description: "Professional research paper template with proper formatting and section guides.",
    type: "template",
    subject: "Academic Writing",
    author: {
      id: "user-3",
      name: "Template Master",
    },
    downloads: 15600,
    rating: 4.7,
    ratingCount: 567,
    createdAt: new Date("2024-03-10"),
    fileSize: "890 KB",
    fileType: "DOCX",
    isPremium: false,
  },
  {
    id: "res-4",
    title: "Calculus Practice Problems",
    description: "500+ practice problems with step-by-step solutions for Calc I, II, and III.",
    type: "practice",
    subject: "Mathematics",
    author: {
      id: "user-4",
      name: "Math Wizard",
    },
    downloads: 6700,
    rating: 4.6,
    ratingCount: 189,
    createdAt: new Date("2024-04-05"),
    fileSize: "8.2 MB",
    fileType: "PDF",
    isPremium: true,
    price: 7.99,
  },
];

/**
 * Study groups data
 */
export const studyGroups: StudyGroup[] = [
  {
    id: "group-1",
    name: "Data Science Study Circle",
    description: "Weekly meetups to discuss ML concepts, work on projects, and prepare for interviews.",
    subject: "Data Science",
    memberCount: 24,
    maxMembers: 30,
    status: "open",
    createdBy: {
      id: "user-5",
      name: "Alex Kim",
    },
    nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    topics: ["Machine Learning", "Python", "Statistics", "Deep Learning"],
  },
  {
    id: "group-2",
    name: "Pre-Med Study Group",
    description: "Support group for pre-med students. MCAT prep, research opportunities, and more.",
    subject: "Medicine",
    memberCount: 18,
    maxMembers: 20,
    status: "open",
    createdBy: {
      id: "user-6",
      name: "Dr. Maria Garcia",
    },
    nextSession: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    topics: ["MCAT", "Biology", "Chemistry", "Research"],
  },
  {
    id: "group-3",
    name: "MBA Case Competition Team",
    description: "Preparing for upcoming business case competitions. Strategy and presentation practice.",
    subject: "Business",
    memberCount: 8,
    maxMembers: 8,
    status: "full",
    createdBy: {
      id: "user-7",
      name: "Business Leaders Club",
    },
    nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    topics: ["Case Studies", "Strategy", "Finance", "Presentations"],
    isJoined: true,
  },
  {
    id: "group-4",
    name: "Academic Writing Workshop",
    description: "Improve your academic writing skills with peer feedback and expert guidance.",
    subject: "Writing",
    memberCount: 15,
    maxMembers: 25,
    status: "open",
    createdBy: {
      id: "user-8",
      name: "Writing Center",
    },
    nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    topics: ["Essays", "Research Papers", "Citations", "Grammar"],
  },
];

/**
 * Q&A questions data
 */
export const questions: Question[] = [
  {
    id: "q-1",
    title: "How do I properly cite a website in APA 7?",
    content: "I'm confused about how to cite a website that doesn't have an author listed...",
    subject: "Academic Writing",
    author: {
      id: "user-9",
      name: "StudentUser123",
    },
    answerCount: 5,
    upvotes: 23,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isAnswered: true,
    tags: ["APA", "citations", "websites"],
  },
  {
    id: "q-2",
    title: "Best approach for multiple regression analysis?",
    content: "Working on a research project and need help choosing between different regression methods...",
    subject: "Statistics",
    author: {
      id: "user-10",
      name: "DataNerd42",
    },
    answerCount: 3,
    upvotes: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isAnswered: false,
    tags: ["statistics", "regression", "research"],
  },
];

/**
 * Available time slots for booking
 */
export const availableTimeSlots: TimeSlot[] = [
  { id: "slot-1", time: "09:00 AM", available: true },
  { id: "slot-2", time: "10:00 AM", available: true },
  { id: "slot-3", time: "11:00 AM", available: false },
  { id: "slot-4", time: "12:00 PM", available: true },
  { id: "slot-5", time: "01:00 PM", available: false },
  { id: "slot-6", time: "02:00 PM", available: true },
  { id: "slot-7", time: "03:00 PM", available: true },
  { id: "slot-8", time: "04:00 PM", available: true },
  { id: "slot-9", time: "05:00 PM", available: false },
  { id: "slot-10", time: "06:00 PM", available: true },
];

/**
 * Connect categories
 */
export const connectCategories = [
  { id: "all", label: "All", icon: "Grid" },
  { id: "tutors", label: "Tutors", icon: "GraduationCap" },
  { id: "resources", label: "Resources", icon: "FileText" },
  { id: "study-groups", label: "Study Groups", icon: "Users" },
  { id: "qa", label: "Q&A", icon: "MessageCircle" },
] as const;

/**
 * Subject filters for connect
 */
export const subjectFilters = [
  "All Subjects",
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Business",
  "Economics",
  "English",
  "Psychology",
  "Engineering",
  "Medicine",
  "Law",
  "Statistics",
];

/** Mock answers for Q&A */
export const mockAnswers: Answer[] = [
  {
    id: "ans-1",
    questionId: "q-1",
    content: "Great question! The key differences are in their use cases. useEffect runs after render and is for side effects like data fetching. useMemo memoizes computed values to prevent recalculation.",
    author: { id: "tutor-2", name: "Prof. James Chen", avatar: "/avatars/james.jpg", isExpert: true },
    upvotes: 24,
    isAccepted: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "ans-2",
    questionId: "q-1",
    content: "To add to the above - useCallback is similar to useMemo but for functions. It prevents unnecessary re-renders when passing callbacks to child components.",
    author: { id: "user-5", name: "ReactDev99" },
    upvotes: 12,
    isAccepted: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

/** Q&A filter options */
export const qaFilters = [
  { value: "all", label: "All Questions" },
  { value: "unanswered", label: "Unanswered" },
  { value: "answered", label: "Answered" },
];
