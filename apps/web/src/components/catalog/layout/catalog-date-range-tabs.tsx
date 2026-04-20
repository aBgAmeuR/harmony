import { Tabs, TabsList, TabsTrigger } from '@harmony/ui/components/tabs'
import { DateRangeFilter } from '@/components/toolbar/date-range-filter'
import { type DateRangeMode, useDateRangeStore } from '@/lib/store'

export function CatalogDateRangeTabs() {
  const mode = useDateRangeStore((s) => s.mode)
  const setMode = useDateRangeStore((s) => s.setMode)

  return (
    <div className="shrink-0 border-b border-border px-4">
      <div className="flex gap-3 items-center justify-between">
        <Tabs value={mode} onValueChange={(value) => setMode(value as DateRangeMode)}>
          <TabsList variant="line" className="gap-4">
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Years</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex shrink-0 justify-end pb-1">
          <DateRangeFilter />
        </div>
      </div>
    </div>
  )
}
