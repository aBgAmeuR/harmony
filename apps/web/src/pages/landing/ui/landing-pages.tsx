import type { ReactNode } from "react";

import { ClientOnly, Link, useNavigate } from "@tanstack/react-router";

import { Media } from "@/shared/primitives/media";
import { Rank } from "@/shared/primitives/rank";
import { Table } from "@/shared/primitives/table";
import { ReleasesLine } from "@/widgets/discoveries/releases-chart";
import { Measure } from "@/widgets/explorer/table";
import { ListeningShares } from "@/widgets/listening/how-you-listen";
import { MilestonesTimeline } from "@/widgets/milestones/timeline";
import { KpiOverview } from "@/widgets/overview/kpi-overview";

import { RELEASES, WEEKLY } from "./demo/discoveries";
import { TOP_ARTISTS } from "./demo/explorer";
import { PLATFORMS, STYLE } from "./demo/listening";
import { TIMELINE } from "./demo/milestones";
import { OVERVIEW_SAMPLE } from "./demo/overview";
import { LandingSection, SHRINK } from "./landing-section";
import { DEMO_PACKAGE_ID } from "./links";

type TileProps = {
  title: string;
  text: string;
  to:
    | "/app/$packageId/explorer"
    | "/app/$packageId/listening"
    | "/app/$packageId/discoveries"
    | "/app/$packageId/milestones";
  children: ReactNode;
};

// One page of the app as a grid tile: a small version of its widget, then its name and one
// sentence. The tile spans two rows of the grid so the frames of a row line up.
const Tile = ({ title, text, to, children }: TileProps) => (
  <div className="row-span-2 grid min-w-0 grid-rows-subgrid">
    <div className="flex min-w-0 flex-col justify-center overflow-hidden rounded-xl border border-border">
      <div className={SHRINK}>{children}</div>
    </div>
    <div className="flex flex-col gap-0.5 pb-7 text-sm">
      <Link
        to={to}
        params={{ packageId: DEMO_PACKAGE_ID }}
        className="self-start rounded-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        {title}
      </Link>
      <p className="text-pretty text-muted-foreground">{text}</p>
    </div>
  </div>
);

// The Explorer table cut down to the top four artists and the time listened.
const ExplorerTile = () => {
  const navigate = useNavigate();
  const max = Math.max(0, ...TOP_ARTISTS.map((row) => row.playtime));

  return (
    <Table>
      <Table.Head>
        <Table.Row className="bg-background!">
          <Table.Col className="w-8 pl-3 text-center">#</Table.Col>
          <Table.Col className="text-left">Name</Table.Col>
          <Table.Col className="w-28 pr-3 text-right">Time listened</Table.Col>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {TOP_ARTISTS.map((row) => (
          <Table.Row
            key={row.id}
            onSelect={() =>
              navigate({
                to: "/app/$packageId/artists/$artistId",
                params: { packageId: DEMO_PACKAGE_ID, artistId: String(row.id) },
              })
            }
          >
            <Table.Cell className="pl-3 text-center">
              <Rank n={row.rank} />
            </Table.Cell>
            <Table.Cell className="max-w-0">
              <Media>
                <Media.Art src={row.image} alt={row.name} />
                <Media.Body>
                  <Media.Title>{row.name}</Media.Title>
                </Media.Body>
              </Media>
            </Table.Cell>
            <Table.Cell className="pr-3">
              <Measure row={row} sort="playtime" value="playtime" max={max} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export const LandingPages = () => (
  <div className="space-y-12">
    <LandingSection>
      <LandingSection.Title>Overview</LandingSection.Title>
      <LandingSection.Text>
        The totals for the period you pick, set against the same stretch before it
      </LandingSection.Text>
      <LandingSection.Body className="mt-5">
        <div className={SHRINK}>
          <KpiOverview
            data={OVERVIEW_SAMPLE}
            names={{ current: "2026", previous: "2025" }}
            packageId={DEMO_PACKAGE_ID}
            showMore={false}
          />
        </div>
      </LandingSection.Body>
    </LandingSection>

    <LandingSection>
      <LandingSection.Title>Four more pages</LandingSection.Title>
      <LandingSection.Text>
        With the demo's numbers too. Click a name to open the full page
      </LandingSection.Text>
      <LandingSection.Body className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">
        <Tile
          title="Explorer"
          text="Every artist, track and album ranked by time listened"
          to="/app/$packageId/explorer"
        >
          <ExplorerTile />
        </Tile>

        <Tile
          title="Listening Habits"
          text="When and how you listen, down to shuffle, offline plays and devices"
          to="/app/$packageId/listening"
        >
          <ListeningShares style={STYLE} platforms={PLATFORMS} className="p-4" />
        </Tile>

        <Tile
          title="Discoveries"
          text="An artist's album releases next to your weekly listening"
          to="/app/$packageId/discoveries"
        >
          <div className="p-3">
            <ReleasesLine weekly={WEEKLY} releases={RELEASES} aspectRatio={2} />
          </div>
        </Tile>

        <Tile
          title="Milestones"
          text="Round numbers, records and first listens, in the order you reached them"
          to="/app/$packageId/milestones"
        >
          {/* Client only: its tooltips (Base UI) cannot render in the prerender. */}
          <ClientOnly fallback={<div className="h-42" />}>
            <div className="p-4 pb-1">
              <MilestonesTimeline rows={TIMELINE} />
            </div>
          </ClientOnly>
        </Tile>
      </LandingSection.Body>
    </LandingSection>
  </div>
);
