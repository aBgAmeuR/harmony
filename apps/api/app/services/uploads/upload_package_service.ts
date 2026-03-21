import type Package from '#models/package'
import {
  type UploadUiStep,
  type EnrichTracksStepData,
  type ParseInteractionsStepData,
  type NormalizeInteractionsStepData,
} from '../../pipeline/uploads/upload_progress_broadcaster.ts'
import type { UploadDataPayload, UploadStepSnapshot } from './upload_package_types.ts'
import { inject } from '@adonisjs/core'
import { type MultipartFile } from '@adonisjs/core/bodyparser'
import { type UploadContext } from '../../pipeline/uploads/upload_context.ts'
import { UploadPipeline } from '../../pipeline/uploads/upload_pipeline.ts'
import { UploadProgressBroadcaster } from '../../pipeline/uploads/upload_progress_broadcaster.ts'

function parseStepData(step: UploadUiStep): ParseInteractionsStepData | null {
  if (!step.data || step.key !== 'parse_interactions') return null
  if ('invalidCount' in step.data && 'validatedCount' in step.data) {
    return step.data
  }
  return null
}

function normalizeStepData(step: UploadUiStep): NormalizeInteractionsStepData | null {
  if (!step.data || step.key !== 'normalize_interactions') return null
  if ('rejectedCount' in step.data && 'keptCount' in step.data) {
    return step.data
  }
  return null
}

function enrichStepData(step: UploadUiStep): EnrichTracksStepData | null {
  if (!step.data || step.key !== 'enrich_tracks') return null
  if (
    'tracksProcessed' in step.data &&
    'tracksToProcess' in step.data &&
    'tracksSkipped' in step.data
  ) {
    return step.data as EnrichTracksStepData
  }
  return null
}

function toDurationMs(startAt?: string, endAt?: string): number | null {
  if (!startAt || !endAt) return null
  return Math.max(0, new Date(endAt).getTime() - new Date(startAt).getTime())
}

function buildUploadDataPayload(context: UploadContext, steps: UploadUiStep[]): UploadDataPayload {
  const stepSnapshots: UploadStepSnapshot[] = steps.map((step) => ({
    key: step.key,
    status: step.status,
    startedAt: step.startAt ?? null,
    finishedAt: step.endAt ?? null,
    durationMs: toDurationMs(step.startAt, step.endAt),
  }))

  const parseStep = steps.find((step) => step.key === 'parse_interactions')
  const normalizeStep = steps.find((step) => step.key === 'normalize_interactions')
  const enrichStep = steps.find((step) => step.key === 'enrich_tracks')
  const failedStep = steps.find((step) => step.status === 'error' && Boolean(step.error))

  const parseData = parseStep ? parseStepData(parseStep) : null
  const normalizeData = normalizeStep ? normalizeStepData(normalizeStep) : null
  const enrichData = enrichStep ? enrichStepData(enrichStep) : null

  const startedAt = steps
    .map((step) => step.startAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0]
  const finishedAt = steps
    .map((step) => step.endAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)

  return {
    totalDurationMs: toDurationMs(startedAt, finishedAt),
    steps: stepSnapshots,
    summary: {
      uploadedFileName: context.file.clientName,
      uploadedFileSizeBytes: context.file.size,
      filesSelectedCount: context.selectedJsonFiles.length,
      filesTakenCount: context.filesInArchive.length,
      interactionsPersistAttempted: context.stats.totalInteractions,
      skippedInteractionsCount: context.stats.skippedInteractions.count,
      skippedInteractionsMsPlayed: context.stats.skippedInteractions.msPlayed,
      skippedTracksCount: context.stats.skippedTracksCount,
      processedTracksCount: enrichData?.tracksProcessed ?? context.stats.processedTracksCount,
      parseValidatedCount: parseData?.validatedCount ?? 0,
      parseInvalidCount: parseData?.invalidCount ?? 0,
      normalizeKeptCount: normalizeData?.keptCount ?? 0,
      normalizeRejectedCount: normalizeData?.rejectedCount ?? 0,
    },
    failure: failedStep
      ? {
          stepKey: failedStep.key,
          message: failedStep.error ?? 'Unknown error',
        }
      : null,
  }
}

@inject()
export class UploadPackageService {
  constructor(
    private pipeline: UploadPipeline,
    private broadcaster: UploadProgressBroadcaster
  ) {}

  async execute(upload: Package, file: MultipartFile, jsonFiles: string[] = []) {
    const context: UploadContext = {
      upload,
      file,
      selectedJsonFiles: jsonFiles,
      filesInArchive: [],
      rawInteractions: null,
      normalizedInteractions: null,
      trackCatalogue: new Map(),
      trackKeyToId: new Map(),
      stats: {
        totalInteractions: 0,
        skippedInteractions: { count: 0, msPlayed: 0 },
        skippedTracksCount: 0,
        processedTracksCount: 0,
      },
    }

    let failedError: unknown = null

    try {
      await upload.merge({ status: 'running' }).save()
      this.broadcaster.initialize(upload.publicId)

      await this.pipeline.run(context)
    } catch (error) {
      failedError = error
    } finally {
      const steps = this.broadcaster.getStepsSnapshot(upload.publicId)
      const data = buildUploadDataPayload(context, steps)
      const status = failedError ? 'failed' : 'completed'

      await upload.merge({ status, data }).save()
      this.broadcaster.clear(upload.publicId)
    }

    if (failedError) {
      throw failedError
    }
  }
}
