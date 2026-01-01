/**
 * @fileoverview Training content viewer with video and document progress tracking.
 * @module components/activation/training-viewer
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface TrainingModule {
  id: string
  title: string
  description: string
  type: "video" | "pdf" | "text"
  duration: string
  content: string
  completed: boolean
}

interface TrainingViewerProps {
  modules: TrainingModule[]
  onModuleComplete: (moduleId: string) => void
  onAllComplete: () => void
}

const defaultModules: TrainingModule[] = [
  {
    id: "qc-basics",
    title: "How to QC a File",
    description: "Learn the fundamentals of quality control for submitted work",
    type: "text",
    duration: "5 min",
    content: `
# Quality Control Basics

As a supervisor, quality control is your primary responsibility. Here's what you need to know:

## 1. Check for Completeness
- Verify all requirements from the project brief are addressed
- Ensure proper formatting and structure
- Check that all sections are complete

## 2. Verify Accuracy
- Cross-reference facts and figures
- Check calculations and data
- Verify citations and references

## 3. Assess Quality
- Evaluate clarity of writing
- Check for grammatical errors
- Ensure logical flow and coherence

## 4. Plagiarism & AI Detection
- Run submissions through plagiarism checker
- Use AI detection tools when necessary
- Flag any concerns for review

## 5. Final Review
- Read through the complete work
- Ensure it meets client expectations
- Prepare feedback if revisions needed
    `,
    completed: false,
  },
  {
    id: "pricing-guidelines",
    title: "Pricing Guidelines",
    description: "Understanding how to set fair and accurate quotes",
    type: "text",
    duration: "4 min",
    content: `
# Pricing Guidelines

Setting the right price is crucial for both client satisfaction and doer compensation.

## Base Pricing Factors

### Word/Page Count
- Standard rate: Base price per page/word
- Higher rates for technical content
- Lower rates for simple formatting tasks

### Urgency Multipliers
- 24-hour deadline: 1.5x base rate
- 48-hour deadline: 1.3x base rate
- 72-hour deadline: 1.15x base rate
- Standard (3+ days): 1.0x base rate

### Complexity Levels
- Easy (basic formatting, simple topics): 1.0x
- Medium (research required, technical): 1.2x
- Hard (expert-level, complex analysis): 1.5x

## Commission Structure
- Supervisor commission: 15% of project value
- Platform fee: 20% of project value
- Doer payout: Remaining 65%

## Best Practices
1. Always review the full requirements before quoting
2. Consider the subject complexity
3. Factor in revision likelihood
4. Be competitive but fair
    `,
    completed: false,
  },
  {
    id: "communication-ethics",
    title: "Communication Ethics",
    description: "Guidelines for professional communication with clients and doers",
    type: "text",
    duration: "4 min",
    content: `
# Communication Ethics

Professional communication is key to successful project management.

## Golden Rules

### 1. Maintain Professionalism
- Always be courteous and respectful
- Use clear, concise language
- Respond promptly to messages

### 2. Protect Privacy
- Never share client information with doers
- Don't share doer details with clients
- Keep all project details confidential

### 3. Contact Sharing Prevention
- **CRITICAL**: Never allow exchange of personal contact information
- Monitor chats for phone numbers, emails, social media handles
- Suspend chat immediately if contact sharing is detected
- Report violations to admin

### 4. Conflict Resolution
- Stay neutral in disputes
- Focus on project requirements
- Escalate to admin when necessary

### 5. Setting Expectations
- Be clear about deadlines
- Communicate revision policies
- Provide constructive feedback

## Red Flags to Watch
- Requests to communicate outside the platform
- Attempts to share personal contact details
- Unprofessional language or behavior
- Requests that violate platform terms
    `,
    completed: false,
  },
]

export function TrainingViewer({
  modules = defaultModules,
  onModuleComplete,
  onAllComplete,
}: TrainingViewerProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [isReading, setIsReading] = useState(false)

  const currentModule = modules[currentModuleIndex]
  const allCompleted = completedModules.size === modules.length

  const progress = (completedModules.size / modules.length) * 100

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedModules)
    newCompleted.add(currentModule.id)
    setCompletedModules(newCompleted)
    onModuleComplete(currentModule.id)

    if (newCompleted.size === modules.length) {
      // All modules complete
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1)
      setIsReading(false)
    }
  }

  const handleNext = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1)
      setIsReading(false)
    }
  }

  const handlePrev = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1)
      setIsReading(false)
    }
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return PlayCircle
      case "pdf":
        return FileText
      default:
        return BookOpen
    }
  }

  if (allCompleted && !isReading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6"
      >
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Training Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You&apos;ve successfully completed all training modules. Ready for the assessment?
          </p>
          <Button size="lg" onClick={onAllComplete}>
            Proceed to Assessment
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Supervisor Training</h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Complete all modules to proceed to the assessment
            </p>
            <span className="text-sm font-medium">
              {completedModules.size}/{modules.length} completed
            </span>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Module List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Modules</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {modules.map((module, index) => {
                  const Icon = getModuleIcon(module.type)
                  const isCompleted = completedModules.has(module.id)
                  const isCurrent = index === currentModuleIndex

                  return (
                    <button
                      key={module.id}
                      onClick={() => {
                        setCurrentModuleIndex(index)
                        setIsReading(false)
                      }}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-l-2 ${
                        isCurrent
                          ? "bg-primary/5 border-l-primary"
                          : "border-l-transparent hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : isCurrent
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{module.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Content Viewer */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentModule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{currentModule.title}</CardTitle>
                        <CardDescription>{currentModule.description}</CardDescription>
                      </div>
                      {completedModules.has(currentModule.id) && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    {!isReading ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          {(() => {
                            const Icon = getModuleIcon(currentModule.type)
                            return <Icon className="w-8 h-8 text-primary" />
                          })()}
                        </div>
                        <h3 className="text-lg font-medium mb-2">{currentModule.title}</h3>
                        <p className="text-muted-foreground mb-4">{currentModule.description}</p>
                        <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4" />
                          Estimated time: {currentModule.duration}
                        </p>
                        <Button onClick={() => setIsReading(true)}>
                          Start Reading
                        </Button>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {currentModule.content.split("\n").map((line, i) => {
                          if (line.startsWith("# ")) {
                            return (
                              <h1 key={i} className="text-2xl font-bold mt-6 mb-4">
                                {line.slice(2)}
                              </h1>
                            )
                          }
                          if (line.startsWith("## ")) {
                            return (
                              <h2 key={i} className="text-xl font-semibold mt-6 mb-3">
                                {line.slice(3)}
                              </h2>
                            )
                          }
                          if (line.startsWith("### ")) {
                            return (
                              <h3 key={i} className="text-lg font-medium mt-4 mb-2">
                                {line.slice(4)}
                              </h3>
                            )
                          }
                          if (line.startsWith("- ")) {
                            return (
                              <li key={i} className="ml-4">
                                {line.slice(2)}
                              </li>
                            )
                          }
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return (
                              <p key={i} className="font-bold text-destructive">
                                {line.slice(2, -2)}
                              </p>
                            )
                          }
                          if (line.trim()) {
                            return (
                              <p key={i} className="mb-2">
                                {line}
                              </p>
                            )
                          }
                          return null
                        })}
                      </div>
                    )}
                  </CardContent>

                  {isReading && (
                    <>
                      <Separator />
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentModuleIndex === 0}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleNext}
                            disabled={currentModuleIndex === modules.length - 1}
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                        {!completedModules.has(currentModule.id) && (
                          <Button onClick={handleMarkComplete}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Complete
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
