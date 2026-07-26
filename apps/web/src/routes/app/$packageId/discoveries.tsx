/**
 * PROTOTYPE — Discoveries page.
 *
 * Order: weekly vs releases → KPIs → forgotten / new finds → stuck → near release.
 * Run: pnpm dev → /app/<packageId>/prototype-discoveries
 */
import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header/header";
import { DiscoveriesPrototypePage } from "@/features/discoveries/prototype/discoveries-prototype-page";
import { discoveriesPrototypeQueries } from "@/features/discoveries/prototype/queries";
import { useArtistStore } from "@/lib/stores/artist-store";
import { buildInstantRangeQuery, useDateRangeStore } from "@/lib/stores/date-range-store";

export const Route = createFileRoute("/app/$packageId/discoveries")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const artistId = useArtistStore.getState().artist?.id;
    const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
    if (artistId == null) return;
    
    await Promise.all([
      queryClient.ensureQueryData(
        discoveriesPrototypeQueries.weeklyActivity.queryOptions({ artistId, from, to }),
      ),
      queryClient.ensureQueryData(
        discoveriesPrototypeQueries.artistReleases.queryOptions({ artistId, from, to }),
      ),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header title="Discoveries" />
      <DiscoveriesPrototypePage />
    </div>
  );
}
