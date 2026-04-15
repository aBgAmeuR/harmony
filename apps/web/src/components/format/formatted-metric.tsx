import { cn } from '@harmony/ui/lib/utils'

type FormattedMetricProps = {
  value: number
  unit?: string
  className?: string
  size?: 'sm' | 'md'
}

export const FormattedMetric = ({ value, unit, size = 'md', className }: FormattedMetricProps) => {
  return (
    <span
      data-slot="formatted-metric"
      data-size={size}
      className={cn('group/formatted-metric flex items-baseline gap-0.5', className)}
    >
      <span className="text-md font-semibold group-data-[size=sm]/formatted-metric:text-sm group-data-[size=sm]/formatted-metric:font-medium">
        {value.toLocaleString('en-US', { maximumFractionDigits: 1 })}
      </span>
      {unit && (
        <span className="text-md group-data-[size=sm]/formatted-metric:text-xs text-muted-foreground">
          {unit}
        </span>
      )}
    </span>
  )
}
