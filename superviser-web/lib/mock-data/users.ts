/**
 * @fileoverview Mock user data for development and demonstration.
 * @module lib/mock-data/users
 */

import type { User } from "@/components/users/types"

/** Mock users for development */
export const MOCK_USERS: User[] = [
  { id: "user-1", full_name: "Arjun Mehta", email: "arjun.mehta@gmail.com", phone: "+91 98765 12345", avatar_url: "", college: "Delhi University", course: "B.Com", year: "3rd Year", joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), is_verified: true, total_projects: 12, active_projects: 2, completed_projects: 10, total_spent: 28500, average_project_value: 2375 },
  { id: "user-2", full_name: "Neha Kapoor", email: "neha.kapoor@outlook.com", avatar_url: "", college: "Mumbai University", course: "MBA", year: "2nd Year", joined_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), is_verified: true, total_projects: 8, active_projects: 1, completed_projects: 7, total_spent: 21000, average_project_value: 2625 },
  { id: "user-3", full_name: "Vikash Yadav", email: "vikash.y@gmail.com", phone: "+91 87654 32109", avatar_url: "", college: "IIT Delhi", course: "B.Tech", year: "4th Year", joined_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), is_verified: true, total_projects: 25, active_projects: 0, completed_projects: 25, total_spent: 62500, average_project_value: 2500 },
  { id: "user-4", full_name: "Shreya Sharma", email: "shreya.sharma@yahoo.com", avatar_url: "", college: "Christ University", course: "BBA", year: "2nd Year", joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), is_verified: false, total_projects: 3, active_projects: 1, completed_projects: 2, total_spent: 4500, average_project_value: 1500 },
  { id: "user-5", full_name: "Rahul Agarwal", email: "rahul.ag@gmail.com", avatar_url: "", college: "SRCC", course: "B.Com (Hons)", year: "3rd Year", joined_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), is_verified: true, total_projects: 15, active_projects: 0, completed_projects: 15, total_spent: 37500, average_project_value: 2500 },
  { id: "user-6", full_name: "Pooja Reddy", email: "pooja.reddy@gmail.com", phone: "+91 76543 21098", avatar_url: "", college: "Loyola College", course: "B.A. Economics", year: "Final Year", joined_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), last_active_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), is_verified: true, total_projects: 6, active_projects: 1, completed_projects: 5, total_spent: 15000, average_project_value: 2500 },
]
