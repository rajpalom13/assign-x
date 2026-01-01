/**
 * @fileoverview FAQ accordion component with searchable questions.
 * @module components/support/faq-accordion
 */

"use client"

import { useState, useMemo } from "react"
import { Search, HelpCircle, ChevronDown } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ } from "./types"

// Static FAQ configuration data - these FAQs are managed as static content
const STATIC_FAQS: FAQ[] = [
  // Getting Started
  {
    id: "faq-1",
    question: "How do I get started as a supervisor?",
    answer: "To get started, complete the registration process by providing your professional details and banking information. After verification, you'll need to complete the training modules and pass the supervisor test to unlock your dashboard.",
    category: "Getting Started",
    order: 1,
  },
  {
    id: "faq-2",
    question: "What are the requirements to become a supervisor?",
    answer: "You need to have relevant academic qualifications (minimum post-graduate), at least 3 years of experience in your field, and pass our verification process. You'll also need to complete the training modules and score at least 80% on the supervisor test.",
    category: "Getting Started",
    order: 2,
  },
  // Projects
  {
    id: "faq-3",
    question: "How do I quote a project?",
    answer: "When you receive a new project request, click 'Analyze & Quote' to review the requirements. Consider factors like word count, complexity, deadline, and subject matter. Use the pricing guide as reference and set a fair price that covers the doer payout, your commission, and platform fees.",
    category: "Projects",
    order: 1,
  },
  {
    id: "faq-4",
    question: "How do I assign a doer to a project?",
    answer: "After a project is paid, go to 'Ready to Assign' section, click 'Assign Doer', and browse available experts. Filter by subject, availability, and rating. Review their profile and past performance before making an assignment.",
    category: "Projects",
    order: 2,
  },
  {
    id: "faq-5",
    question: "What should I check during quality control (QC)?",
    answer: "During QC, verify: 1) The work meets all project requirements, 2) Plagiarism check results are acceptable (<15%), 3) AI detection is within limits if applicable, 4) Formatting follows guidelines, 5) The work is complete and professionally presented.",
    category: "Projects",
    order: 3,
  },
  // Payments
  {
    id: "faq-6",
    question: "How is my commission calculated?",
    answer: "Your commission is 15% of the user's payment amount. For example, if a user pays ₹2,000 for a project, your commission would be ₹300. The doer receives 65% (₹1,300) and the platform takes 20% (₹400).",
    category: "Payments",
    order: 1,
  },
  {
    id: "faq-7",
    question: "When can I withdraw my earnings?",
    answer: "You can withdraw your available balance once it reaches the minimum threshold of ₹500. Withdrawals are processed within 24-48 hours on business days. Make sure your bank details are up to date.",
    category: "Payments",
    order: 2,
  },
  {
    id: "faq-8",
    question: "Why is some of my balance shown as 'pending'?",
    answer: "Balance shows as pending when a project is still in progress or awaiting client approval. Once the project is completed and approved by the client, the amount moves to your available balance.",
    category: "Payments",
    order: 3,
  },
  // Doers
  {
    id: "faq-9",
    question: "How do I blacklist a doer?",
    answer: "Go to Doer Management or the doer's profile, click 'Add to Blacklist' and provide a reason. Blacklisted doers won't appear in your assignment list. You can remove them from the blacklist later if needed.",
    category: "Doers",
    order: 1,
  },
  {
    id: "faq-10",
    question: "What if a doer misses the deadline?",
    answer: "Contact the doer immediately to understand the situation. If the delay is significant, you may need to reassign the project. Report recurring issues to support and consider blacklisting repeatedly problematic doers.",
    category: "Doers",
    order: 2,
  },
  // Account
  {
    id: "faq-11",
    question: "How do I update my bank details?",
    answer: "Go to Profile > Edit Profile > Banking Details. Update your information and save. Bank detail changes may require re-verification before you can make withdrawals.",
    category: "Account",
    order: 1,
  },
  {
    id: "faq-12",
    question: "How do I toggle my availability?",
    answer: "Use the availability toggle in the menu drawer or your profile. When set to 'Busy', you won't receive new project notifications. Set to 'Available' when you're ready to take on new projects.",
    category: "Account",
    order: 2,
  },
]

const CATEGORIES = ["All", "Getting Started", "Projects", "Payments", "Doers", "Account"]

export function FAQAccordion() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredFAQs = useMemo(() => {
    let result = [...STATIC_FAQS]

    if (selectedCategory !== "All") {
      result = result.filter((faq) => faq.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => a.order - b.order)
  }, [searchQuery, selectedCategory])

  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {}
    filteredFAQs.forEach((faq) => {
      if (!groups[faq.category]) {
        groups[faq.category] = []
      }
      groups[faq.category].push(faq)
    })
    return groups
  }, [filteredFAQs])

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No FAQs found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching with different keywords
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFAQs).map(([category, faqs]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{faqs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left text-sm hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
