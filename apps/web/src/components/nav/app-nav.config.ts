import {
  Analytics01Icon,
  Book02Icon,
  Chart03Icon,
  CheckmarkBadge01Icon,
  MusicNote03Icon,
  PackageIcon,
  Search01Icon,
  Settings01Icon,
  Share08Icon,
  UserIcon,
  UserMultipleIcon,
  Vynil01Icon,
  GithubIcon,
} from "@harmony/icons";

import { NavItem } from "./types/nav-item";

export const appNav = {
  main: [
    {
      title: "Overview",
      href: "/",
      icon: Analytics01Icon,
    },
    {
      title: "My Package",
      href: "/package",
      icon: PackageIcon,
    },
  ],
  library: [
    {
      title: "Artists",
      href: "/artists",
      icon: UserIcon,
    },
    {
      title: "Tracks",
      href: "/tracks",
      icon: MusicNote03Icon,
    },
    {
      title: "Albums",
      href: "/albums",
      icon: Vynil01Icon,
    },
  ],
  insights: [
    {
      title: "Listening Habits",
      href: "/listening",
      icon: Chart03Icon,
    },
    // {
    //   title: "Personality",
    //   href: "#",
    //   icon: SparklesIcon,
    // },
    {
      title: "Discoveries",
      href: "/discoveries",
      icon: Search01Icon,
    },
    {
      title: "Milestones",
      href: "#",
      icon: CheckmarkBadge01Icon,
    },
  ],
  social: [
    {
      title: "Compare",
      href: "#",
      icon: UserMultipleIcon,
    },
    {
      title: "Export",
      href: "#",
      icon: Share08Icon,
    },
  ],
  secondary: [
    {
      title: "Github",
      href: "https://github.com/aBgAmeuR/Harmony",
      icon: GithubIcon,
      external: true,
    },
    {
      title: "Documentation",
      href: "#",
      icon: Book02Icon,
      external: true,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings01Icon,
      external: false,
    },
  ],
} satisfies Record<string, Array<NavItem>>;
