import type { ReactNode } from "react";

import { SidebarTrigger } from "@harmony/ui/components/sidebar";

import { DateRangeFilter } from "@/features/filter-period";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";

type PageProps = {
  title: ReactNode;
  width?: "column" | "full";
  className?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export const Page = ({ title, width = "column", className, aside, children }: PageProps) => (
  <Pane>
    <Pane.Header>
      <SidebarTrigger className="-ml-2 md:hidden" />
      {typeof title === "string" ? <Pane.Title>{title}</Pane.Title> : title}
      <Toolbar.End>
        <DateRangeFilter />
      </Toolbar.End>
    </Pane.Header>
    <Pane.Body width={width} className={className}>
      {children}
    </Pane.Body>
    {aside}
  </Pane>
);
