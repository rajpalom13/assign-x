/**
 * @fileoverview Plagiarism checker component for detecting content similarity.
 * @module components/resources/plagiarism-checker
 */

"use client"

import { useState, useCallback } from "react"
import { FileText, Upload, Search, AlertTriangle, CheckCircle2, ExternalLink, Loader2, FileUp, X, Copy, RotateCcw, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { PlagiarismCheckResult, PlagiarismMatch } from "./types"
// Plagiarism checking currently not integrated with external service

interface PlagiarismCheckerProps {
  onCheck?: (content: string | File) => Promise<PlagiarismCheckResult>
}

/** Get color class based on similarity score */
const getScoreColor = (score: number) => score <= 10 ? "text-green-600" : score <= 20 ? "text-amber-600" : "text-red-600"
const getScoreBgColor = (score: number) => score <= 10 ? "bg-green-500" : score <= 20 ? "bg-amber-500" : "bg-red-500"
const getScoreLabel = (score: number) => score <= 10 ? "Excellent" : score <= 20 ? "Acceptable" : score <= 30 ? "Needs Review" : "High Similarity"

/** Single match item display in accordion */
function MatchItem({ match }: { match: PlagiarismMatch }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(match.matched_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AccordionItem value={match.id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <Badge variant="outline" className={cn("shrink-0", match.similarity_percentage > 5 ? "border-amber-500 text-amber-700" : "border-muted-foreground")}>{match.similarity_percentage}%</Badge>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{match.source_title}</p>
            <p className="text-xs text-muted-foreground">{match.word_count} words matched</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm italic text-amber-900">&quot;{match.matched_text}&quot;</p>
          </div>
          <div className="flex items-center justify-between">
            <a href={match.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
              <ExternalLink className="h-3.5 w-3.5" />View Source
            </a>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
              {copied ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" />Copy Text</>}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

/** Coming Soon card */
function ComingSoonCard({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            Plagiarism checking is not yet integrated with an external service.
            This feature will be available once the API integration is complete.
          </p>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />Try Again Later
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/** Score overview card */
function ScoreCard({ score, uniqueContent, sourcesFound }: { score: number; uniqueContent: number; sourcesFound: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={cn("h-16 w-16 rounded-full flex items-center justify-center", score <= 10 ? "bg-green-100" : score <= 20 ? "bg-amber-100" : "bg-red-100")}>
              <span className={cn("text-2xl font-bold", getScoreColor(score))}>{score}%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Similarity Score</p>
              <p className={cn("font-semibold", getScoreColor(score))}>{getScoreLabel(score)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Content</p>
              <p className="text-2xl font-bold text-green-600">{uniqueContent}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center"><FileText className="h-8 w-8 text-muted-foreground" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Sources Found</p>
              <p className="text-2xl font-bold">{sourcesFound}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Plagiarism checker component for detecting content similarity against online sources.
 */
export function PlagiarismChecker({ onCheck }: PlagiarismCheckerProps) {
  const [inputMode, setInputMode] = useState<"text" | "file">("text")
  const [textContent, setTextContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<PlagiarismCheckResult | null>(null)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleCheck = useCallback(async () => {
    setIsChecking(true)
    setProgress(0)
    setResult(null)
    setShowComingSoon(false)

    const interval = setInterval(() => {
      setProgress((prev) => prev >= 90 ? (clearInterval(interval), 90) : prev + Math.random() * 20)
    }, 500)

    try {
      if (onCheck) {
        const checkResult = await onCheck(inputMode === "file" ? selectedFile! : textContent)
        setResult(checkResult)
      } else {
        await new Promise((r) => setTimeout(r, 1500))
        // Coming soon - external API integration required
        setShowComingSoon(true)
        setResult(null)
      }
      setProgress(100)
    } catch (error) {
      console.error("Check failed:", error)
    } finally {
      clearInterval(interval)
      setIsChecking(false)
    }
  }, [inputMode, textContent, selectedFile, onCheck])

  const handleReset = () => {
    setResult(null)
    setTextContent("")
    setSelectedFile(null)
    setProgress(0)
    setShowComingSoon(false)
  }

  const canCheck = (inputMode === "text" && textContent.trim().length > 50) || (inputMode === "file" && selectedFile)

  return (
    <div className="space-y-6">
      {showComingSoon && <ComingSoonCard onReset={handleReset} />}
      {!result && !showComingSoon ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Plagiarism Checker</CardTitle>
            <CardDescription>Upload a document or paste text to check for plagiarism against millions of sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "text" | "file")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" />Paste Text</TabsTrigger>
                <TabsTrigger value="file"><Upload className="h-4 w-4 mr-2" />Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-4">
                <div className="space-y-2">
                  <Textarea placeholder="Paste your content here (minimum 50 characters)..." value={textContent} onChange={(e) => setTextContent(e.target.value)} rows={10} className="resize-none" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{textContent.length} characters</span>
                    <span>~{Math.ceil(textContent.split(/\s+/).filter(Boolean).length)} words</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="file" className="mt-4">
                {selectedFile ? (
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                      <div><p className="font-medium text-sm">{selectedFile.name}</p><p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p></div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <FileUp className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Drop your file here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports DOC, DOCX, PDF, TXT (max 10MB)</p>
                    <input type="file" className="hidden" accept=".doc,.docx,.pdf,.txt" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                  </label>
                )}
              </TabsContent>
            </Tabs>
            {isChecking && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Checking for plagiarism...</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            <Button className="w-full" size="lg" onClick={handleCheck} disabled={!canCheck || isChecking}>
              {isChecking ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking...</> : <><Search className="h-4 w-4 mr-2" />Check for Plagiarism</>}
            </Button>
          </CardContent>
        </Card>
      ) : null}
      {result && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Plagiarism Report</h3>
            <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-2" />New Check</Button>
          </div>
          <ScoreCard score={result.overall_score} uniqueContent={result.unique_content} sourcesFound={result.sources_found} />
          <Card>
            <CardHeader><CardTitle className="text-base">Content Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 w-full rounded-full overflow-hidden bg-muted flex">
                  <div className="bg-green-500 transition-all" style={{ width: `${result.unique_content}%` }} />
                  <div className={cn("transition-all", getScoreBgColor(result.matched_content))} style={{ width: `${result.matched_content}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500" /><span>Unique ({result.unique_content}%)</span></div>
                  <div className="flex items-center gap-2"><div className={cn("h-3 w-3 rounded-full", getScoreBgColor(result.matched_content))} /><span>Matched ({result.matched_content}%)</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
          {result.matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Matched Sources ({result.matches.length})</CardTitle>
                <CardDescription>Click on each source to see the matched content</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Accordion type="single" collapsible className="space-y-2">
                    {result.matches.map((match) => <MatchItem key={match.id} match={match} />)}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
