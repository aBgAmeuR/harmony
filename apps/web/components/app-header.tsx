import React, { PropsWithChildren } from "react";
import { Badge } from "@repo/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/breadcrumb";
import { Separator } from "@repo/ui/separator";
import { SidebarTrigger } from "@repo/ui/sidebar";
import { Info } from "lucide-react";

type AppHeaderProps = PropsWithChildren<{
  items: string[];
}>;

export const AppHeader = ({ items, children }: AppHeaderProps) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 ">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            {items.slice(0, -1).map((item, index) => (
              <React.Fragment key={`${item}-${index}`}>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage className="line-clamp-1 break-all text-sm text-muted-foreground">
                    {item}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </React.Fragment>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">
                {items[items.length - 1]}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Badge>Demo</Badge>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
};
