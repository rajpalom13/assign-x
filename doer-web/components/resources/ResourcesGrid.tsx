'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap,
  Bot,
  Quote,
  FileText,
  LucideIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Resource item type */
export interface ResourceItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  category: 'training' | 'tools' | 'templates'
  badge?: string
  isNew?: boolean
  isPremium?: boolean
}

interface ResourcesGridProps {
  /** Callback when a resource is clicked */
  onResourceClick: (resourceId: string) => void
  /** Additional class name */
  className?: string
}

/** Default resources configuration */
const defaultResources: ResourceItem[] = [
  {
    id: 'training-center',
    title: 'Training Center',
    description: 'Re-watch training videos and learn best practices for quality work',
    icon: GraduationCap,
    category: 'training',
    badge: 'Updated',
  },
  {
    id: 'ai-report',
    title: 'AI Report Generator',
    description: 'Check AI percentage in your work before submission to ensure originality',
    icon: Bot,
    category: 'tools',
    isNew: true,
  },
  {
    id: 'citation-builder',
    title: 'Citation Builder',
    description: 'Generate APA, Harvard, MLA references from URLs automatically',
    icon: Quote,
    category: 'tools',
  },
  {
    id: 'templates',
    title: 'Format Templates',
    description: 'Download standard Word, PPT, and Excel templates for your projects',
    icon: FileText,
    category: 'templates',
  },
]

/** Animation variants */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * Resources grid component
 * Professional design with gradient cards
 */
export function ResourcesGrid({ onResourceClick, className }: ResourcesGridProps) {
  /** Get category styles */
  const getCategoryStyles = (category: ResourceItem['category']) => {
    switch (category) {
      case 'training':
        return {
          badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
          iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
          gradient: 'stat-gradient-teal',
        }
      case 'tools':
        return {
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
          iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
          gradient: 'stat-gradient-purple',
        }
      case 'templates':
        return {
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
          gradient: 'stat-gradient-emerald',
        }
      default:
        return {
          badge: 'bg-muted',
          iconBg: 'bg-muted',
          gradient: '',
        }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-4', className)}
    >
      {defaultResources.map((resource) => {
        const Icon = resource.icon
        const styles = getCategoryStyles(resource.category)

        return (
          <motion.div key={resource.id} variants={itemVariants}>
            <Card
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group h-full overflow-hidden",
                styles.gradient
              )}
              onClick={() => onResourceClick(resource.id)}
            >
              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                {resource.isNew && (
                  <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 border-0 text-white text-xs gap-1 shadow-md">
                    <Sparkles className="h-3 w-3" />
                    New
                  </Badge>
                )}
                {resource.badge && (
                  <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                    {resource.badge}
                  </Badge>
                )}
                {resource.isPremium && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg',
                    styles.iconBg
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {resource.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">
                  {resource.description}
                </CardDescription>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <Badge
                    variant="outline"
                    className={cn('capitalize text-xs', styles.badge)}
                  >
                    {resource.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/**
 * Single resource card component
 * Can be used independently
 */
interface ResourceCardProps {
  resource: ResourceItem
  onClick: () => void
  className?: string
}

export function ResourceCard({ resource, onClick, className }: ResourceCardProps) {
  const Icon = resource.icon

  const getCategoryStyles = (category: ResourceItem['category']) => {
    switch (category) {
      case 'training':
        return {
          iconBg: 'bg-gradient-to-br from-teal-400 to-teal-600',
        }
      case 'tools':
        return {
          iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600',
        }
      case 'templates':
        return {
          iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
        }
      default:
        return {
          iconBg: 'bg-muted',
        }
    }
  }

  const styles = getCategoryStyles(resource.category)

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md',
            styles.iconBg
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm line-clamp-2">
          {resource.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
