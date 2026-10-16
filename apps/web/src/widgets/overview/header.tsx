import { SidebarTrigger } from "@harmony/ui/components/sidebar";

import { DateRangeFilter } from "@/features/filter-period";

export const OverviewHeader = () => (
  <header className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 pt-8">
    <SidebarTrigger className="-ml-2 md:hidden" />
    <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
    <div className="ml-auto">
      <DateRangeFilter />
    </div>
  </header>
);
