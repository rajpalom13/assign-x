'use client'

/**
 * AI Report Generator component
 * Checks text for AI-generated content percentage
 * @module components/resources/AIReportGenerator
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Copy,
  Download,
  RefreshCw,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import {
  getAIStatusColor,
  getAIStatusMessage,
  getAIBadgeColor,
  getAIProgressColor,
} from './constants'
import type { AIReport } from '@/types/database'

/**
 * AIReportGenerator component props
 */
interface AIReportGeneratorProps {
  /** Callback when check is performed */
  onCheck?: (text: string) => Promise<AIReport>
  /** Callback to go back */
  onBack?: () => void
  /** Additional class name */
  className?: string
}

/**
 * AI Report Generator component
 * Checks text for AI-generated content percentage
 */
export function AIReportGenerator({
  onCheck,
  onBack,
  className,
}: AIReportGeneratorProps) {
  const [inputText, setInputText] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [report, setReport] = useState<AIReport | null>(null)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')
  const [error, setError] = useState<string | null>(null)

  /** Handle text check */
  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    if (inputText.trim().split(/\s+/).length < 50) {
      setError('Please enter at least 50 words for accurate analysis')
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      if (onCheck) {
        const result = await onCheck(inputText)
        setReport(result)
      } else {
        // Simulated check for demo
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const aiPercentage = Math.floor(Math.random() * 40)
        setReport({
          id: 'demo-' + Date.now(),
          doer_id: 'demo',
          project_id: null,
          input_text: inputText,
          file_url: null,
          ai_percentage: aiPercentage,
          originality_percentage: 100 - aiPercentage,
          detailed_breakdown: {
            total_words: inputText.split(/\s+/).length,
            sentences_analyzed: inputText.split(/[.!?]+/).length,
            ai_patterns_detected: Math.floor(aiPercentage / 10),
            confidence_score: 0.85 + Math.random() * 0.15,
          },
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text')
    } finally {
      setIsChecking(false)
    }
  }

  /** Handle file upload */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Read file content
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInputText(content)
    }
    reader.readAsText(file)
  }

  /** Reset form */
  const handleReset = () => {
    setInputText('')
    setReport(null)
    setError(null)
  }

  /**
   * Copy report summary to clipboard
   * Formats report data as readable text
   */
  const copyReport = () => {
    if (!report) return
    const text = `AI Detection Report
---
AI Content: ${report.ai_percentage}%
Original Content: ${report.originality_percentage}%
Words Analyzed: ${report.detailed_breakdown?.total_words || 'N/A'}
Generated: ${new Date(report.created_at).toLocaleString()}`
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Report Generator
          </h2>
          <p className="text-sm text-muted-foreground">
            Check your work for AI-generated content before submission
          </p>
        </div>
      </div>

      {/* Info alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          Paste your text or upload a document to analyze for AI-generated content.
          This tool helps ensure your work meets quality standards before submission.
        </AlertDescription>
      </Alert>

      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Input Text</CardTitle>
                <CardDescription>
                  Enter or upload the content you want to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input mode tabs */}
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'text' | 'file')}>
                  <TabsList className="grid w-full grid-cols-2 max-w-xs">
                    <TabsTrigger value="text" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="file" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <Textarea
                      placeholder="Paste your text here (minimum 50 words)..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] resize-none"
                    />
                  </TabsContent>

                  <TabsContent value="file" className="mt-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supported: TXT, DOC, DOCX (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>

                    {inputText && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">File Content Preview:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {inputText.substring(0, 500)}...
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Word count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Words: {inputText.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                  <span className="text-muted-foreground">
                    Minimum: 50 words
                  </span>
                </div>

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!inputText || isChecking}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleCheck}
                    disabled={isChecking || !inputText.trim()}
                    className="gap-2"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Check AI Content
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress during check */}
                {isChecking && (
                  <div className="space-y-2">
                    <Progress value={66} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      Analyzing text patterns...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Results card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Results</span>
                  <Badge
                    variant="outline"
                    className={getAIBadgeColor(report.ai_percentage)}
                  >
                    {getAIStatusMessage(report.ai_percentage)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">AI Content</p>
                    <p className={cn('text-4xl font-bold', getAIStatusColor(report.ai_percentage))}>
                      {report.ai_percentage}%
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Original Content</p>
                    <p className="text-4xl font-bold text-green-600">
                      {report.originality_percentage}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Content</span>
                    <span>Original Content</span>
                  </div>
                  <div className="h-4 rounded-full overflow-hidden bg-green-500/20">
                    <div
                      className={cn(
                        'h-full transition-all',
                        getAIProgressColor(report.ai_percentage)
                      )}
                      style={{ width: `${report.ai_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-muted-foreground">Words Analyzed</span>
                    <span className="font-medium">
                      {String(report.detailed_breakdown?.total_words ?? 'N/A')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-muted-foreground">Sentences</span>
                    <span className="font-medium">
                      {String(report.detailed_breakdown?.sentences_analyzed ?? 'N/A')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-muted-foreground">AI Patterns</span>
                    <span className="font-medium">
                      {String(report.detailed_breakdown?.ai_patterns_detected ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">
                      {Math.round((Number(report.detailed_breakdown?.confidence_score) || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                {report.ai_percentage > 15 && (
                  <Alert variant={report.ai_percentage > 30 ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Recommendation</AlertTitle>
                    <AlertDescription>
                      {report.ai_percentage > 30
                        ? 'Your content has high AI-generated content. Consider rewriting major sections to ensure originality before submission.'
                        : 'Some AI patterns detected. Review and rephrase flagged sections to improve originality.'}
                    </AlertDescription>
                  </Alert>
                )}

                {report.ai_percentage <= 15 && (
                  <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Looking Good!</AlertTitle>
                    <AlertDescription>
                      Your content appears to be primarily original. You're ready to submit!
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Generated: {new Date(report.created_at).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyReport}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Check Another
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
