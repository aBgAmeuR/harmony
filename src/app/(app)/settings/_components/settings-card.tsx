import { Text } from '@mantine/core';

type Props = {
  lefticon?: React.ReactNode
  righticon?: React.ReactNode
  title: string
  subtitle: string
  onClick?: () => void
}

export const SettingsCard = ({ title, subtitle, lefticon, righticon, onClick }: Props) => {
  return (
    <button className='py-2 px-2.5 rounded-lg shadow-sm bg-card flex gap-2 w-full items-center text-left hover:bg-secondary' onClick={onClick}>
      {lefticon}
      <div className='flex flex-col w-full'>
        <Text size="sm" c="dimmed">{subtitle}</Text>
        <Text fw={700} size="md">{title}</Text>
      </div>
      {righticon}
    </button>
  )
}
