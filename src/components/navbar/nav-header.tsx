"use client";

import { ElementType } from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

type NavHeaderProps = {
  Logo: ElementType;
  name: string;
};

export function NavHeader({ Logo, name }: NavHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8">
            <Logo className="size-8" />
          </div>
          <div className="grid flex-1 text-left text-xl leading-tight">
            <span className="truncate font-semibold">{name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
