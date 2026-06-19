import { queryOptions } from '@tanstack/react-query'
import { fetchAvgDailyPlaytimeMetric, fetchListeningHabitMetric, runDuckQuery } from './run'
import { buildTopAlbumsSql, buildTopArtistsSql, buildTopTracksSql } from './sql'
import {
  buildAvgDailyPlaytimeDailySql,
  buildAvgDailyPlaytimeTrendSql,
  buildAvgDailyPlaytimeValueSql,
  buildOfflineRateTrendSql,
  buildOfflineRateValueSql,
  buildPeakHourTrendSql,
  buildPeakHourValueSql,
  buildShuffleRateTrendSql,
  buildShuffleRateValueSql,
  buildStreamsTrendSql,
  buildStreamsValueSql,
  buildTotalPlaytimeTrendSql,
  buildTotalPlaytimeValueSql,
  buildUniqueArtistsTrendSql,
  buildUniqueArtistsValueSql,
  buildUniqueTracksTrendSql,
  buildUniqueTracksValueSql,
} from './sql/listening-habits'
import type { DateRangeInput, DuckCatalogRow, TopCatalogInput } from './types'

function listeningHabitQueryOptions(
  key: string,
  input: DateRangeInput,
  valueSql: string,
  trendSql: string,
) {
  return queryOptions({
    queryKey: ['duck', 'listening-habits', key, input],
    queryFn: () => fetchListeningHabitMetric(valueSql, trendSql),
  })
}

export const query = {
  tracks: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'tracks', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopTracksSql(input)),
        }),
    },
  },
  albums: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'albums', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopAlbumsSql(input)),
        }),
    },
  },
  artists: {
    top: {
      queryOptions: (input: TopCatalogInput) =>
        queryOptions({
          queryKey: ['duck', 'artists', 'top', input],
          queryFn: () => runDuckQuery<DuckCatalogRow>(buildTopArtistsSql(input)),
        }),
    },
  },
  listeningHabits: {
    totalPlaytime: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'total-playtime',
          input,
          buildTotalPlaytimeValueSql(input),
          buildTotalPlaytimeTrendSql(input),
        ),
    },
    streams: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'streams',
          input,
          buildStreamsValueSql(input),
          buildStreamsTrendSql(input),
        ),
    },
    uniqueTracks: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'unique-tracks',
          input,
          buildUniqueTracksValueSql(input),
          buildUniqueTracksTrendSql(input),
        ),
    },
    uniqueArtists: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'unique-artists',
          input,
          buildUniqueArtistsValueSql(input),
          buildUniqueArtistsTrendSql(input),
        ),
    },
    avgDailyPlaytime: {
      queryOptions: (input: DateRangeInput) =>
        queryOptions({
          queryKey: ['duck', 'listening-habits', 'avg-daily-playtime', input],
          queryFn: () =>
            fetchAvgDailyPlaytimeMetric(
              buildAvgDailyPlaytimeValueSql(input),
              buildAvgDailyPlaytimeTrendSql(input),
              buildAvgDailyPlaytimeDailySql(input),
            ),
        }),
    },
    peakHour: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'peak-hour',
          input,
          buildPeakHourValueSql(input),
          buildPeakHourTrendSql(input),
        ),
    },
    shuffleRate: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'shuffle-rate',
          input,
          buildShuffleRateValueSql(input),
          buildShuffleRateTrendSql(input),
        ),
    },
    offlineRate: {
      queryOptions: (input: DateRangeInput) =>
        listeningHabitQueryOptions(
          'offline-rate',
          input,
          buildOfflineRateValueSql(input),
          buildOfflineRateTrendSql(input),
        ),
    },
  },
} as const
