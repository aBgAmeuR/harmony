import { promises } from 'node:fs'
import { type UploadContext } from '../upload_context.ts'
import { type UploadStage } from '../upload_stage.ts'
import { unzipSync } from 'fflate'

const filesRegexPattern =
  /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/

export class ExtractArchiveStage implements UploadStage {
  async handle(context: UploadContext, next: () => Promise<void>) {
    const tmpPath = context.file.tmpPath

    if (!tmpPath) {
      throw new Error('No temporary file path found in upload context')
    }

    const uint8Array = await promises.readFile(tmpPath)
    const unzipped = unzipSync(uint8Array)

    const files = Object.entries(unzipped)
      .filter(([filename]) => filesRegexPattern.test(filename))
      .map(([filename, content]) => ({ filename, content }))

    if (context.selectedJsonFiles?.length) {
      const selectedSet = new Set(context.selectedJsonFiles)
      const filtered = files.filter((f) => selectedSet.has(f.filename))

      if (filtered.length === 0) {
        throw new Error('No JSON files found in archive for the provided json_files list')
      }

      context.filesInArchive = filtered
    } else {
      context.filesInArchive = files
    }

    await next()
  }
}
