import * as React from 'react'
import { cn } from '@harmony/ui/lib/utils'
import { Button, buttonVariants } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

type Month = {
  number: number
  name: string
}

const MONTHS: Array<Array<Month>> = [
  [
    { number: 0, name: 'Jan' },
    { number: 1, name: 'Feb' },
    { number: 2, name: 'Mar' },
    { number: 3, name: 'Apr' },
  ],
  [
    { number: 4, name: 'May' },
    { number: 5, name: 'Jun' },
    { number: 6, name: 'Jul' },
    { number: 7, name: 'Aug' },
  ],
  [
    { number: 8, name: 'Sep' },
    { number: 9, name: 'Oct' },
    { number: 10, name: 'Nov' },
    { number: 11, name: 'Dec' },
  ],
]

type MonthCalProps = {
  selectedMonth?: Date
  onMonthSelect?: (date: Date) => void
  onYearForward?: () => void
  onYearBackward?: () => void
  callbacks?: {
    yearLabel?: (year: number) => string
    monthLabel?: (month: Month) => string
  }
  variant?: {
    calendar?: {
      main?: ButtonVariant
      selected?: ButtonVariant
    }
    chevrons?: ButtonVariant
  }
  minDate?: Date
  maxDate?: Date
  disabledDates?: Array<Date>
}

type ButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive'
  | 'secondary'
  | null
  | undefined

function MonthPicker({
  onMonthSelect,
  selectedMonth,
  minDate,
  maxDate,
  disabledDates,
  callbacks,
  onYearBackward,
  onYearForward,
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & MonthCalProps) {
  return (
    <div className={cn('w-[160px] p-2', className)} {...props}>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
        <div className="w-full space-y-1">
          <MonthCal
            onMonthSelect={onMonthSelect}
            callbacks={callbacks}
            selectedMonth={selectedMonth}
            onYearBackward={onYearBackward}
            onYearForward={onYearForward}
            variant={variant}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
          ></MonthCal>
        </div>
      </div>
    </div>
  )
}

function MonthCal({
  selectedMonth,
  onMonthSelect,
  callbacks,
  variant,
  minDate,
  maxDate,
  disabledDates,
  onYearBackward,
  onYearForward,
}: MonthCalProps) {
  const [year, setYear] = React.useState<number>(
    selectedMonth?.getFullYear() ?? new Date().getFullYear()
  )
  const [month, setMonth] = React.useState<number>(
    selectedMonth?.getMonth() ?? new Date().getMonth()
  )
  const [menuYear, setMenuYear] = React.useState<number>(year)

  if (minDate && maxDate && minDate > maxDate) minDate = maxDate

  const disabledDatesMapped = disabledDates?.map((d) => {
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  return (
    <>
      <div className="relative flex items-center justify-between">
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => {
            setMenuYear(menuYear - 1)
            if (onYearBackward) onYearBackward()
          }}
          disabled={menuYear <= (minDate ? minDate.getFullYear() : 0)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        {/* <button
            onClick={() => {
              setMenuYear(menuYear - 1)
              if (onYearBackward) onYearBackward()
            }}
            disabled={menuYear <= (minDate ? minDate.getFullYear() : 0)}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
              'absolute left-1 inline-flex h-7 w-7 items-center justify-center p-0'
            )}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 opacity-50" />
          </button> */}
        <div className="font-semibold text-sm">
          {callbacks?.yearLabel ? callbacks?.yearLabel(menuYear) : menuYear}
        </div>
        {/* <button
            onClick={() => {
              setMenuYear(menuYear + 1)
              if (onYearForward) onYearForward()
            }}
            disabled={menuYear >= (maxDate ? maxDate.getFullYear() : 9999)}
            className={cn(
              buttonVariants({ variant: variant?.chevrons ?? 'outline' }),
              'absolute right-1 inline-flex h-7 w-7 items-center justify-center p-0'
            )}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 opacity-50" />
          </button> */}
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => {
            setMenuYear(menuYear + 1)
            if (onYearForward) onYearForward()
          }}
          disabled={menuYear >= (maxDate ? maxDate.getFullYear() : 9999)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>
      <table className="w-full border-collapse space-y-1">
        <tbody>
          {MONTHS.map((monthRow, a) => {
            return (
              <tr key={`row-${a}`} className="mt-1 flex w-full">
                {monthRow.map((m) => {
                  return (
                    <td
                      key={m.number}
                      className="relative h-8 w-1/4 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md"
                    >
                      <button
                        onClick={() => {
                          setMonth(m.number)
                          setYear(menuYear)
                          if (onMonthSelect) onMonthSelect(new Date(menuYear, m.number))
                        }}
                        disabled={
                          (maxDate
                            ? menuYear > maxDate?.getFullYear() ||
                              (menuYear === maxDate?.getFullYear() && m.number > maxDate.getMonth())
                            : false) ||
                          (minDate
                            ? menuYear < minDate?.getFullYear() ||
                              (menuYear === minDate?.getFullYear() && m.number < minDate.getMonth())
                            : false) ||
                          (disabledDatesMapped
                            ? disabledDatesMapped?.some(
                                (d) => d.year === menuYear && d.month === m.number
                              )
                            : false)
                        }
                        className={cn(
                          buttonVariants({
                            variant:
                              month === m.number && menuYear === year
                                ? (variant?.calendar?.selected ?? 'default')
                                : (variant?.calendar?.main ?? 'ghost'),
                            size: 'icon',
                          }),
                          'h-full w-full p-0 font-normal aria-selected:opacity-100'
                        )}
                      >
                        {callbacks?.monthLabel ? callbacks.monthLabel(m) : m.name}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

MonthPicker.displayName = 'MonthPicker'

export { MonthPicker }
