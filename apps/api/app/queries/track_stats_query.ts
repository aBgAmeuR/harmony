import type { TrendPoint, TrackMetadataDto } from '#dtos/track_dtos'
import {
  fillTrendByDay,
  fillTrendByMonth,
  isSameCalendarMonth,
  monthLabelEn,
  WEEKDAY_LABELS_MON_FIRST,
  ymKey,
} from '#lib/date_labels'
import { msToMinutes } from '#lib/time_utils'
import { shareOfTotal, timestampToIso } from '#lib/math_utils'
import {
  applyInstantRangeToRawQuery,
  type InstantRange,
} from '#services/interaction_timestamp_range'
import Interaction from '#models/interaction'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

type DayRow = { label_day: number; ms_sum: string | number }
type MonthRow = { bucket_year: number; bucket_month: number; ms_sum: string | number }
type DowRow = { iso_dow: number; ms_sum: string | number }
type AggregateRow = {
  streams: number | string
  listening_ms: string | number
  first_listened: Date | string | null
  last_listened: Date | string | null
  forward_skips: number | string
  replays: number | string
}

export interface TrackAggregate {
  streams: number
  listeningMs: number
  metadata: TrackMetadataDto
}

/**
 * Encapsulates all raw SQL interaction queries scoped to a single track + package + date range.
 * Instantiated per-call — not injected — because it carries request-specific state.
 */
export class TrackStatsQuery {
  constructor(
    private readonly packageId: number,
    private readonly trackId: number,
    private readonly range: InstantRange
  ) {}

  private baseQuery(): ReturnType<typeof db.from> {
    const q = db
      .from(Interaction.table)
      .where('package_id', this.packageId)
      .where('track_id', this.trackId)
    applyInstantRangeToRawQuery(q, this.range)
    return q
  }

  /**
   * Single query that returns stream count, total listening time, and interaction metadata.
   */
  async fetchAggregate(): Promise<TrackAggregate> {
    const row = (await this.baseQuery()
      .select(
        db.raw('count(*)::int as streams'),
        db.raw('coalesce(sum(ms_played), 0)::bigint as listening_ms'),
        db.raw('min("timestamp") as first_listened'),
        db.raw('max("timestamp") as last_listened'),
        db.raw(`count(*) filter (where reason_end = 'fwdbtn')::int as forward_skips`),
        db.raw(`count(*) filter (where reason_start = 'backbtn')::int as replays`)
      )
      .first()) as AggregateRow | undefined

    const streams = Number(row?.streams ?? 0)
    const forwardSkips = Number(row?.forward_skips ?? 0)
    const replays = Number(row?.replays ?? 0)

    return {
      streams,
      listeningMs: Number(row?.listening_ms ?? 0),
      metadata: {
        firstListenedAt: timestampToIso(row?.first_listened),
        lastListenedAt: timestampToIso(row?.last_listened),
        forwardSkips,
        replays,
        forwardSkipRate: shareOfTotal(forwardSkips, streams),
        replayRate: shareOfTotal(replays, streams),
      },
    }
  }

  async fetchPlayTrend(): Promise<TrendPoint[]> {
    const { from, to } = this.range
    const hasClosedRange = from !== undefined && to !== undefined
    const sameMonth = hasClosedRange && isSameCalendarMonth(from, to)

    if (sameMonth) {
      const rows = (await this.baseQuery()
        .select(
          db.raw('extract(day from "timestamp")::int as label_day'),
          db.raw('coalesce(sum(ms_played), 0)::bigint as ms_sum')
        )
        .groupByRaw('extract(day from "timestamp")')
        .orderByRaw('extract(day from "timestamp")')) as DayRow[]

      const minutesByDay = new Map<number, number>()
      for (const row of rows) {
        minutesByDay.set(row.label_day, msToMinutes(Number(row.ms_sum)))
      }
      return fillTrendByDay(from, to, minutesByDay)
    }

    const rows = (await this.baseQuery()
      .select(
        db.raw(`extract(year from date_trunc('month', "timestamp"))::int as bucket_year`),
        db.raw(`extract(month from date_trunc('month', "timestamp"))::int as bucket_month`),
        db.raw('coalesce(sum(ms_played), 0)::bigint as ms_sum')
      )
      .groupByRaw(`date_trunc('month', "timestamp")`)
      .orderByRaw(`date_trunc('month', "timestamp")`)) as MonthRow[]

    const minutesByYm = new Map<string, number>()
    for (const row of rows) {
      const dt = DateTime.utc(row.bucket_year, row.bucket_month, 1)
      minutesByYm.set(ymKey(dt), msToMinutes(Number(row.ms_sum)))
    }

    if (hasClosedRange) {
      return fillTrendByMonth(from, to, minutesByYm)
    }

    return rows.map((row) => {
      const dt = DateTime.utc(row.bucket_year, row.bucket_month, 1)
      return { label: monthLabelEn(dt), value: minutesByYm.get(ymKey(dt)) ?? 0 }
    })
  }

  async fetchPlayDistribution(): Promise<TrendPoint[]> {
    const rows = (await this.baseQuery()
      .select(
        db.raw('extract(isodow from "timestamp")::int as iso_dow'),
        db.raw('coalesce(sum(ms_played), 0)::bigint as ms_sum')
      )
      .groupByRaw('extract(isodow from "timestamp")')
      .orderByRaw('extract(isodow from "timestamp")')) as DowRow[]

    const minutesByIsoDow = new Map<number, number>()
    for (const row of rows) {
      minutesByIsoDow.set(row.iso_dow, msToMinutes(Number(row.ms_sum)))
    }

    return WEEKDAY_LABELS_MON_FIRST.map((label, index) => ({
      label,
      value: minutesByIsoDow.get(index + 1) ?? 0,
    }))
  }
}
