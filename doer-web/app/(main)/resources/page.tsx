'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ResourcesGrid,
  TrainingCenter,
  AIReportGenerator,
  CitationBuilder,
  FormatTemplates,
} from '@/components/resources'
import type { TrainingModule, TrainingProgress, Citation } from '@/types/database'

/** Resource view types */
type ResourceView = 'grid' | 'training-center' | 'ai-report' | 'citation-builder' | 'templates'

/** Mock training modules */
const mockTrainingModules: TrainingModule[] = [
  {
    id: '1',
    title: 'Quality Standards Introduction',
    description: 'Learn about the quality standards we expect in all deliverables.',
    target_role: 'doer',
    content_type: 'video',
    content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content_html: null,
    duration_minutes: 15,
    sequence_order: 1,
    is_mandatory: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Plagiarism & Academic Integrity',
    description: 'Understanding plagiarism, proper citation, and academic integrity.',
    target_role: 'doer',
    content_type: 'video',
    content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content_html: null,
    duration_minutes: 20,
    sequence_order: 2,
    is_mandatory: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Meeting Deadlines',
    description: 'Time management strategies and importance of deadline adherence.',
    target_role: 'doer',
    content_type: 'video',
    content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content_html: null,
    duration_minutes: 10,
    sequence_order: 3,
    is_mandatory: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Using Research Tools',
    description: 'Guide to using research databases and citation tools effectively.',
    target_role: 'doer',
    content_type: 'pdf',
    content_url: '/training/research-tools.pdf',
    content_html: null,
    duration_minutes: 25,
    sequence_order: 4,
    is_mandatory: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Communication Best Practices',
    description: 'How to communicate effectively with supervisors and clients.',
    target_role: 'doer',
    content_type: 'article',
    content_url: '/training/communication.html',
    content_html: null,
    duration_minutes: 15,
    sequence_order: 5,
    is_mandatory: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Formatting Guidelines',
    description: 'Standard formatting requirements for different document types.',
    target_role: 'doer',
    content_type: 'pdf',
    content_url: '/training/formatting.pdf',
    content_html: null,
    duration_minutes: 30,
    sequence_order: 6,
    is_mandatory: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

/** Mock training progress */
const mockTrainingProgress: TrainingProgress[] = [
  {
    id: '1',
    profile_id: 'profile1',
    module_id: '1',
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    progress_percentage: 100,
    is_completed: true,
  },
  {
    id: '2',
    profile_id: 'profile1',
    module_id: '2',
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    progress_percentage: 100,
    is_completed: true,
  },
  {
    id: '3',
    profile_id: 'profile1',
    module_id: '3',
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    progress_percentage: 60,
    is_completed: false,
  },
]

/** Mock citation history */
const mockCitationHistory: Citation[] = [
  {
    id: '1',
    doer_id: 'doer1',
    url: 'https://www.ncbi.nlm.nih.gov/article/12345',
    style: 'APA',
    formatted_citation: 'National Center for Biotechnology Information. (2024). Article title. Retrieved from https://www.ncbi.nlm.nih.gov/article/12345',
    source_type: 'website',
    title: 'Article Title',
    author: null,
    publication_date: '2024',
    access_date: new Date().toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    doer_id: 'doer1',
    url: 'https://www.sciencedirect.com/science/article/abc123',
    style: 'Harvard',
    formatted_citation: 'ScienceDirect (2024) Research Study. Available at: https://www.sciencedirect.com/science/article/abc123',
    source_type: 'journal',
    title: 'Research Study',
    author: 'Smith, J.',
    publication_date: '2024',
    access_date: new Date().toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Resources page
 * Hub for all doer tools and resources
 */
export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ResourceView>('grid')
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([])
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([])
  const [citationHistory, setCitationHistory] = useState<Citation[]>([])

  /** Load initial data */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 500))
        setTrainingModules(mockTrainingModules)
        setTrainingProgress(mockTrainingProgress)
        setCitationHistory(mockCitationHistory)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  /** Handle resource click */
  const handleResourceClick = (resourceId: string) => {
    switch (resourceId) {
      case 'training-center':
        setCurrentView('training-center')
        break
      case 'ai-report':
        setCurrentView('ai-report')
        break
      case 'citation-builder':
        setCurrentView('citation-builder')
        break
      case 'templates':
        setCurrentView('templates')
        break
      default:
        setCurrentView('grid')
    }
  }

  /** Handle module complete */
  const handleModuleComplete = (moduleId: string) => {
    setTrainingProgress((prev) => {
      const existing = prev.find((p) => p.module_id === moduleId)
      if (existing) {
        return prev.map((p) =>
          p.module_id === moduleId
            ? { ...p, is_completed: true, progress_percentage: 100, completed_at: new Date().toISOString() }
            : p
        )
      }
      return [
        ...prev,
        {
          id: `new-${Date.now()}`,
          profile_id: 'profile1',
          module_id: moduleId,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          is_completed: true,
        },
      ]
    })
  }

  /** Handle template download */
  const handleTemplateDownload = (templateId: string) => {
    console.log('Downloading template:', templateId)
    // TODO: Implement actual download tracking
  }

  /** Back to grid */
  const handleBack = () => {
    setCurrentView('grid')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header - only show on grid view */}
      <AnimatePresence mode="wait">
        {currentView === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h1 className="text-2xl font-bold">Resources & Tools</h1>
            <p className="text-muted-foreground">
              Access training materials, templates, and productivity tools
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentView === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResourcesGrid onResourceClick={handleResourceClick} />
          </motion.div>
        )}

        {currentView === 'training-center' && (
          <motion.div
            key="training"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TrainingCenter
              modules={trainingModules}
              progress={trainingProgress}
              onModuleComplete={handleModuleComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentView === 'ai-report' && (
          <motion.div
            key="ai-report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AIReportGenerator onBack={handleBack} />
          </motion.div>
        )}

        {currentView === 'citation-builder' && (
          <motion.div
            key="citation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CitationBuilder
              history={citationHistory}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentView === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FormatTemplates
              onDownload={handleTemplateDownload}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
