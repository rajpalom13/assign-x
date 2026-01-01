/**
 * @fileoverview Resources page with quality tools, pricing guides, and training materials for supervisors.
 * @module app/(dashboard)/resources/page
 */

"use client"

import { useState, useCallback } from "react"
import {
  Search,
  Shield,
  Brain,
  Calculator,
  BookOpen,
  FileText,
  HelpCircle,
  ArrowLeft,
  ExternalLink,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  PlagiarismChecker,
  AIDetector,
  PricingGuide,
  TrainingLibrary,
  GrammarChecker,
} from "@/components/resources"
import { analyzeForAI, checkPlagiarism } from "@/lib/services/content-analysis"

type ResourceView =
  | "grid"
  | "plagiarism"
  | "ai-detector"
  | "grammar"
  | "pricing"
  | "guidelines"
  | "faq"
  | "training"
  | "courses"

interface ResourceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  iconBgColor: string
  onClick: () => void
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

function ResourceCard({
  title,
  description,
  icon,
  iconBgColor,
  onClick,
  badge,
  badgeVariant = "secondary",
}: ResourceCardProps) {
  return (
    <Card
      className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center shrink-0",
              iconBgColor
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {title}
              </h3>
              {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** Service Guidelines Component */
function ServiceGuidelines() {
  const guidelines = [
    {
      category: "Essay Writing",
      standards: [
        "Maintain academic integrity and proper citation formats (APA, MLA, Chicago)",
        "Ensure original content with plagiarism score below 15%",
        "Include proper thesis statement and structured arguments",
        "Minimum word count adherence with quality over quantity focus",
      ],
    },
    {
      category: "Research Papers",
      standards: [
        "Use peer-reviewed sources and academic databases",
        "Include methodology section when applicable",
        "Proper literature review with critical analysis",
        "Data presentation with appropriate charts and tables",
      ],
    },
    {
      category: "Technical Assignments",
      standards: [
        "Code must be well-documented with comments",
        "Follow best practices and coding standards",
        "Include test cases and error handling",
        "Provide clear instructions for running/testing",
      ],
    },
    {
      category: "Quality Assurance",
      standards: [
        "All submissions must pass plagiarism check (<15%)",
        "AI content detection must be below 20%",
        "Grammar and spelling errors should be minimal",
        "Formatting must match client requirements",
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-base">Service Guidelines</CardTitle>
            <CardDescription>Standards and expectations for each service type</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            {guidelines.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {section.category}
                </h3>
                <ul className="space-y-2 ml-6">
                  {section.standards.map((standard, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {standard}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/** FAQ Section Component */
function FAQSection() {
  const faqs = [
    {
      question: "How do I accept a new project?",
      answer: "Go to the Projects page, find available projects in the 'Available' tab, review the requirements, and click 'Accept Project' to start working on it.",
    },
    {
      question: "What should I do if a client requests revisions?",
      answer: "Review the revision request carefully, communicate with the client through chat if needed, make the necessary changes, and resubmit. Always maintain professionalism.",
    },
    {
      question: "How is my rating calculated?",
      answer: "Your rating is based on client satisfaction, on-time delivery, quality of work, and revision frequency. Consistently high-quality work improves your rating.",
    },
    {
      question: "What are the plagiarism thresholds?",
      answer: "All submissions should have less than 15% similarity score. AI-generated content should be below 20%. Use the quality tools to check before submitting.",
    },
    {
      question: "How do I handle deadline extensions?",
      answer: "Contact the client through chat to discuss extension needs. If approved, update the deadline in the project settings. Always communicate proactively about delays.",
    },
    {
      question: "What payment methods are supported?",
      answer: "Payments are processed weekly via bank transfer, PayPal, or other configured payment methods. Check your profile settings to set up payment preferences.",
    },
    {
      question: "How do I improve my supervisor rating?",
      answer: "Deliver high-quality work on time, maintain clear communication, minimize revision requests, and consistently meet or exceed client expectations.",
    },
    {
      question: "What happens if I need to cancel a project?",
      answer: "Contact support immediately. Cancellations affect your reliability score. Only cancel in unavoidable circumstances and provide adequate notice.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <CardTitle className="text-base">FAQ & Help</CardTitle>
            <CardDescription>Frequently asked questions and troubleshooting guides</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Accordion type="single" collapsible className="space-y-2 pr-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

/** External Courses Component */
function ExternalCourses() {
  const courses = [
    {
      title: "Academic Writing Fundamentals",
      provider: "Coursera",
      duration: "4 weeks",
      level: "Beginner",
      url: "https://www.coursera.org/learn/academic-writing",
    },
    {
      title: "Research Methods & Data Analysis",
      provider: "edX",
      duration: "6 weeks",
      level: "Intermediate",
      url: "https://www.edx.org/learn/research",
    },
    {
      title: "Technical Writing for Professionals",
      provider: "LinkedIn Learning",
      duration: "3 hours",
      level: "All Levels",
      url: "https://www.linkedin.com/learning/technical-writing",
    },
    {
      title: "APA & Citation Mastery",
      provider: "Purdue OWL",
      duration: "Self-paced",
      level: "All Levels",
      url: "https://owl.purdue.edu/owl/research_and_citation/apa_style/",
    },
    {
      title: "Critical Thinking & Analysis",
      provider: "Udemy",
      duration: "5 hours",
      level: "Beginner",
      url: "https://www.udemy.com/topic/critical-thinking/",
    },
    {
      title: "Plagiarism Prevention Workshop",
      provider: "Turnitin",
      duration: "2 hours",
      level: "All Levels",
      url: "https://www.turnitin.com/resources",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <ExternalLink className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-base">External Courses</CardTitle>
            <CardDescription>Access partner courses and certifications to enhance your skills</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="grid gap-4 pr-4">
            {courses.map((course, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{course.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{course.provider}</Badge>
                        <span>•</span>
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(course.url, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function ResourcesPage() {
  const [activeView, setActiveView] = useState<ResourceView>("grid")

  /** Handle AI detection with built-in service */
  const handleAIDetect = useCallback(async (content: string | File) => {
    const text = typeof content === "string" ? content : await content.text()
    return analyzeForAI(text)
  }, [])

  /** Handle plagiarism check with built-in service */
  const handlePlagiarismCheck = useCallback(async (content: string | File) => {
    const text = typeof content === "string" ? content : await content.text()
    return checkPlagiarism(text)
  }, [])

  const renderContent = () => {
    switch (activeView) {
      case "plagiarism":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <PlagiarismChecker onCheck={handlePlagiarismCheck} />
          </div>
        )
      case "ai-detector":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <AIDetector onDetect={handleAIDetect} />
          </div>
        )
      case "pricing":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <PricingGuide />
          </div>
        )
      case "training":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <TrainingLibrary />
          </div>
        )
      case "grammar":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <GrammarChecker />
          </div>
        )
      case "guidelines":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <ServiceGuidelines />
          </div>
        )
      case "faq":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <FAQSection />
          </div>
        )
      case "courses":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("grid")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Button>
            <ExternalCourses />
          </div>
        )
      default:
        return (
          <div className="space-y-8">
            {/* Quality Tools Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Quality Tools</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Plagiarism Checker"
                  description="Verify the originality of submitted work against millions of sources"
                  icon={<Search className="h-6 w-6 text-blue-600" />}
                  iconBgColor="bg-blue-100"
                  onClick={() => setActiveView("plagiarism")}
                  badge="Essential"
                />
                <ResourceCard
                  title="AI Content Detector"
                  description="Detect AI-generated content in submissions with advanced analysis"
                  icon={<Brain className="h-6 w-6 text-purple-600" />}
                  iconBgColor="bg-purple-100"
                  onClick={() => setActiveView("ai-detector")}
                  badge="Essential"
                />
                <ResourceCard
                  title="Grammar Checker"
                  description="Check for grammatical errors and writing style issues"
                  icon={<Sparkles className="h-6 w-6 text-green-600" />}
                  iconBgColor="bg-green-100"
                  onClick={() => setActiveView("grammar")}
                />
              </div>
            </div>

            {/* Pricing & Guides Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Pricing & Guides</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Pricing Guide"
                  description="Reference sheet and calculator for setting competitive quotes"
                  icon={<Calculator className="h-6 w-6 text-emerald-600" />}
                  iconBgColor="bg-emerald-100"
                  onClick={() => setActiveView("pricing")}
                />
                <ResourceCard
                  title="Service Guidelines"
                  description="Standards and expectations for each service type"
                  icon={<Shield className="h-6 w-6 text-amber-600" />}
                  iconBgColor="bg-amber-100"
                  onClick={() => setActiveView("guidelines")}
                />
                <ResourceCard
                  title="FAQ & Help"
                  description="Frequently asked questions and troubleshooting guides"
                  icon={<HelpCircle className="h-6 w-6 text-slate-600" />}
                  iconBgColor="bg-slate-100"
                  onClick={() => setActiveView("faq")}
                />
              </div>
            </div>

            {/* Training Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Training & Development</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Training Library"
                  description="Video tutorials and guides to enhance your skills"
                  icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
                  iconBgColor="bg-indigo-100"
                  onClick={() => setActiveView("training")}
                />
                <ResourceCard
                  title="External Courses"
                  description="Access partner courses and certifications"
                  icon={<ExternalLink className="h-6 w-6 text-violet-600" />}
                  iconBgColor="bg-violet-100"
                  onClick={() => setActiveView("courses")}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Resource Usage</CardTitle>
                <CardDescription>
                  Tools and resources you&apos;ve used this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Search className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-xs text-muted-foreground">
                        Plagiarism Checks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">18</p>
                      <p className="text-xs text-muted-foreground">
                        AI Detections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold">42</p>
                      <p className="text-xs text-muted-foreground">
                        Price Calculations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="text-2xl font-bold">5/9</p>
                      <p className="text-xs text-muted-foreground">
                        Videos Completed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {activeView === "grid" && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Resources & Tools
          </h2>
          <p className="text-muted-foreground">
            Quality tools, pricing guides, and training materials
          </p>
        </div>
      )}

      {renderContent()}
    </div>
  )
}
