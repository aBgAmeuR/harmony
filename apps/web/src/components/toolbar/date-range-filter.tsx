import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { ButtonGroup } from '@harmony/ui/components/button-group'
import { useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@harmony/ui/components/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@harmony/ui/components/dropdown-menu'
import { MonthPicker } from '@/components/ui/month-picker'
import { useCursorDate, useDateRangeStore } from '@/lib/store'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const DateRangeFilter = () => {
  const mode = useDateRangeStore((s) => s.mode)
  const step = useDateRangeStore((s) => s.step)
  const setCustomRange = useDateRangeStore((s) => s.setCustomRange)
  const cursorDate = useCursorDate()
  const setCursor = useDateRangeStore((s) => s.setCursor)

  const monthLabel = useMemo(() => {
    return `${MONTHS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`
  }, [cursorDate])

  const yearLabel = useMemo(() => String(cursorDate.getFullYear()), [cursorDate])

  if (mode === 'custom') {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setCustomRange('2024-01-12', '2026-03-15')}
      >
        12 Jan 2024 - 15 Mar 2026
      </Button>
    )
  }

  if (mode === 'month') {
    return (
      <ButtonGroup>
        <Button size="icon-sm" variant="secondary" onClick={() => step(-1)}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="secondary">
              {monthLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <MonthPicker onMonthSelect={(date) => setCursor(date)} selectedMonth={cursorDate} />
          </PopoverContent>
        </Popover>

        <Button size="icon-sm" variant="secondary" onClick={() => step(1)}>
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </ButtonGroup>
    )
  }

  return (
    <ButtonGroup>
      <Button size="icon-sm" variant="secondary" onClick={() => step(-1)}>
        <HugeiconsIcon icon={ArrowLeft01Icon} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm">
            {yearLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            value={yearLabel}
            onValueChange={(value) => setCursor(new Date(Number(value), 0, 1))}
          >
            <DropdownMenuRadioItem value="2024">2024</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2025">2025</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2026">2026</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="icon-sm" variant="secondary" onClick={() => step(1)}>
        <HugeiconsIcon icon={ArrowRight01Icon} />
      </Button>
    </ButtonGroup>
  )
}
