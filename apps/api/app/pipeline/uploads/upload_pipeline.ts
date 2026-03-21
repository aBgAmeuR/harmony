import { inject } from '@adonisjs/core'
import { type UploadContext } from './upload_context.ts'
import { type UploadStage } from './upload_stage.ts'
import { UploadProgressBroadcaster, type UploadUiStepKey } from './upload_progress_broadcaster.ts'
import { ExtractArchiveStage } from './stages/extract_archive_stage.ts'
import { ParseInteractionsStage } from './stages/parse_interactions_stage.ts'
import { NormalizeInteractionsStage } from './stages/normalize_interactions_stage.ts'
import { ResolveTracksStage } from './stages/resolve_tracks_stage.ts'
import { EnrichTracksStage } from './stages/enrich_tracks_stage.ts'
import { PersistInteractionsStage } from './stages/persist_interactions_stage.ts'

@inject()
export class UploadPipeline {
  private readonly stages: UploadStage[]
  private readonly stepKeys: UploadUiStepKey[]

  constructor(
    private broadcaster: UploadProgressBroadcaster,
    private extractArchiveStage: ExtractArchiveStage,
    private parseInteractionsStage: ParseInteractionsStage,
    private normalizeInteractionsStage: NormalizeInteractionsStage,
    private resolveTracksStage: ResolveTracksStage,
    private enrichTracksStage: EnrichTracksStage,
    private persistInteractionsStage: PersistInteractionsStage
  ) {
    this.stages = [
      this.extractArchiveStage,
      this.parseInteractionsStage,
      this.normalizeInteractionsStage,
      this.resolveTracksStage,
      this.enrichTracksStage,
      this.persistInteractionsStage,
    ]

    this.stepKeys = [
      'extract_archive',
      'parse_interactions',
      'normalize_interactions',
      'resolve_tracks',
      'enrich_tracks',
      'persist_interactions',
    ]
  }

  async run(context: UploadContext) {
    let index = -1
    let hasFailed = false

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) {
        throw new Error('next() called multiple times')
      }
      index = i
      const stage = this.stages[i]
      const stepKey = this.stepKeys[i]
      if (!stage || !stepKey) return

      const uploadId = context.upload.publicId
      let didCallNext = false

      this.broadcaster.stageStart(uploadId, stepKey)

      const next = async () => {
        if (!didCallNext) {
          didCallNext = true
          this.broadcaster.stageDone(uploadId, stepKey)
        }
        return dispatch(i + 1)
      }

      try {
        await stage.handle(context, next)
        if (!didCallNext) {
          this.broadcaster.stageDone(uploadId, stepKey)
        }
      } catch (err) {
        if (!hasFailed) {
          hasFailed = true
          if (!didCallNext) {
            this.broadcaster.stageError(uploadId, stepKey, err)
          }
          if (stepKey !== 'persist_interactions') {
            this.broadcaster.stageError(uploadId, 'persist_interactions', err)
          }
        }
        throw err
      }
    }

    await dispatch(0)
  }
}
