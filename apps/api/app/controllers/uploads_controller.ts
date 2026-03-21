import Package from '#models/package'
import { generatePublicId } from '#services/uploads/public_id_generator'
import { UploadPackageService } from '#services/uploads/upload_package_service'
import { uploadPackageValidator } from '#validators/packages'
import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

@inject()
export default class UploadsController {
  constructor(private uploadPackageService: UploadPackageService) {}

  async upload({ request }: HttpContext) {
    const payload = await request.validateUsing(uploadPackageValidator)

    const upload = await Package.create({
      publicId: generatePublicId(12),
      fileName: payload.file.clientName,
      fileSize: payload.file.size,
      status: 'pending',
    })

    this.uploadPackageService
      .execute(upload, payload.file, payload.json_files)
      .catch((err) => logger.error({ err, upload }, 'Upload processing failed'))

    return {
      uploadId: upload.publicId,
    }
  }

  async stats({ params, response }: HttpContext) {
    const upload = await Package.findBy('publicId', params.uploadId)
    if (!upload) {
      return response.notFound({ message: 'Upload not found' })
    }

    const knex = db.connection().getReadClient()

    const [tracksRow] = await knex('interactions')
      .where('package_id', upload.id)
      .countDistinct({ total_tracks: 'track_id' })

    const [artistsRow] = await knex('interactions')
      .innerJoin('track_artists', 'track_artists.track_id', 'interactions.track_id')
      .where('interactions.package_id', upload.id)
      .countDistinct({ total_artists: 'track_artists.artist_id' })

    const [listeningRow] = await knex('interactions')
      .where('package_id', upload.id)
      .sum({ total_ms: 'ms_played' })

    const monthRowsRaw = await knex('interactions')
      .select(knex.raw('EXTRACT(MONTH FROM "timestamp")::int as month_index'))
      .select(knex.raw('EXTRACT(YEAR FROM "timestamp")::int as year'))
      .sum({ total_ms: 'ms_played' })
      .where('package_id', upload.id)
      .groupBy('year', 'month_index')
      .orderBy('year', 'asc')
      .orderBy('month_index', 'asc')
    const monthRows = monthRowsRaw as Array<{
      month_index: number | string
      year: number | string
      total_ms: number | string | null
    }>
    const listeningByMonth = monthRows.map((row) => {
      const monthIndex = Number(row.month_index)
      const year = Number(row.year)
      const monthLabel = MONTH_LABELS[monthIndex - 1] ?? String(monthIndex)
      const totalMs = Number(row.total_ms ?? 0)
      return {
        month: `${monthLabel} ${year}`,
        minutes: Math.round(totalMs / 60000),
      }
    })

    const totalListeningMinutes = Math.round(Number(listeningRow.total_ms ?? 0) / 60000)
    const totalTracks = Number(tracksRow.total_tracks ?? 0)
    const totalArtists = Number(artistsRow.total_artists ?? 0)

    return {
      uploadId: upload.publicId,
      status: upload.status,
      LISTENING_BY_MONTH: listeningByMonth,
      totalTracks,
      totalArtists,
      totalListeningMinutes,
    }
  }
}
