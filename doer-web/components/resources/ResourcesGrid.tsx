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
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/** Resource item type */
export interface ResourceItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  category: 'training' | 'tools' | 'templates'
  eyebrow?: string
  meta?: string
  cta?: string
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
    description: 'Learning tracks built for consistent delivery.',
    icon: GraduationCap,
    category: 'training',
    badge: 'Updated',
    eyebrow: 'Learning Path',
    cta: 'Resume learning',
  },
  {
    id: 'ai-report',
    title: 'AI Report Generator',
    description: 'Fast, clear originality checks.',
    icon: Bot,
    category: 'tools',
    isNew: true,
    eyebrow: 'Quality Check',
    cta: 'Analyze draft',
  },
  {
    id: 'citation-builder',
    title: 'Citation Builder',
    description: 'Citations in any format, instantly.',
    icon: Quote,
    category: 'tools',
    eyebrow: 'Reference Desk',
    cta: 'Create citation',
  },
  {
    id: 'templates',
    title: 'Format Templates',
    description: 'Polished templates for every doc.',
    icon: FileText,
    category: 'templates',
    eyebrow: 'Template Vault',
    cta: 'Browse templates',
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

type ResourceStyle = {
  chip: string
  iconBg: string
  glow: string
  accent: string
}

interface ResourceCardBaseProps {
  resource: ResourceItem
  styles: ResourceStyle
  onClick: () => void
}

/**
 * Resources grid component
 * Asymmetric layout with featured cards and quick entries.
 */
export function ResourcesGrid({ onResourceClick, className }: ResourcesGridProps) {
  /** Get category styles */
  const getCategoryStyles = (category: ResourceItem['category']): ResourceStyle => {
    switch (category) {
      case 'training':
        return {
          chip: 'bg-[#E3E9FF] text-[#4F6CF7] border-white/60',
          iconBg: 'bg-[#4F6CF7]',
          glow: 'shadow-[0_16px_35px_rgba(91,124,255,0.2)]',
          accent: 'text-[#4F6CF7]',
        }
      case 'tools':
        return {
          chip: 'bg-[#E6F4FF] text-[#4B9BFF] border-white/60',
          iconBg: 'bg-[#45C7F3]',
          glow: 'shadow-[0_16px_35px_rgba(69,199,243,0.2)]',
          accent: 'text-[#45C7F3]',
        }
      case 'templates':
        return {
          chip: 'bg-[#FFE7E1] text-[#FF8B6A] border-white/60',
          iconBg: 'bg-[#FF9B7A]',
          glow: 'shadow-[0_16px_35px_rgba(255,155,122,0.25)]',
          accent: 'text-[#FF8B6A]',
        }
      default:
        return {
          chip: 'bg-muted',
          iconBg: 'bg-muted',
          glow: '',
          accent: 'text-slate-600',
        }
    }
  }

  const featured = defaultResources.slice(0, 2)
  const compact = defaultResources.slice(2)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]', className)}
    >
      <div className="grid gap-6">
        {featured.map((resource) => (
          <ResourceFeatureCard
            key={resource.id}
            resource={resource}
            styles={getCategoryStyles(resource.category)}
            onClick={() => onResourceClick(resource.id)}
          />
        ))}
        <ResourceShowcaseCard />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {compact.map((resource) => (
          <ResourceCompactCard
            key={resource.id}
            resource={resource}
            styles={getCategoryStyles(resource.category)}
            onClick={() => onResourceClick(resource.id)}
          />
        ))}
        <ResourceGuideCard />
      </div>
    </motion.div>
  )
}

/**
 * Featured resource card for primary tools.
 */
function ResourceFeatureCard({ resource, styles, onClick }: ResourceCardBaseProps) {
  const Icon = resource.icon

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={cn(
          'relative overflow-hidden cursor-pointer border-none bg-white/85 p-6 transition-all hover:-translate-y-1',
          styles.glow
        )}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,124,255,0.12),transparent_60%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_140px]">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn('text-xs', styles.chip)}>
              {resource.eyebrow}
            </Badge>
            {resource.isNew && (
              <Badge className="bg-gradient-to-r from-[#5B7CFF] to-[#49C5FF] border-0 text-white text-xs gap-1">
                <Sparkles className="h-3 w-3" />
                New
              </Badge>
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', styles.iconBg)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-lg text-slate-900">{resource.title}</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {resource.description}
              </CardDescription>
            </div>
          </div>
          <div className={cn('flex items-center gap-1 text-sm font-semibold', styles.accent)}>
            {resource.cta}
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="h-28 w-28 rounded-[28px] bg-white/80 shadow-[0_18px_40px_rgba(30,58,138,0.12)] relative overflow-hidden">
              <div className="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-[#E6F4FF]" />
              <div className="absolute bottom-4 right-4 h-12 w-12 rounded-2xl bg-[#FFE7E1]" />
              <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EEF2FF]" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Compact resource card for secondary tools.
 */
function ResourceCompactCard({ resource, styles, onClick }: ResourceCardBaseProps) {
  const Icon = resource.icon

  return (
    <motion.div variants={itemVariants}>
      <Card
        className="cursor-pointer border-none bg-white/85 p-5 shadow-[0_16px_35px_rgba(30,58,138,0.08)] transition-all hover:-translate-y-1"
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className={cn('text-xs', styles.chip)}>
              {resource.eyebrow}
            </Badge>
            <div>
              <CardTitle className="text-base text-slate-900">{resource.title}</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {resource.description}
              </CardDescription>
            </div>
          </div>
          <div className={cn('h-10 w-10 rounded-2xl flex items-center justify-center', styles.iconBg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">Quick access</span>
          <span className={cn('text-xs font-semibold', styles.accent)}>{resource.cta}</span>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Pulse card for learning highlights.
 */
function ResourceShowcaseCard() {
  return (
    <Card className="border-none bg-gradient-to-br from-[#EEF2FF] via-[#F3F5FF] to-[#E9FAFA] p-6 shadow-[0_24px_60px_rgba(30,58,138,0.12)]">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_160px]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4F6CF7]">Resource Studio</p>
          <p className="text-base font-semibold text-slate-900">A calmer workflow for busy days.</p>
          <p className="text-sm text-slate-500">Keep everything in one place with a softer focus.</p>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="h-28 w-28 rounded-[28px] bg-white/85 shadow-[0_18px_40px_rgba(30,58,138,0.12)] relative overflow-hidden">
            <div className="absolute top-3 left-4 h-6 w-16 rounded-full bg-[#E3E9FF]" />
            <div className="absolute bottom-4 left-6 h-8 w-8 rounded-2xl bg-[#E6F4FF]" />
            <div className="absolute top-8 right-6 h-10 w-10 rounded-full bg-[#FFE7E1]" />
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * Quick guide card for finishing touches.
 */
function ResourceGuideCard() {
  return (
    <Card className="border-none bg-white/85 p-5 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Guide</p>
        <p className="text-base font-semibold text-slate-900">Finish line checklist</p>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>Run AI report before submitting</li>
          <li>Verify citations for every source</li>
          <li>Use templates to match format rules</li>
        </ul>
      </div>
    </Card>
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
          iconBg: 'bg-[#4F6CF7]',
        }
      case 'tools':
        return {
          iconBg: 'bg-[#45C7F3]',
        }
      case 'templates':
        return {
          iconBg: 'bg-[#FF9B7A]',
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
        'cursor-pointer transition-all duration-300 hover:shadow-[0_16px_35px_rgba(30,58,138,0.12)] hover:-translate-y-0.5 group border-none bg-white/85',
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
        <CardTitle className="text-base group-hover:text-[#4F6CF7] transition-colors">
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm line-clamp-2 text-slate-500">
          {resource.description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
