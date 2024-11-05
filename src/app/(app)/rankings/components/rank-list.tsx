"use client";

import { useEffect, useState } from "react";

import { MonthRangePicker } from "@/components/ui/month-range-picker";
import { useMinMaxDateRange } from "@/hooks/use-min-max-date-range";
import { Album, Artist, db, Track } from "@/lib/db";

export const RankList = () => {
  const [dates, setDates] = useState<{ start: Date; end: Date }>();
  const [rankData, setRankData] = useState<
    {
      title: string;
      artist: string;
      album: string;
      totalStreams: number;
      totalTime: number;
    }[]
  >();
  const minMaxDates = useMinMaxDateRange();

  useEffect(() => {
    async function fetchData() {
      if (dates) {
        const data = await getRankData(dates.start, dates.end);
        setRankData(data);
      }
    }
    fetchData();
  }, [dates]);

  return (
    <>
      <MonthRangePicker
        selectedMonthRange={dates}
        onMonthRangeSelect={setDates}
        minDate={minMaxDates?.minDate}
        maxDate={minMaxDates?.maxDate}
      />
      <pre>{JSON.stringify(rankData, null, 2)}</pre>
    </>
  );
};

const getRankData = async (start: Date, end: Date) => {
  const playbacks = await db.playback
    .where("timestamp")
    .between(start, end)
    .toArray();

  const tratksStats: Record<
    number,
    { totalStreams: number; totalTime: number }
  > = {};

  playbacks.forEach((playback) => {
    const id = playback.track_id;
    const item = playbacks.find((pb) => pb.track_id === id);
    if (item) {
      if (!tratksStats[id]) {
        tratksStats[id] = { totalStreams: 0, totalTime: 0 };
      }
      tratksStats[id].totalStreams += 1;
      tratksStats[id].totalTime += item.ms_played;
    }
  });

  const top50Streams = Object.keys(tratksStats)
    .sort(
      (a, b) =>
        tratksStats[Number(b)].totalStreams -
        tratksStats[Number(a)].totalStreams
    )
    .slice(0, 50)
    .map(Number);

  const top50Time = Object.keys(tratksStats)
    .sort(
      (a, b) =>
        tratksStats[Number(b)].totalTime - tratksStats[Number(a)].totalTime
    )
    .slice(0, 50)
    .map(Number);

  const top50 = [...new Set([...top50Streams, ...top50Time])];

  const tracks = (await db.track
    .where("id")
    .anyOf(top50)
    .with({ artist: "artist_id", album: "album_id" })) as (Track & {
    artist: Artist;
    album: Album;
  })[];

  const rankData = tracks.map((track) => ({
    title: track.name,
    artist: track.artist.name,
    album: track.album.name,
    totalStreams: tratksStats[track.id].totalStreams,
    totalTime: tratksStats[track.id].totalTime
  }));

  return rankData.sort((a, b) => b.totalTime - a.totalTime);
};
