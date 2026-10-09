import { Icon } from "@harmony/icons";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@harmony/ui/components/sidebar";
import { cn } from "@harmony/ui/lib/utils";

import type { NavLinkAdapter } from "../types/link-adapter";
import type { NavItem } from "../types/nav-item";

type NavSectionProps = {
  items: ReadonlyArray<NavItem>;
  title?: string;
  link: NavLinkAdapter;
};

export function NavSection({ items, title, link }: NavSectionProps) {
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu className="gap-0.5">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              render={link.render(item)}
              size="sm"
              tooltip={item.title}
              isActive={link.isActive(item)}
              className={cn(
                "text-sm",
                link.isActive(item) ? "text-sidebar-accent-foreground" : "text-sidebar-foreground",
              )}
            >
              {item.icon && <Icon icon={item.icon} />}
              <span className="line-clamp-1">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
