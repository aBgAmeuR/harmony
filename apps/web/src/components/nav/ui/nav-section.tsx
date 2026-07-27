import { Icon } from "@harmony/icons";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@harmony/ui/components/sidebar";

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
              className="text-sm"
            >
              {item.icon && <Icon icon={item.icon} className="text-muted-foreground" />}
              <span className="line-clamp-1 text-foreground">{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
