import { Card, Text } from '@mantine/core'
import React from 'react'

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor(((ms % 3600000) % 60000) / 1000)

  return `${hours}h ${minutes}m`
}

type Props = {
  title: string
  ms_played: number
  total_played: number
  cursor?: boolean
}

export const DetailCard = ({ title, ms_played, total_played, cursor = false }: Props) => {
  return (
    <Card className={`w-full flex flex-col rounded-xl hover:bg-secondary group ${cursor ? 'cursor-pointer' : ''}`}>
      <div className=''>
        <Text lineClamp={1} fw={600} size="md">{title}</Text>
      </div>
      <div className='flex w-full items-center justify-between gap-1'>
        <Text lineClamp={1}>{formatTime(ms_played)} Played</Text>
        <Text lineClamp={1}>{total_played} Streams</Text>
      </div>
    </Card>
  )
}