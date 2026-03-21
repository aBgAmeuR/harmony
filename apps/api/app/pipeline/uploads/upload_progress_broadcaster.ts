import transmit from '@adonisjs/transmit/services/main'

export type UploadUiStepKey =
  | 'extract_archive'
  | 'parse_interactions'
  | 'normalize_interactions'
  | 'resolve_tracks'
  | 'enrich_tracks'
  | 'persist_interactions'

export type UploadUiStepStatus = 'pending' | 'running' | 'done' | 'error'

export type EnrichTracksStepData = {
  tracksToProcess: number
  tracksProcessed: number
  tracksSkipped: number
}

export type NormalizeInteractionsStepData = {
  rejectedCount: number
  keptCount: number
}

export type ParseInteractionsStepData = {
  invalidCount: number
  validatedCount: number
}

export type UploadUiStepData =
  | EnrichTracksStepData
  | NormalizeInteractionsStepData
  | ParseInteractionsStepData

export type UploadUiStep = {
  key: UploadUiStepKey
  label: string
  status: UploadUiStepStatus
  startAt?: string
  endAt?: string
  error?: string
  data?: UploadUiStepData
}

export type UploadStepsSseEvent = {
  type: 'steps'
  data: {
    seq: number
    steps: UploadUiStep[]
  }
}

const STEP_ORDER: UploadUiStepKey[] = [
  'extract_archive',
  'parse_interactions',
  'normalize_interactions',
  'resolve_tracks',
  'enrich_tracks',
  'persist_interactions',
]

const STEP_LABEL: Record<UploadUiStepKey, string> = {
  extract_archive: 'Extract archive',
  parse_interactions: 'Parse interactions',
  normalize_interactions: 'Normalize interactions',
  resolve_tracks: 'Resolve tracks',
  enrich_tracks: 'Enrich tracks',
  persist_interactions: 'Save interactions',
}

export class UploadProgressBroadcaster {
  private static readonly stepsByUploadId = new Map<string, Record<UploadUiStepKey, UploadUiStep>>()
  private static readonly seqByUploadId = new Map<string, number>()

  private channel(uploadId: string) {
    return `uploads/${uploadId}`
  }

  initialize(uploadId: string) {
    if (!UploadProgressBroadcaster.stepsByUploadId.has(uploadId)) {
      const steps = STEP_ORDER.reduce(
        (acc, key) => {
          acc[key] = {
            key,
            label: STEP_LABEL[key],
            status: 'pending',
          }
          return acc
        },
        {} as Record<UploadUiStepKey, UploadUiStep>
      )
      UploadProgressBroadcaster.stepsByUploadId.set(uploadId, steps)
    }

    this.broadcast(uploadId)
  }

  stageStart(uploadId: string, stepKey: UploadUiStepKey) {
    this.initialize(uploadId)
    const step = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)![stepKey]
    step.status = 'running'
    step.startAt = new Date().toISOString()
    step.endAt = undefined
    step.error = undefined
    this.broadcast(uploadId)
  }

  stageDone(uploadId: string, stepKey: UploadUiStepKey) {
    this.initialize(uploadId)
    const step = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)![stepKey]
    step.status = 'done'
    step.endAt = new Date().toISOString()
    step.error = undefined
    this.broadcast(uploadId)
  }

  stageError(uploadId: string, stepKey: UploadUiStepKey, error: unknown) {
    this.initialize(uploadId)
    const step = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)![stepKey]
    step.status = 'error'
    if (!step.startAt) {
      step.startAt = new Date().toISOString()
    }
    step.endAt = new Date().toISOString()
    step.error = error instanceof Error ? error.message : 'Unknown error'
    this.broadcast(uploadId)
  }

  updateStepData(uploadId: string, stepKey: UploadUiStepKey, data: UploadUiStepData) {
    this.initialize(uploadId)
    const step = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)![stepKey]
    step.data = { ...(step.data ?? {}), ...(data as UploadUiStepData) }
    this.broadcast(uploadId)
  }

  updateEnrichProgress(uploadId: string, data: EnrichTracksStepData) {
    this.updateStepData(uploadId, 'enrich_tracks', data)
  }

  updateNormalizeCounts(uploadId: string, data: NormalizeInteractionsStepData) {
    this.updateStepData(uploadId, 'normalize_interactions', data)
  }

  updateParseCounts(uploadId: string, data: ParseInteractionsStepData) {
    this.updateStepData(uploadId, 'parse_interactions', data)
  }

  getStepsSnapshot(uploadId: string): UploadUiStep[] {
    const stepsState = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)
    if (!stepsState) return []
    return STEP_ORDER.map((key) => ({ ...stepsState[key] }))
  }

  clear(uploadId: string) {
    UploadProgressBroadcaster.stepsByUploadId.delete(uploadId)
    UploadProgressBroadcaster.seqByUploadId.delete(uploadId)
  }

  private broadcast(uploadId: string) {
    const stepsState = UploadProgressBroadcaster.stepsByUploadId.get(uploadId)
    if (!stepsState) return

    const nextSeq = (UploadProgressBroadcaster.seqByUploadId.get(uploadId) ?? 0) + 1
    UploadProgressBroadcaster.seqByUploadId.set(uploadId, nextSeq)

    const event: UploadStepsSseEvent = {
      type: 'steps',
      data: {
        seq: nextSeq,
        steps: STEP_ORDER.map((key) => stepsState[key]),
      },
    }

    transmit.broadcast(this.channel(uploadId), event as never)
  }
}
