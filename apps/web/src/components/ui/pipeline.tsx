import { Tooltip, TooltipContent, TooltipTrigger } from '@harmony/ui/components/tooltip'
import { cn } from '@harmony/ui/lib/utils'
import { Cancel01Icon, Loading03Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { PropsWithChildren } from 'react'
import { format } from '@/utils/format'

const PipelineItem = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn('px-3', className)}>{children}</div>
}

const PipelineItemHeader = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn('flex items-center', className)}>{children}</div>
}

const PipelineItemIcon = ({ status }: { status: 'loading' | 'done' | 'error' }) => {
  switch (status) {
    case 'loading':
      return <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
    case 'done':
      return <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4 text-primary" />
    case 'error':
      return (
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4 text-destructive" />
      )
    default:
      return null
  }
}

const PipelineItemLabel = ({ label, className }: { label: string; className?: string }) => {
  return (
    <span className={cn('min-w-0 flex-1 text-sm text-foreground ml-3', className)}>{label}</span>
  )
}

const PipelineItemDuration = ({ startAt, endAt }: { startAt: string; endAt?: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="min-w-[52px] text-right text-xs tabular-nums text-muted-foreground">
          {format.duration(endAt ? new Date(endAt).getTime() - new Date(startAt).getTime() : 0)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span>{format.time(startAt)}</span>
        {endAt && (
          <>
            <span>-</span>
            <span>{format.time(endAt)}</span>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

const PipelineItemContent = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn('ms-7 text-xs text-muted-foreground', className)}>{children}</div>
}

export { PipelineItem, PipelineItemHeader, PipelineItemIcon, PipelineItemLabel, PipelineItemDuration, PipelineItemContent }
