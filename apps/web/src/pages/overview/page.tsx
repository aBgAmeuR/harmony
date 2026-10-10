import { OverviewHeader } from "@/widgets/overview/header";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiChartWidget } from "@/widgets/overview/kpi-chart-widget";
import { TopWidget } from "@/widgets/overview/top-widget";

export const OverviewPage = () => (
  <div>
    <OverviewHeader />
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-10">
      <KpiChartWidget />
      <HighlightsWidget />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <TopWidget by="track" />
        <TopWidget by="album" />
        <TopWidget by="artist" />
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Habits</h2>
        {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HabitsWidget />
          </div>
          <BehaviorWidget />
        </div> */}
      </section>
    </main>
  </div>
);
