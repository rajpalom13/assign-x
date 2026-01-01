'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap,
  Bot,
  Quote,
  FileText,
  LucideIcon,
  ArrowRight,
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
    description: 'Re-watch training videos and learn best practices',
    icon: GraduationCap,
    category: 'training',
    badge: 'Updated',
  },
  {
    id: 'ai-report',
    title: 'AI Report Generator',
    description: 'Check AI percentage in your work before submission',
    icon: Bot,
    category: 'tools',
    isNew: true,
  },
  {
    id: 'citation-builder',
    title: 'Citation Builder',
    description: 'Generate APA, Harvard, MLA references from URLs',
    icon: Quote,
    category: 'tools',
  },
  {
    id: 'templates',
    title: 'Format Templates',
    description: 'Download standard Word, PPT, and Excel templates',
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
 * Displays a grid of available tools and resources
 */
export function ResourcesGrid({ onResourceClick, className }: ResourcesGridProps) {
  /** Get category color */
  const getCategoryColor = (category: ResourceItem['category']) => {
    switch (category) {
      case 'training':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'tools':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'templates':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      default:
        return 'bg-muted'
    }
  }

  /** Get icon background color */
  const getIconBg = (category: ResourceItem['category']) => {
    switch (category) {
      case 'training':
        return 'bg-blue-500/10 text-blue-600'
      case 'tools':
        return 'bg-purple-500/10 text-purple-600'
      case 'templates':
        return 'bg-green-500/10 text-green-600'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
    >
      {defaultResources.map((resource) => {
        const Icon = resource.icon

        return (
          <motion.div key={resource.id} variants={itemVariants}>
            <Card
              className="relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group h-full"
              onClick={() => onResourceClick(resource.id)}
            >
              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-1">
                {resource.isNew && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    New
                  </Badge>
                )}
                {resource.badge && (
                  <Badge variant="outline" className="text-xs">
                    {resource.badge}
                  </Badge>
                )}
                {resource.isPremium && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center mb-3',
                    getIconBg(resource.category)
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {resource.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {resource.description}
                </CardDescription>

                <div className="flex items-center justify-between mt-4">
                  <Badge
                    variant="outline"
                    className={cn('capitalize text-xs', getCategoryColor(resource.category))}
                  >
                    {resource.category}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

  const getIconBg = (category: ResourceItem['category']) => {
    switch (category) {
      case 'training':
        return 'bg-blue-500/10 text-blue-600'
      case 'tools':
        return 'bg-purple-500/10 text-purple-600'
      case 'templates':
        return 'bg-green-500/10 text-green-600'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
            getIconBg(resource.category)
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base group-hover:text-primary transition-colors">
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
