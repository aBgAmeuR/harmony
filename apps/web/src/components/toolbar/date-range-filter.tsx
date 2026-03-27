import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, UnfoldMoreIcon } from '@hugeicons/core-free-icons'

export const DateRangeFilter = () => {
  return (
    <Button
      variant="outline"
      aria-label="Select date range"
      className="w-[180px] justify-between text-xs sm:w-[220px]"
    >
      <div className="flex items-center gap-1.5">
        <span className="hidden text-muted-foreground text-xs sm:block">Range</span>
        <div className="flex items-center gap-1">
          <span>Jan 2024</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          <span>Mar 2026</span>
        </div>
      </div>
      <HugeiconsIcon icon={UnfoldMoreIcon} className="size-4 text-muted-foreground" />
    </Button>
  )
}
