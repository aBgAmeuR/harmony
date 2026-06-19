'use client'

import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { BProgress } from '@bprogress/core'

export function RouterProgress() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribeBeforeNavigate = router.subscribe('onBeforeNavigate', ({ pathChanged }) => {
      if (pathChanged) BProgress.start()
    })

    const unsubscribeResolved = router.subscribe('onResolved', () => {
      BProgress.done()
    })

    return () => {
      unsubscribeBeforeNavigate()
      unsubscribeResolved()
    }
  }, [router])

  return null
}
