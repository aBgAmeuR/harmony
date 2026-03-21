import type { UploadUiStep } from '../../pipeline/uploads/upload_progress_broadcaster.ts'

export type UploadStepSnapshot = {
  key: UploadUiStep['key']
  status: UploadUiStep['status']
  startedAt: string | null
  finishedAt: string | null
  durationMs: number | null
  error?: string | null
}

export type UploadSummaryData = {
  uploadedFileName: string
  uploadedFileSizeBytes: number
  filesSelectedCount: number
  filesTakenCount: number
  interactionsPersistAttempted: number
  skippedInteractionsCount: number
  skippedInteractionsMsPlayed: number
  skippedTracksCount: number
  processedTracksCount: number
  parseValidatedCount: number
  parseInvalidCount: number
  normalizeKeptCount: number
  normalizeRejectedCount: number
}

export type UploadDataPayload = {
  totalDurationMs: number | null
  steps: Array<UploadStepSnapshot>
  summary: UploadSummaryData
  failure: { stepKey: UploadUiStep['key']; message: string } | null
}
