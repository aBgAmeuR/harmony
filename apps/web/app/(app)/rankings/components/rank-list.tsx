// "use client";

// import { useEffect, useState } from "react";

// import { MonthRangePicker } from "@/components/ui/month-range-picker";
// import { useMinMaxDateRange } from "@/hooks/use-min-max-date-range";
// import { Album, Artist, db, Track } from "@/lib/db";
// import { getSpotifyTracksInfo } from "@/lib/spotify";

// export const RankList = () => {
//   const [dates, setDates] = useState<{ start: Date; end: Date }>();
//   const [rankData, setRankData] = useState<
//     {
//       title: string;
//       artist: string;
//       album: string;
//       totalStreams: number;
//       totalTime: number;
//       cover: string | undefined;
//     }[]
//   >();
//   const minMaxDates = useMinMaxDateRange();

//   useEffect(() => {
//     async function fetchData() {
//       if (dates) {
//         const data = await getRankData(dates.start, dates.end);
//         setRankData(data);
//       }
//     }
//     fetchData();
//   }, [dates]);

//   return (
//     <>
//       <MonthRangePicker
//         selectedMonthRange={dates}
//         onMonthRangeSelect={setDates}
//         minDate={minMaxDates?.minDate}
//         maxDate={minMaxDates?.maxDate}
//       />
//       <pre>{JSON.stringify(minMaxDates, null, 2)}</pre>
//       <pre>{JSON.stringify(dates, null, 2)}</pre>
//       <pre>{JSON.stringify(rankData, null, 2)}</pre>
//     </>
//   );
// };

// const getRankData = async (start: Date, end: Date) => {
//   const playbacks = await db.playback
//     .where("timestamp")
//     .between(start, end)
//     .toArray();

//   const tratksStats: Record<
//     number,
//     { totalStreams: number; totalTime: number }
//   > = {};

//   playbacks.forEach((playback) => {
//     const id = playback.track_id;
//     const item = playbacks.find((pb) => pb.track_id === id);
//     if (item) {
//       if (!tratksStats[id]) {
//         tratksStats[id] = { totalStreams: 0, totalTime: 0 };
//       }
//       tratksStats[id].totalStreams += 1;
//       tratksStats[id].totalTime += item.ms_played;
//     }
//   });

//   const top50Streams = Object.keys(tratksStats)
//     .sort(
//       (a, b) =>
//         tratksStats[Number(b)].totalStreams -
//         tratksStats[Number(a)].totalStreams,
//     )
//     .slice(0, 50)
//     .map(Number);

//   const top50Time = Object.keys(tratksStats)
//     .sort(
//       (a, b) =>
//         tratksStats[Number(b)].totalTime - tratksStats[Number(a)].totalTime,
//     )
//     .slice(0, 50)
//     .map(Number);

//   const top50 = [...new Set([...top50Streams, ...top50Time])];

//   const minimalTracks = await db.track.where("id").anyOf(top50).toArray();
//   const tracks = await getTracksInfo(minimalTracks, true, true);

//   const uris = tracks.map((track) => track.spotify_track_uri);
//   const spotifyTracks = await getSpotifyTracksInfo(uris);

//   const rankData = tracks.map((track) => {
//     const spotifyTrack = spotifyTracks.find((spotifyTrack) =>
//       spotifyTrack.name.includes(track.name),
//     );
//     return {
//       title: track.name,
//       artist: track.artist?.name ?? "Unknown Artist",
//       album: track.album?.name ?? "Unknown Album",
//       totalStreams: tratksStats[track.id].totalStreams,
//       totalTime: tratksStats[track.id].totalTime,
//       cover: spotifyTrack?.album.images[0].url,
//     };
//   });

//   return rankData.sort((a, b) => b.totalTime - a.totalTime);
// };

// const getTracksInfo = async (
//   tracks: Track[],
//   withArtist: boolean,
//   withAlbum: boolean,
// ): Promise<
//   {
//     artist: Artist;
//     album: Album;
//     id: number;
//     name: string;
//     artist_id: number;
//     album_id: number;
//     spotify_track_uri: string;
//   }[]
// > => {
//   const artistIds = tracks.map((track) => track.artist_id);
//   const albumIds = tracks.map((track) => track.album_id);

//   const [artists, albums] = await Promise.all([
//     withArtist ? db.artist.where("id").anyOf(artistIds).toArray() : [],
//     withAlbum ? db.album.where("id").anyOf(albumIds).toArray() : [],
//   ]);

//   return tracks.map((track) => {
//     const artist = artists.find((artist) => artist.id === track.artist_id);
//     const album = albums.find((album) => album.id === track.album_id);
//     if (!artist || !album) {
//       throw new Error(`Artist or Album not found for track ${track.id}`);
//     }
//     return {
//       ...track,
//       artist,
//       album,
//     };
//   });
// };
