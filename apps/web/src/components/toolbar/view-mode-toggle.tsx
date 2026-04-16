import { Button } from '@harmony/ui/components/button'
import { cn } from '@harmony/ui/lib/utils'
import { LayoutGridIcon, Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import React from 'react'

export const ViewModeToggle = () => {
  const [listLayout, setListLayout] = React.useState<'grid' | 'list'>('list')

  return (
    <Button
      asChild
      variant="outline"
      size="default"
      className="relative h-8 min-w-16 shrink-0 items-stretch gap-0 p-0.5 shadow-none ring-0 ring-offset-0 focus-visible:ring-0 focus-within:ring-0 active:translate-y-0 focus-visible:border-border dark:focus-visible:border-input focus-within:border-border dark:focus-within:border-input"
    >
      <div role="group" aria-label="Track list layout">
        <div className="relative flex h-full min-w-16 w-full flex-1">
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 z-0 w-1/2 rounded-sm bg-primary transition-[inset-inline-start] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              listLayout === 'grid' ? 'inset-s-1/2' : 'inset-s-0'
            )}
          />
          <button
            type="button"
            aria-pressed={listLayout !== 'grid'}
            aria-label="List view"
            onClick={() => setListLayout('list')}
            className={cn(
              'relative z-10 flex min-w-8 flex-1 items-center justify-center rounded-sm outline-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              listLayout !== 'grid' ? 'text-primary-foreground' : 'text-muted-foreground/70'
            )}
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-4" />
          </button>
          <button
            type="button"
            aria-pressed={listLayout === 'grid'}
            aria-label="Grid view"
            onClick={() => setListLayout('grid')}
            className={cn(
              'relative z-10 flex min-w-8 flex-1 items-center justify-center rounded-sm outline-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              listLayout === 'grid' ? 'text-primary-foreground' : 'text-muted-foreground/70'
            )}
          >
            <HugeiconsIcon icon={LayoutGridIcon} strokeWidth={2} className="size-4" />
          </button>
        </div>
      </div>
    </Button>
  )
}
