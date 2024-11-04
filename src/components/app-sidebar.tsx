"use client";

import * as React from "react";
import {
  AudioLines,
  Binary,
  ChartLine,
  ChartNoAxesCombined,
  Disc3,
  LayoutDashboard,
  TrendingUp,
  TrendingUpDown,
  UserRoundPen
} from "lucide-react";

import { Icons } from "./icons";
import { ThemeToggle } from "./theme-toggle";

import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  teams: {
    name: "Harmony",
    logo: Icons.logo
  },
  overview: [
    {
      title: "Overview",
      url: "/overview",
      icon: LayoutDashboard
    },
    {
      title: "Rankings",
      url: "/rankings",
      icon: TrendingUp,
      isActive: true,
      items: [
        {
          title: "Tracks",
          url: "#",
          icon: AudioLines
        },
        {
          title: "Albums",
          url: "#",
          icon: Disc3
        },
        {
          title: "Artists",
          url: "#",
          icon: UserRoundPen
        }
      ]
    },
    {
      title: "Stats",
      url: "/stats",
      icon: ChartNoAxesCombined,
      isActive: true,
      items: [
        {
          title: "Numbers",
          url: "#",
          icon: Binary
        },
        {
          title: "Listening Habits",
          url: "#",
          icon: ChartLine
        },
        {
          title: "Activity",
          url: "#",
          icon: TrendingUpDown
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher logo={data.teams.logo} name={data.teams.name} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.overview} label="Stats" />
      </SidebarContent>
      <SidebarFooter className="flex items-center">
        {/* <NavUser user={data.user} /> */}
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
