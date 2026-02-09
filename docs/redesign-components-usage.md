# Projects Redesign Components - Usage Guide

Quick reference for using the new redesigned project components.

## Component Files

All components are located in: `doer-web/components/projects/redesign/`

### Created Components (Task #2)

- **ProjectCard.tsx** - Modern project card with hover effects and animations
- **TimelineView.tsx** - Horizontal timeline with project nodes
- **FilterControls.tsx** - Advanced filtering with pill-style buttons
- **index.ts** - Barrel export for easy imports

## Quick Start Example

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ProjectCard,
  TimelineView,
  FilterControls,
  type FilterState,
  type ViewMode
} from '@/components/projects/redesign'

export default function ProjectsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    urgent: null,
    sortBy: 'deadline',
    sortDirection: 'asc'
  })

  const projects = [] // Load from API/database
  const filteredProjects = applyFilters(projects, filters)

  return (
    <div className="space-y-6">
      <FilterControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        totalProjects={projects.length}
        filteredProjects={filteredProjects.length}
      />

      {viewMode === 'timeline' ? (
        <TimelineView
          projects={filteredProjects}
          onProjectClick={(id) => router.push(`/projects/${id}`)}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectClick={(id) => router.push(`/projects/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

## Component Props

### ProjectCard
- `project`: Project data (required)
- `onProjectClick`: Card click handler
- `onOpenWorkspace`: Workspace button handler
- `onChatClick`: Chat button handler

### TimelineView
- `projects`: Array of projects (required)
- `onProjectClick`: Node click handler

### FilterControls
- `viewMode`: Current view mode (required)
- `onViewModeChange`: View change handler (required)
- `filters`: Filter state (required)
- `onFiltersChange`: Filter change handler (required)
- `totalProjects`: Total count (required)
- `filteredProjects`: Filtered count (required)

## Design Features

All components follow the dashboard design system with:
- Primary gradient: `from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF]`
- Hover lift effects with smooth transitions
- Pulse animations for active states
- Responsive design for all screen sizes
- Framer Motion animations
- Full TypeScript support
- Accessibility features (keyboard nav, ARIA labels)

For detailed documentation, see the README in the redesign folder.
