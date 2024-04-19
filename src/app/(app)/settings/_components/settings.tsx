'use client'

import { Button, Title } from "@mantine/core"
import { ExternalLink, Files, Github, Info, UserRound } from "lucide-react"
import { SettingsCard } from "./settings-card"
import { deleteData, getUserInfo } from "@/lib/store"
import { useRouter } from "next/navigation"
import { notifications } from '@mantine/notifications';

const aboutItems = [
  {
    title: 'v1.0.0 (prod)',
    subtitle: 'Version',
    lefticon: <Info size={28} />,
    righticon: <Files size={28} />,
    onClick: () => {
      navigator.clipboard.writeText('v1.0.0 (prod)')
      notifications.show({
        title: 'Copied to clipboard',
        message: 'Version copied to clipboard',
      })
    }
  },
  {
    title: 'GitHub',
    subtitle: 'Contribute',
    lefticon: <Github size={28} />,
    righticon: <ExternalLink size={28} />,
    onClick: () => window.open('https://github.com/aBgAmeuR/Harmony')
  },
  {
    title: 'Antoine JOSSET',
    subtitle: 'Developer',
    lefticon: <UserRound size={28} />,
    righticon: <ExternalLink size={28} />,
    onClick: () => window.open('https://antoinejosset.fr')
  },
]

const Settings = () => {
  const router = useRouter()
  const user = getUserInfo()
  if (!user) return null

  const packageItems = [
    {
      title: user.id,
      subtitle: 'Spotify ID',
      righticon: <Files size={28} />,
      onClick: () => {
        navigator.clipboard.writeText(user.id)
        notifications.show({
          title: 'Copied to clipboard',
          message: 'Spotify ID copied to clipboard',
        })
      }
    },
    {
      title: user.username,
      subtitle: 'Spotify User',
      righticon: <Files size={28} />,
      onClick: () => {
        navigator.clipboard.writeText(user.username)
        notifications.show({
          title: 'Copied to clipboard',
          message: 'Spotify username copied to clipboard',
        })
      }
    },
    {
      title: user.date,
      subtitle: 'Added on',
      righticon: <Files size={28} />,
      onClick: () => {
        navigator.clipboard.writeText(user.date)
        notifications.show({
          title: 'Copied to clipboard',
          message: 'Date added copied to clipboard',
        })
      }
    },
  ]

  const handleDelete = () => {
    deleteData()
    router.push('/')
  }

  return (
    <section className="px-4 py-8 mx-auto w-full max-w-4xl flex flex-col gap-12">
      <div>
        <Title order={2} mb={8}>About</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {aboutItems.map((item, index) => (
            <SettingsCard key={index} {...item} />
          ))}
        </div>
      </div>
      <div>
        <Title order={2} mb={8}>Package Details</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {packageItems.map((item, index) => (
            <SettingsCard key={index} {...item} />
          ))}
        </div>
      </div>
      <div>
        <Title order={2} mb={8}>Action</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button color="green" variant="filled" size="lg" radius="md" fullWidth onClick={handleDelete}>Delete current package</Button>
        </div>
      </div>
    </section>
  )
}

export default Settings