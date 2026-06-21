import { Icon, ArrowUpRight01Icon } from "@harmony/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@harmony/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import * as React from "react";

export function NavSecondary({
  items,
  ...props
}: {
  items: Array<{
    title: string;
    url: string;
    icon: React.ReactNode;
    isExternal?: boolean;
  }>;
} & React.ComponentPropsWithoutRef<typeof SidebarMenu>) {
  return (
    <SidebarMenu {...props}>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.isExternal ? (
            <SidebarMenuButton
              tooltip={item.title}
              render={<a href={item.url} />}
              size="sm"
              className="group/external-link"
            >
              {item.icon}
              <span>{item.title}</span>
              <Icon
                icon={ArrowUpRight01Icon}
                className="ms-auto hidden group-hover/external-link:block"
              />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              tooltip={item.title}
              render={
                <Link
                  from="/app/$packageId"
                  to={item.url.startsWith("/") ? `.${item.url}` : item.url}
                  preload="intent"
                />
              }
              size="sm"
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
