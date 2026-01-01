/**
 * @fileoverview Supervisor certification quiz with timed questions and validation.
 * @module components/activation/supervisor-quiz
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizResult {
  score: number
  totalQuestions: number
  passed: boolean
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[]
}

interface SupervisorQuizProps {
  onComplete: (result: QuizResult) => void
  passingScore?: number
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the first thing you should check during quality control?",
    options: [
      "Grammar and spelling",
      "Completeness - verifying all requirements are addressed",
      "Formatting and fonts",
      "Word count",
    ],
    correctAnswer: 1,
    explanation: "Completeness is the foundation of QC. Always verify all project requirements are addressed before checking other aspects.",
  },
  {
    id: "q2",
    question: "What is the urgency multiplier for a 24-hour deadline?",
    options: ["1.0x", "1.15x", "1.3x", "1.5x"],
    correctAnswer: 3,
    explanation: "24-hour deadline projects have a 1.5x multiplier due to the urgent turnaround requirement.",
  },
  {
    id: "q3",
    question: "If you detect a doer attempting to share their phone number with a client, what should you do?",
    options: [
      "Allow it if the client agrees",
      "Warn the doer but let the conversation continue",
      "Suspend the chat immediately and report to admin",
      "Delete the message and continue",
    ],
    correctAnswer: 2,
    explanation: "Contact sharing is a serious violation. You must suspend the chat immediately and report to admin.",
  },
  {
    id: "q4",
    question: "What percentage of the project value does a supervisor receive as commission?",
    options: ["10%", "15%", "20%", "25%"],
    correctAnswer: 1,
    explanation: "Supervisors receive 15% commission, while the platform takes 20% and doers receive 65%.",
  },
  {
    id: "q5",
    question: "When should you use the AI detection tool?",
    options: [
      "Only when the client specifically requests it",
      "On every submission to ensure work quality",
      "Never - it's not reliable",
      "Only on suspicious submissions",
    ],
    correctAnswer: 1,
    explanation: "AI detection should be used on every submission as part of standard quality control to maintain work integrity.",
  },
  {
    id: "q6",
    question: "What is the complexity multiplier for a hard/expert-level task?",
    options: ["1.0x", "1.2x", "1.5x", "2.0x"],
    correctAnswer: 2,
    explanation: "Hard/expert-level tasks have a 1.5x complexity multiplier due to the specialized knowledge required.",
  },
  {
    id: "q7",
    question: "If a client requests changes after delivery, what is the correct action?",
    options: [
      "Reject the request - delivery is final",
      "Send it back to the doer with clear feedback",
      "Make the changes yourself",
      "Refund the client immediately",
    ],
    correctAnswer: 1,
    explanation: "Valid revision requests should be sent back to the doer with clear, constructive feedback for improvement.",
  },
  {
    id: "q8",
    question: "What information should you NEVER share with clients?",
    options: [
      "Project timeline",
      "Doer's personal details and contact information",
      "Pricing breakdown",
      "Quality report results",
    ],
    correctAnswer: 1,
    explanation: "Doer privacy must be protected. Never share their personal details or contact information with clients.",
  },
  {
    id: "q9",
    question: "When reviewing citations and references, you should:",
    options: [
      "Trust the doer's work without checking",
      "Verify that citations are properly formatted and references exist",
      "Only check if the client mentions citations in requirements",
      "Skip this step for shorter projects",
    ],
    correctAnswer: 1,
    explanation: "Always verify citations are properly formatted and that referenced sources actually exist and are relevant.",
  },
  {
    id: "q10",
    question: "If there's a dispute between client and doer, the supervisor should:",
    options: [
      "Always side with the client since they're paying",
      "Always side with the doer to maintain relationships",
      "Stay neutral, focus on project requirements, and escalate if necessary",
      "Ignore the dispute and let them resolve it themselves",
    ],
    correctAnswer: 2,
    explanation: "Supervisors must remain neutral, focus on objective project requirements, and escalate to admin when needed.",
  },
]

export function SupervisorQuiz({ onComplete, passingScore = 70 }: SupervisorQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100
  const selectedAnswer = answers[currentQuestion.id]

  const handleAnswerSelect = (value: string) => {
    if (showExplanation) return
    setAnswers({ ...answers, [currentQuestion.id]: parseInt(value) })
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Calculate results
    const results: QuizResult["answers"] = quizQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? -1,
      isCorrect: answers[q.id] === q.correctAnswer,
    }))

    const correctCount = results.filter((r) => r.isCorrect).length
    const score = Math.round((correctCount / quizQuestions.length) * 100)

    setTimeout(() => {
      onComplete({
        score,
        totalQuestions: quizQuestions.length,
        passed: score >= passingScore,
        answers: results,
      })
    }, 1000)
  }

  const allAnswered = Object.keys(answers).length === quizQuestions.length

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Supervisor Assessment</h1>
          <p className="text-muted-foreground mb-4">
            Answer all questions to complete the assessment. You need {passingScore}% to pass.
          </p>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
            <span className="font-medium">
              {Object.keys(answers).length}/{quizQuestions.length} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
                {showExplanation && (
                  <CardDescription className="flex items-start gap-2 mt-4 p-3 bg-muted rounded-lg">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{currentQuestion.explanation}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrect = index === currentQuestion.correctAnswer
                    const showResult = showExplanation

                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          showResult
                            ? isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                              : isSelected
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : ""
                            : isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                          disabled={showExplanation}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                        {showResult && isCorrect && (
                          <span className="text-xs font-medium text-green-600">
                            Correct
                          </span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="text-xs font-medium text-red-600">
                            Incorrect
                          </span>
                        )}
                      </div>
                    )
                  })}
                </RadioGroup>

                {selectedAnswer !== undefined && !showExplanation && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowExplanation(true)}
                  >
                    Check Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-1">
            {quizQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index)
                  setShowExplanation(false)
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-primary"
                    : answers[quizQuestions[index].id] !== undefined
                    ? "bg-primary/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>

        {/* Unanswered Warning */}
        {!allAnswered && currentQuestionIndex === quizQuestions.length - 1 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Please answer all questions before submitting
          </p>
        )}
      </div>
    </div>
  )
}
