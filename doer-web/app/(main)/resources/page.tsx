'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sparkles, BookOpen } from 'lucide-react'
import {
  ResourcesGrid,
  TrainingCenter,
  AIReportGenerator,
  CitationBuilder,
  FormatTemplates,
} from '@/components/resources'
import { getTrainingModules, getTrainingProgress, getCitationHistory } from '@/services/resources.service'
import { useAuth } from '@/hooks/useAuth'
import type { TrainingModule, TrainingProgress, Citation } from '@/types/database'

/** Resource view types */
type ResourceView = 'grid' | 'training-center' | 'ai-report' | 'citation-builder' | 'templates'

/**
 * Resources page
 * Professional hub for all doer tools and resources
 */
export default function ResourcesPage() {
  const { doer } = useAuth()
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
        const modules = await getTrainingModules()
        setTrainingModules(modules)

        if (doer?.id) {
          const [progress, citations] = await Promise.all([
            getTrainingProgress(doer.id),
            getCitationHistory(doer.id),
          ])
          setTrainingProgress(progress)
          setCitationHistory(citations)
        }
      } catch (error) {
        console.error('Error loading resources data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [doer?.id])

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

  // Calculate training progress
  const completedModules = trainingProgress.filter((p) => p.is_completed).length
  const totalMandatory = trainingModules.filter((m) => m.is_mandatory).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Resources & Tools</h1>
              <p className="text-muted-foreground">
                Access training materials, templates, and productivity tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2 py-1.5 px-3">
                <BookOpen className="h-4 w-4 text-teal-500" />
                <span>{completedModules}/{totalMandatory} modules completed</span>
              </Badge>
              <Badge variant="outline" className="gap-2 py-1.5 px-3">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>4 tools available</span>
              </Badge>
            </div>
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
