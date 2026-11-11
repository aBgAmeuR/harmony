import { DiscoveriesLede } from "@/widgets/discoveries/lede";
import { WeeklyListeningVsReleasesWidget } from "@/widgets/discoveries/weekly-listening-vs-releases-widget";
import { Page } from "@/widgets/page/page";

export const DiscoveriesPage = () => {
  return (
    <Page title="Discoveries" className="space-y-6">
      <DiscoveriesLede />
      <WeeklyListeningVsReleasesWidget />
    </Page>
  );
};
