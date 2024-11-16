// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { CircleX, Info } from "lucide-react";

// import { TopListItemCard } from "./top-list-item-card";
// import { TopListSkeleton } from "./top-list-skeleton";

// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator";
// import { getUserTopItems } from "@/lib/spotify";
// import { useTopTimeRange } from "@/lib/store";
// import { cn } from "@/lib/utils";
// import { Track } from "@/types/spotify";

// export const TopTracksList = () => {
//   const timeRange = useTopTimeRange((state) => state.time_range);
//   const layout = useTopTimeRange((state) => state.list_layout);

//   const { data: tracks, isError } = useQuery({
//     queryKey: ["top_tracks", "tracks", timeRange],
//     queryFn: async () => await getUserTopItems<Track>("tracks", timeRange)
//   });

//   if (isError)
//     return (
//       <Alert variant="destructive">
//         <CircleX className="size-4" />
//         <AlertTitle>Failed to load tracks</AlertTitle>
//         <AlertDescription>Try refreshing the page</AlertDescription>
//       </Alert>
//     );

//   if (!tracks) return <TopListSkeleton layout={layout} />;

//   if (tracks.length === 0) {
//     return (
//       <Alert variant="info">
//         <Info className="size-4" />
//         <AlertTitle>No tracks found</AlertTitle>
//         <AlertDescription>
//           Try listening to more music to see some tracks here
//         </AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <div
//       className={cn(
//         layout === "list"
//           ? "flex flex-col"
//           : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
//       )}
//     >
//       {tracks
//         ?.filter((track) => track.duration_ms > 0)
//         .map((track, index) => (
//           <div key={track.id}>
//             <TopListItemCard
//               layout={layout}
//               imageUri={track.album.images[0]?.url}
//               title={track.name}
//               subtitle={track.artists.map((artist) => artist.name).join(", ")}
//               rank={index + 1}
//               link={track.external_urls.spotify}
//               album={track.album.name}
//               showSubtitle
//               duration={track.duration_ms}
//             />
//             {layout === "list" && index < tracks.length - 1 && <Separator />}
//           </div>
//         ))}
//     </div>
//   );
// };
