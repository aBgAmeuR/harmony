"use client";

import { Button } from "@repo/ui/button";
import { SidebarMenu, SidebarMenuItem } from "@repo/ui/sidebar";
import { Github } from "lucide-react";

import { ThemeToggle } from "../theme-toggle";

export function NavFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between overflow-hidden">
        <ThemeToggle className="size-8 min-h-8 min-w-8" />
        <span className="text-xs text-muted-foreground">v2.0</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 min-h-8 min-w-8"
          asChild
        >
          <a
            href="https://github.com/aBgAmeuR/Harmony"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={18} />
          </a>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
