import type { TopTrackDto, TrackDetailsDto } from '#dtos/track_dtos'
import { msToMinutes } from '#lib/time_utils'
import { TrackStatsQuery } from '#queries/track_stats_query'
import {
  applyInteractionTimestampRange,
  type InstantRange,
} from '#services/interaction_timestamp_range'
import Track from '#models/track'

export default class TrackService {
  private static formatArtistDescription(names: string[]): string {
    return names.join(', ')
  }

  async getTopTracks(packageId: number, range: InstantRange): Promise<TopTrackDto[]> {
    const tracks = await Track.query()
      .whereHas('interactions', (q) => {
        q.where('packageId', packageId)
        applyInteractionTimestampRange(q, range)
      })
      .withAggregate('interactions', (q) => {
        q.where('packageId', packageId)
        applyInteractionTimestampRange(q, range)
        q.sum('ms_played').as('listening_ms')
      })
      .withCount('interactions', (q) => {
        q.where('packageId', packageId)
        applyInteractionTimestampRange(q, range)
        q.as('streams')
      })
      .preload('album')
      .preload('artists')
      .orderBy('listening_ms', 'desc')
      .limit(50)

    return tracks.map((track) => ({
      id: track.id,
      name: track.name,
      description: TrackService.formatArtistDescription(track.artists.map((a) => a.name).sort()),
      image: track.album?.image ?? null,
      streams: Number(track.$extras.streams ?? 0),
      playtime: msToMinutes(Number(track.$extras.listening_ms ?? 0)),
    }))
  }

  async getTrackDetails(
    packageId: number,
    trackId: number,
    range: InstantRange
  ): Promise<TrackDetailsDto | null> {
    const track = await Track.query()
      .where('id', trackId)
      .preload('album')
      .preload('artists')
      .first()

    if (!track) {
      return null
    }

    const statsQuery = new TrackStatsQuery(packageId, trackId, range)

    const [aggregate, trend, distribution] = await Promise.all([
      statsQuery.fetchAggregate(),
      statsQuery.fetchPlayTrend(),
      statsQuery.fetchPlayDistribution(),
    ])

    return {
      id: track.id,
      name: track.name,
      description: TrackService.formatArtistDescription(track.artists.map((a) => a.name)),
      image: track.album?.image ?? null,
      streams: aggregate.streams,
      playtime: msToMinutes(aggregate.listeningMs),
      trend,
      distribution,
      metadata: aggregate.metadata,
    }
  }
}
