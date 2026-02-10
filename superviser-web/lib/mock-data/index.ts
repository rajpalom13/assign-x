/**
 * @fileoverview Mock data exports for development.
 * @module lib/mock-data
 */

export {
  MOCK_DOERS,
  MOCK_DOER_REVIEWS,
  MOCK_DOER_PROJECTS,
  SUBJECT_OPTIONS,
} from "./doers"

export {
  MOCK_AI_RESULT,
  MOCK_PLAGIARISM_RESULT,
  MOCK_TRAINING_VIDEOS,
} from "./resources"

export { MOCK_USERS } from "./users"

export {
  MOCK_PROJECT_REQUESTS,
  MOCK_ACTIVE_PROJECTS,
  MOCK_READY_TO_ASSIGN,
  MOCK_COMPLETED_PROJECTS,
  getMockProjectsByStatus,
  getMockSupervisorStats,
} from "./projects"
