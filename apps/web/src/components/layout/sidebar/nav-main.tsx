import { Icon, ArrowRight01Icon } from "@harmony/icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@harmony/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@harmony/ui/components/sidebar";
import { Link, useMatchRoute } from "@tanstack/react-router";

import type { SidebarMainItem } from "./nav.config";

export function NavMain({
  items,
  title,
}: {
  items: ReadonlyArray<SidebarMainItem>;
  title?: string;
}) {
  const matchRoute = useMatchRoute();

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const to = item.url === "/" ? "." : item.url.startsWith("/") ? `.${item.url}` : item.url;
          const exact = item.url === "/";
          const isActive = Boolean(
            matchRoute({
              from: "/app/$packageId",
              to,
              fuzzy: !exact,
              includeSearch: false,
            }),
          );

          return (
            <Collapsible
              key={item.title}
              render={<SidebarMenuItem />}
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              {!item.items ? (
                <SidebarMenuButton
                  render={
                    <Link
                      from="/app/$packageId"
                      to={to}
                      preload="intent"
                      activeOptions={{ exact }}
                    />
                  }
                  size="sm"
                  tooltip={item.title}
                  isActive={isActive}
                  className="text-sm"
                >
                  {item.icon}
                  <span className="line-clamp-1 text-foreground">{item.title}</span>
                  {item.badge}
                </SidebarMenuButton>
              ) : (
                <>
                  <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
                    {item.icon}
                    <span className="line-clamp-1">{item.title}</span>
                    <Icon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton render={<a href={subItem.url} />}>
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              )}
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
