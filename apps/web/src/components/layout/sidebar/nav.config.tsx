import { Analytics01Icon, MusicNote03Icon, PackageIcon,UserIcon,Vynil01Icon } from '@hugeicons/core-free-icons'
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
}

export const navConfig = {
  main: [
    {
      title: 'Overview',
      url: '/',
      icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
    },
    {
      title: 'My Package',
      url: '/package',
      icon: <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />,
    },
  ],
  analytics: [
    {
      title: 'Artists',
      url: '#',
      icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} />,
    },
    {
      title: 'Tracks',
      url: '#',
      icon: <HugeiconsIcon icon={MusicNote03Icon} strokeWidth={2} />,
    },
    {
      title: 'Albums',
      url: '#',
      icon: <HugeiconsIcon icon={Vynil01Icon} strokeWidth={2} />,
    },
  ],
} satisfies { main: Array<SidebarMainItem>, analytics: Array<SidebarMainItem> }
