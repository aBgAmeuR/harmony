import { type UploadContext } from './upload_context.ts'

export interface UploadStage {
  handle(context: UploadContext, next: () => Promise<void>): Promise<void>
}
