import { Icon, ArrowUpRight01Icon } from "@harmony/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@harmony/ui/components/sidebar";

import type { NavLinkAdapter } from "../types/link-adapter";
import type { NavItem } from "../types/nav-item";

type NavFooterProps = {
  items: ReadonlyArray<NavItem>;
  link: NavLinkAdapter;
};

export function NavFooter({ items, link }: NavFooterProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.external ? (
            <SidebarMenuButton
              tooltip={item.title}
              render={link.render(item)}
              size="sm"
              className="group/external-link"
            >
              {item.icon && <Icon icon={item.icon} className="text-muted-foreground" />}
              <span>{item.title}</span>
              <Icon
                icon={ArrowUpRight01Icon}
                className="ms-auto hidden group-hover/external-link:block"
              />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              tooltip={item.title}
              render={link.render(item)}
              size="sm"
              isActive={link.isActive(item)}
            >
              {item.icon && <Icon icon={item.icon} className="text-muted-foreground" />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
