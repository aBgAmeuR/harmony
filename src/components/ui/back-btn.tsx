'use client'

import { Button } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren

export const BackBtn = ({ children }: Props) => {
  const router = useRouter()

  return (
    <button onClick={() => router.back()} className="cursor-pointer py-2 pl-1 pr-3 flex items-center gap-2 rounded-lg hover:bg-tertiary">
      {children}
    </button>
  )
}
