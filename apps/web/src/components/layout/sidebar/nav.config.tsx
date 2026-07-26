import {
  Icon,
  AiMagicIcon,
  Analytics01Icon,
  Book02Icon,
  Chart03Icon,
  CheckmarkBadge01Icon,
  MusicNote03Icon,
  PackageIcon,
  Search01Icon,
  Settings01Icon,
  Share08Icon,
  SparklesIcon,
  UserIcon,
  UserMultipleIcon,
  Vynil01Icon,
  GithubIcon,
} from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";

export type SidebarMainItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
  }>;
  badge?: React.ReactNode;
  isExternal?: boolean;
};

export const navConfig = {
  main: [
    {
      title: "Overview",
      url: "/",
      icon: <Icon icon={Analytics01Icon} className="text-muted-foreground" />,
    },
    {
      title: "My Package",
      url: "/package",
      icon: <Icon icon={PackageIcon} className="text-muted-foreground" />,
      badge: (
        <Badge variant="outline" className="ms-auto">
          Soon
        </Badge>
      ),
    },
  ],
  library: [
    {
      title: "Artists",
      url: "/artists",
      icon: <Icon icon={UserIcon} className="text-muted-foreground" />,
    },
    {
      title: "Tracks",
      url: "/tracks",
      icon: <Icon icon={MusicNote03Icon} className="text-muted-foreground" />,
    },
    {
      title: "Albums",
      url: "/albums",
      icon: <Icon icon={Vynil01Icon} className="text-muted-foreground" />,
    },
  ],
  insights: [
    {
      title: "Listening Habits",
      url: "/listening",
      icon: <Icon icon={Chart03Icon} className="text-muted-foreground" />,
    },
    {
      title: "Personality",
      url: "#",
      icon: <Icon icon={SparklesIcon} className="text-muted-foreground" />,
      badge: (
        <Badge variant="active" className="ms-auto">
          <Icon icon={AiMagicIcon} className="size-3" />
          AI
        </Badge>
      ),
    },
    {
      title: "Discoveries",
      url: "#",
      icon: <Icon icon={Search01Icon} className="text-muted-foreground" />,
    },
    {
      title: "Milestones",
      url: "#",
      icon: <Icon icon={CheckmarkBadge01Icon} className="text-muted-foreground" />,
    },
  ],
  social: [
    {
      title: "Compare",
      url: "#",
      icon: <Icon icon={UserMultipleIcon} className="text-muted-foreground" />,
    },
    {
      title: "Export",
      url: "#",
      icon: <Icon icon={Share08Icon} className="text-muted-foreground" />,
    },
  ],
  secondary: [
    {
      title: "Github",
      url: "https://github.com/aBgAmeuR/Harmony",
      icon: <Icon icon={GithubIcon} className="text-muted-foreground" />,
      isExternal: true,
    },
    {
      title: "Documentation",
      url: "#",
      icon: <Icon icon={Book02Icon} className="text-muted-foreground" />,
      isExternal: true,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Icon icon={Settings01Icon} className="text-muted-foreground" />,
      isExternal: false,
    },
  ],
} satisfies Record<string, Array<SidebarMainItem>>;
