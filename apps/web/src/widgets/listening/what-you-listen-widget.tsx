import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { format } from "@/shared/lib/format";
import { Section } from "@/shared/primitives/section";
import { useScope } from "@/shared/scope";

import type { GenreSegment } from "./api";

import { listeningQueries } from "./api";
import { SectionPending } from "./ui/section-pending";

const NO_GENRES: GenreSegment[] = [];
const percent = (value: number) => format.as(value, "percent");

type GenreSlice = { key: string; label: string; share: number; paint: string };

// Above this share, the top genre gets its own bar and the others are enlarged below it.
const ZOOM_FROM = 0.6;
// Paint of each genre from the most played, then of the genres outside the top five.
const GENRE_PAINT = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
const OTHER_PAINT = "bg-muted-foreground/40";

// Flex weight of a slice within its group, so the group fills its bar whatever its total.
const weight = (slice: GenreSlice, slices: GenreSlice[]) => {
  const total = slices.reduce((sum, item) => sum + item.share, 0);
  return total > 0 ? slice.share / total : 0;
};

type GenreBarProps = {
  slices: GenreSlice[];
  hovered: string | null;
  onHover: (key: string | null) => void;
};

// Genres as one bar of segments, each named below its segment with its share of all plays.
const GenreBar = ({ slices, hovered, onHover }: GenreBarProps) => (
  <div className="flex gap-0.5">
    {slices.map((slice, i) => (
      <div
        key={slice.key}
        className={cn(
          "flex min-w-12 flex-col gap-1.5 transition-opacity",
          hovered !== null && hovered !== slice.key && "opacity-40",
        )}
        style={{ flex: `${weight(slice, slices)} 1 0%` }}
        onMouseEnter={() => onHover(slice.key)}
        onMouseLeave={() => onHover(null)}
      >
        <span
          aria-hidden
          className={cn(
            "h-3 rounded-xs",
            i === 0 && "rounded-l-sm",
            i === slices.length - 1 && "rounded-r-sm",
            slice.paint,
          )}
        />
        <span className="truncate text-xs font-medium">{slice.label}</span>
        <span className="-mt-1 text-[10px] text-muted-foreground tabular-nums">
          {percent(slice.share)}
        </span>
      </div>
    ))}
  </div>
);

// The top genres. When the first one takes most of the plays, it gets the whole bar and the
// others, drawn small at its end, are enlarged below. Every share is of all plays.
const Genres = ({ genres }: { genres: GenreSegment[] }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const rest = Math.max(0, 1 - genres.reduce((sum, genre) => sum + genre.share, 0));
  const slices: GenreSlice[] = [
    ...genres.map((genre, i) => ({
      key: genre.key,
      label: genre.label,
      share: genre.share,
      paint: GENRE_PAINT[i] ?? OTHER_PAINT,
    })),
    ...(rest >= 0.001
      ? [{ key: "other", label: "Other genres", share: rest, paint: OTHER_PAINT }]
      : []),
  ];
  const [top, ...others] = slices;
  const zoom = top !== undefined && top.share >= ZOOM_FROM && others.length > 0;
  const remaining = 1 - (top?.share ?? 0);
  const dim = (key: string) => hovered !== null && hovered !== key;

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex min-h-7 items-center justify-between gap-2 text-sm text-muted-foreground">
        Genres
        {zoom ? (
          <span className="text-xs">The other {percent(remaining)}, enlarged below</span>
        ) : null}
      </figcaption>
      {zoom && top ? (
        <div className="flex flex-col">
          <div className="flex h-8 gap-0.5">
            <div
              className={cn(
                "flex min-w-0 items-center justify-between gap-2 rounded-l-md px-3 text-xs font-medium text-background transition-opacity",
                top.paint,
                dim(top.key) && "opacity-40",
              )}
              style={{ flex: `${top.share} 1 0%` }}
              onMouseEnter={() => setHovered(top.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="truncate">{top.label}</span>
              <span className="tabular-nums">{percent(top.share)}</span>
            </div>
            {/* The other genres in miniature, painted like their enlarged segments below. */}
            <div
              className="flex min-w-2 gap-px overflow-hidden rounded-r-md"
              style={{ flex: `${remaining} 1 0%` }}
            >
              {others.map((slice) => (
                <span
                  key={slice.key}
                  aria-hidden
                  className={cn(
                    "min-w-px transition-opacity",
                    slice.paint,
                    dim(slice.key) && "opacity-40",
                  )}
                  style={{ flex: `${weight(slice, others)} 1 0%` }}
                />
              ))}
            </div>
          </div>
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-7 w-full overflow-visible text-muted-foreground"
          >
            <polygon
              points={`${top.share * 100},0 100,0 100,100 0,100`}
              fill="currentColor"
              fillOpacity={0.12}
            />
            <line
              x1={top.share * 100}
              y1="0"
              x2="0"
              y2="100"
              stroke="currentColor"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="100"
              y1="0"
              x2="100"
              y2="100"
              stroke="currentColor"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <GenreBar slices={others} hovered={hovered} onHover={setHovered} />
        </div>
      ) : (
        <GenreBar slices={slices} hovered={hovered} onHover={setHovered} />
      )}
    </figure>
  );
};

export const WhatYouListenWidget = () => {
  const filter = useScope();
  const { data: genres = NO_GENRES, isPending } = useQuery(listeningQueries.genres(filter));
  const genre = genres[0];

  if (isPending) {
    return (
      <SectionPending title="What you listen to">
        <Skeleton className="h-36 rounded-lg" />
      </SectionPending>
    );
  }

  return (
    <Section size="md">
      <Section.Title>What you listen to</Section.Title>
      <Section.Text>
        {genre ? (
          <>
            Your top genre is <strong>{genre.label}</strong>, at{" "}
            <strong>{percent(genre.share)}</strong>.
          </>
        ) : (
          "No genres for this period."
        )}
      </Section.Text>
      {genres.length > 0 ? (
        <div className="mt-3">
          <Genres genres={genres} />
        </div>
      ) : null}
    </Section>
  );
};
