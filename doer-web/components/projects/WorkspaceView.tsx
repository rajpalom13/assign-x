'use client'

/**
 * Workspace View component
 * Full project workspace with details, chat, and file upload
 * @module components/projects/WorkspaceView
 */

import { useState } from 'react'
import {
  Clock,
  FileText,
  Upload,
  MessageSquare,
  Flame,
  IndianRupee,
  Send,
  File,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FileUpload } from './FileUpload'
import { ChatPanel } from './ChatPanel'
import { RevisionList } from './RevisionBanner'
import { getTimeRemaining, formatFileSize, getStatusColor, getQCStatusColor } from './utils'
import type {
  Project,
  ProjectFile,
  ProjectDeliverable,
  ProjectRevision,
  ChatMessage,
} from '@/types/database'

/**
 * WorkspaceView component props
 */
interface WorkspaceViewProps {
  /** Project data */
  project: Project
  /** Reference files */
  files: ProjectFile[]
  /** Deliverables */
  deliverables: ProjectDeliverable[]
  /** Revisions */
  revisions: ProjectRevision[]
  /** Chat messages */
  messages: ChatMessage[]
  /** Chat room ID */
  chatRoomId?: string
  /** Current user ID */
  currentUserId: string
  /** Current user name */
  currentUserName: string
  /** Current user avatar */
  currentUserAvatar?: string
  /** Loading state */
  isLoading?: boolean
  /** Whether chat is loading */
  isChatLoading?: boolean
  /** Whether chat is sending */
  isChatSending?: boolean
  /** Callback to upload deliverable */
  onUploadDeliverable?: (files: File[]) => Promise<void>
  /** Callback to submit project */
  onSubmitProject?: () => Promise<void>
  /** Callback to start project */
  onStartProject?: () => Promise<void>
  /** Callback to send chat message */
  onSendMessage?: (content: string) => Promise<void>
  /** Callback to send chat file */
  onSendFile?: (file: File) => Promise<void>
  /** Callback to start revision */
  onStartRevision?: (revisionId: string) => void
}

/**
 * Workspace view component
 * Full project workspace with details, chat, and file upload
 */
export function WorkspaceView({
  project,
  files,
  deliverables,
  revisions,
  messages,
  chatRoomId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isLoading = false,
  isChatLoading = false,
  isChatSending = false,
  onUploadDeliverable,
  onSubmitProject,
  onStartProject,
  onSendMessage,
  onSendFile,
  onStartRevision,
}: WorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [isUploading, setIsUploading] = useState(false)

  const timeInfo = getTimeRemaining(project.deadline)
  const hasRevision = project.status === 'revision_requested'
  const pendingRevision = revisions.find((r) => r.status === 'pending')

  /**
   * Handle file upload
   * Wraps the upload callback with loading state management
   */
  const handleUpload = async (uploadedFiles: File[]) => {
    if (!onUploadDeliverable) return
    setIsUploading(true)
    try {
      await onUploadDeliverable(uploadedFiles)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Revision Banner */}
      {hasRevision && pendingRevision && (
        <RevisionList
          revisions={revisions}
          supervisorName={project.supervisor_name || undefined}
          onStartRevision={onStartRevision}
        />
      )}

      {/* Header with deadline timer */}
      <Card
        className={cn(
          'border-2',
          timeInfo.isUrgent ? 'border-red-500 bg-red-50/50' : 'border-primary/20'
        )}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Deadline */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-full',
                  timeInfo.isUrgent ? 'bg-red-100' : 'bg-primary/10'
                )}
              >
                {timeInfo.isUrgent ? (
                  <Flame className="h-6 w-6 text-red-500" />
                ) : (
                  <Clock className="h-6 w-6 text-primary" />
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    timeInfo.isUrgent ? 'text-red-500' : 'text-foreground'
                  )}
                >
                  {timeInfo.text}
                </p>
              </div>
            </div>

            {/* Countdown boxes */}
            <div className="flex gap-2">
              {[
                { value: timeInfo.days, label: 'Days' },
                { value: timeInfo.hours, label: 'Hours' },
                { value: timeInfo.minutes, label: 'Mins' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'px-4 py-2 rounded-lg text-center min-w-[60px]',
                    timeInfo.isUrgent
                      ? 'bg-red-100 text-red-700'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="text-xs">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Earnings</p>
              <p className="text-2xl font-bold text-green-600 flex items-center justify-end gap-1">
                <IndianRupee className="h-5 w-5" />
                {(project.price ?? project.doer_payout ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <Progress
            value={timeInfo.percentage}
            className={cn('h-2 mt-4', timeInfo.isUrgent && '[&>div]:bg-red-500')}
          />
        </CardContent>
      </Card>

      {/* Main workspace tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="submit" className="gap-2">
            <Upload className="h-4 w-4" />
            Submit
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
            {messages.filter((m) => !(m.read_by || []).includes(currentUserId) && m.sender_id !== currentUserId)
              .length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {
                  messages.filter(
                    (m) => !(m.read_by || []).includes(currentUserId) && m.sender_id !== currentUserId
                  ).length
                }
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {project.subject_name && (
                  <Badge variant="secondary">{project.subject_name}</Badge>
                )}
                <Badge
                  variant="outline"
                  className={getStatusColor(project.status)}
                >
                  {project.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Project Brief */}
              <Accordion type="single" collapsible defaultValue="brief">
                <AccordionItem value="brief">
                  <AccordionTrigger>Project Brief</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none">
                      {project.specific_instructions || project.description || 'No brief provided'}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="requirements">
                  <AccordionTrigger>Requirements</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {project.word_count && (
                        <p>
                          <strong>Word Count:</strong> {project.word_count}
                        </p>
                      )}
                      {project.page_count && (
                        <p>
                          <strong>Page Count:</strong> {project.page_count}
                        </p>
                      )}
                      {project.reference_style_id && (
                        <p>
                          <strong>Reference Style ID:</strong> {project.reference_style_id}
                        </p>
                      )}
                      {project.specific_instructions && (
                        <div>
                          <strong>Special Instructions:</strong>
                          <p className="mt-1 text-muted-foreground">
                            {project.specific_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="files">
                  <AccordionTrigger>
                    Reference Files ({files.filter((f) => f.file_category === 'reference').length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {files.filter((f) => f.file_category === 'reference').length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No reference files attached
                        </p>
                      ) : (
                        files
                          .filter((f) => f.file_category === 'reference')
                          .map((file) => (
                            <a
                              key={file.id}
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1 text-sm">{file.file_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.file_size_bytes || 0)}
                              </span>
                              <Download className="h-4 w-4" />
                            </a>
                          ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator />

              {/* Start project button */}
              {project.status === 'assigned' && onStartProject && (
                <Button onClick={onStartProject} className="w-full" size="lg">
                  Start Working on Project
                </Button>
              )}

              {/* Supervisor info */}
              {project.supervisor_name && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Supervisor</span>
                  <span className="font-medium">{project.supervisor_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Tab */}
        <TabsContent value="submit" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Previous deliverables */}
              {deliverables.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Previous Submissions</h4>
                  {deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{d.file_name}</span>
                        <Badge variant="outline" className="text-xs">
                          v{d.version}
                        </Badge>
                      </div>
                      <Badge className={getQCStatusColor(d.qc_status)}>
                        {d.qc_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* File upload */}
              <FileUpload
                onFilesSelected={() => {}}
                onUpload={handleUpload}
                isUploading={isUploading}
                maxFiles={5}
                multiple
              />

              {/* Submit button */}
              {deliverables.length > 0 && onSubmitProject && (
                <Button
                  onClick={onSubmitProject}
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Send className="h-4 w-4" />
                  Submit for Review
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <Card className="h-[500px]">
            <ChatPanel
              roomId={chatRoomId || ''}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              messages={messages}
              isLoading={isChatLoading}
              isSending={isChatSending}
              onSendMessage={onSendMessage}
              onSendFile={onSendFile}
              className="h-full"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
