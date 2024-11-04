"use client";

import { ElementType } from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  logo,
  name
}: {
  name: string;
  logo: ElementType;
}) {
  const Icon = logo;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8">
            <Icon className="size-8" />
          </div>
          <div className="grid flex-1 text-left text-xl leading-tight">
            <span className="truncate font-semibold">{name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
