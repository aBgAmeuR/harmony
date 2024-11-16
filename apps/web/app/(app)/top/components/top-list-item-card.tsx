// import { format } from "date-fns";
// import { Clock, ExternalLink } from "lucide-react";
// import Image from "next/image";

// type TopListItemCardProps = {
//   layout: "grid" | "list";
//   imageUri: string;
//   title: string;
//   subtitle: string;
//   rank?: number;
//   link: string;
//   album?: string;
//   showSubtitle?: boolean;
//   duration?: number;
//   playedAt?: Date;
// };

// export const TopListItemCard = ({
//   layout,
//   imageUri,
//   link,
//   rank,
//   showSubtitle,
//   subtitle,
//   title,
//   duration,
//   album,
//   playedAt
// }: TopListItemCardProps) => {
//   if (layout === "grid") {
//     return (
//       <div>
//         <Image
//           src={imageUri}
//           alt={`${title} cover`}
//           width={200}
//           height={200}
//           className="aspect-square rounded-md object-cover"
//         />
//         <p className="mt-1 line-clamp-1 break-all text-sm font-medium">{`${rank}. ${title}`}</p>
//         {showSubtitle ? (
//           <p className="line-clamp-1 break-all text-sm text-muted-foreground">
//             {subtitle}
//           </p>
//         ) : null}
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center space-x-4 py-4">
//       {rank ? (
//         <span className="w-6 text-right text-sm font-medium text-muted-foreground">
//           {rank}
//         </span>
//       ) : null}
//       <Image
//         src={imageUri}
//         alt={`${title} cover`}
//         width={64}
//         height={64}
//         className="aspect-square rounded-md object-cover"
//       />
//       <div className="flex-1 space-y-1">
//         <p className="line-clamp-2 break-all text-sm font-medium leading-none">
//           {title}
//         </p>
//         <p className="line-clamp-2 break-all text-sm text-muted-foreground">
//           {subtitle}
//         </p>
//       </div>
//       {album ? (
//         <div className="line-clamp-1 hidden break-all text-sm text-muted-foreground xl:block">
//           {album}
//         </div>
//       ) : null}
//       {duration ? (
//         <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//           <Clock className="size-4" />
//           <span>
//             {Math.floor(duration / 60000)}:
//             {((duration % 60000) / 1000).toFixed(0).padStart(2, "0")}
//           </span>
//         </div>
//       ) : null}
//       {playedAt ? (
//         <div className="text-right text-sm font-medium text-muted-foreground">
//           {format(new Date(playedAt), "dd/MM/yyyy, HH:mm")}
//         </div>
//       ) : null}
//       <a
//         href={link}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-primary hover:text-primary/80"
//       >
//         <ExternalLink className="size-4" />
//         <span className="sr-only">Open in Spotify</span>
//       </a>
//     </div>
//   );
// };
