import { Badge } from '@harmony/ui/components/badge'
import {
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
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export type SidebarMainItem = {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: Array<{
    title: string
    url: string
  }>
  badge?: React.ReactNode
}

export const navConfig = {
  main: [
    {
      title: 'Overview',
      url: '/',
      icon: <HugeiconsIcon icon={Analytics01Icon} className="text-muted-foreground" />,
    },
    {
      title: 'My Package',
      url: '/package',
      icon: <HugeiconsIcon icon={PackageIcon} className="text-muted-foreground" />,
    },
  ],
  library: [
    {
      title: 'Artists',
      url: '#',
      icon: <HugeiconsIcon icon={UserIcon} className="text-muted-foreground" />,
      badge: (
        <Badge variant="outline" className="ms-auto">
          Soon
        </Badge>
      ),
    },
    {
      title: 'Tracks',
      url: '/tracks',
      icon: <HugeiconsIcon icon={MusicNote03Icon} className="text-muted-foreground" />,
    },
    {
      title: 'Albums',
      url: '/albums',
      icon: <HugeiconsIcon icon={Vynil01Icon} className="text-muted-foreground" />,
    },
  ],
  insights: [
    {
      title: 'Listening Habits',
      url: '#',
      icon: <HugeiconsIcon icon={Chart03Icon} className="text-muted-foreground" />,
    },
    {
      title: 'Personality',
      url: '#',
      icon: <HugeiconsIcon icon={SparklesIcon} className="text-muted-foreground" />,
      badge: (
        <Badge variant="active" className="ms-auto">
          <HugeiconsIcon icon={AiMagicIcon} className="size-3" />
          AI
        </Badge>
      ),
    },
    {
      title: 'Discoveries',
      url: '#',
      icon: <HugeiconsIcon icon={Search01Icon} className="text-muted-foreground" />,
    },
    {
      title: 'Milestones',
      url: '#',
      icon: <HugeiconsIcon icon={CheckmarkBadge01Icon} className="text-muted-foreground" />,
    },
  ],
  social: [
    {
      title: 'Compare',
      url: '#',
      icon: <HugeiconsIcon icon={UserMultipleIcon} className="text-muted-foreground" />,
    },
    {
      title: 'Export',
      url: '#',
      icon: <HugeiconsIcon icon={Share08Icon} className="text-muted-foreground" />,
    },
  ],
  secondary: [
    {
      title: 'Documentation',
      url: '#',
      icon: <HugeiconsIcon icon={Book02Icon} className="text-muted-foreground" />,
    },
    {
      title: 'Settings',
      url: '#',
      icon: <HugeiconsIcon icon={Settings01Icon} className="text-muted-foreground" />,
    },
  ],
} satisfies Record<string, Array<SidebarMainItem>>
