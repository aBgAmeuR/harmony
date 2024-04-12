import { Button } from '@mantine/core'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  msg: string
  href: string
}

export const ErrorDetail = ({ msg, href }: Props) => {
  const router = useRouter()

  return (
    <div className="grid pt-20 place-content-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>

        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">Uh-oh!</p>

        <p className="mt-4 text-gray-500">{msg}</p>

        <Button
          onClick={() => router.push(href)}
          className="mt-6 inline-block rounded bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          Back
        </Button>
      </div>
    </div>
  )
}
