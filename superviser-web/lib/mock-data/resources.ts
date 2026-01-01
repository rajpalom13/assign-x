/**
 * @fileoverview Mock data for resources module (AI detector, plagiarism checker, training).
 * @module lib/mock-data/resources
 */

import type { AIDetectionResult, PlagiarismCheckResult, TrainingVideo } from "@/components/resources/types"

/** Mock AI detection result */
export const MOCK_AI_RESULT: AIDetectionResult = {
  id: "detect-1",
  file_name: "research_paper.docx",
  ai_probability: 25,
  human_probability: 65,
  mixed_probability: 10,
  overall_verdict: "human",
  confidence_level: "high",
  checked_at: new Date().toISOString(),
  status: "completed",
  segments: [
    { id: "s1", text: "The advancement of artificial intelligence has transformed numerous industries, creating unprecedented opportunities.", start_index: 0, end_index: 150, classification: "human", probability: 85 },
    { id: "s2", text: "Machine learning algorithms have demonstrated remarkable capabilities in pattern recognition and analytics.", start_index: 151, end_index: 300, classification: "mixed", probability: 55 },
    { id: "s3", text: "This research examines the intersection of healthcare and AI, focusing on diagnostic imaging applications.", start_index: 301, end_index: 410, classification: "human", probability: 92 },
    { id: "s4", text: "The implementation of neural networks in medical diagnosis has shown significant improvements in accuracy.", start_index: 411, end_index: 530, classification: "ai_generated", probability: 78 },
  ],
}

/** Mock plagiarism check result */
export const MOCK_PLAGIARISM_RESULT: PlagiarismCheckResult = {
  id: "plag-1",
  file_name: "research_paper.docx",
  overall_score: 12,
  unique_content: 88,
  matched_content: 12,
  sources_found: 3,
  checked_at: new Date().toISOString(),
  status: "completed",
  matches: [
    { id: "m1", source_url: "https://example.com/article1", source_title: "Introduction to AI", matched_text: "Machine learning algorithms have demonstrated remarkable capabilities", similarity_percentage: 85, word_count: 15 },
    { id: "m2", source_url: "https://example.com/article2", source_title: "Healthcare AI Research", matched_text: "diagnostic imaging applications have revolutionized", similarity_percentage: 72, word_count: 8 },
    { id: "m3", source_url: "https://example.com/article3", source_title: "Neural Networks Overview", matched_text: "neural networks in medical diagnosis", similarity_percentage: 90, word_count: 6 },
  ],
}

/** Mock training videos */
export const MOCK_TRAINING_VIDEOS: TrainingVideo[] = [
  { id: "v1", title: "Introduction to AdminX", description: "Learn the basics of the AdminX platform and your role as a supervisor.", duration: "5:30", video_url: "https://example.com/video1", thumbnail_url: "/placeholder-video.jpg", category: "onboarding", difficulty: "beginner", is_required: true, is_completed: true, completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), order: 1 },
  { id: "v2", title: "Understanding the QC Process", description: "A comprehensive guide to quality checking submissions and providing feedback.", duration: "12:45", video_url: "https://example.com/video2", category: "qc_process", difficulty: "beginner", is_required: true, is_completed: true, completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), order: 2 },
  { id: "v3", title: "Pricing Guidelines", description: "How to set fair and competitive quotes using the pricing calculator.", duration: "8:20", video_url: "https://example.com/video3", category: "onboarding", difficulty: "beginner", is_required: true, is_completed: false, order: 3 },
  { id: "v4", title: "Communication Ethics", description: "Best practices for professional communication with clients and experts.", duration: "10:15", video_url: "https://example.com/video4", category: "communication", difficulty: "beginner", is_required: true, is_completed: false, order: 4 },
  { id: "v5", title: "Using the Plagiarism Checker", description: "Step-by-step guide to running plagiarism checks on submitted work.", duration: "6:30", video_url: "https://example.com/video5", category: "tools", difficulty: "intermediate", is_required: false, is_completed: false, order: 5 },
  { id: "v6", title: "AI Content Detection Deep Dive", description: "Understanding AI detection results and how to interpret them accurately.", duration: "15:00", video_url: "https://example.com/video6", category: "tools", difficulty: "intermediate", is_required: false, is_completed: false, order: 6 },
  { id: "v7", title: "Handling Difficult Clients", description: "Strategies for managing challenging situations and maintaining professionalism.", duration: "11:45", video_url: "https://example.com/video7", category: "communication", difficulty: "intermediate", is_required: false, is_completed: false, order: 7 },
  { id: "v8", title: "Advanced QC Techniques", description: "Expert-level quality control methods for complex submissions.", duration: "20:00", video_url: "https://example.com/video8", category: "advanced", difficulty: "advanced", is_required: false, is_completed: false, order: 8 },
  { id: "v9", title: "Maximizing Your Earnings", description: "Tips and strategies to optimize your workflow and increase earnings.", duration: "14:30", video_url: "https://example.com/video9", category: "advanced", difficulty: "advanced", is_required: false, is_completed: false, order: 9 },
]
