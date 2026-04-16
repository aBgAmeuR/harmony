import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@harmony/ui/components/chart'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import { CatalogDetailsSection } from './catalog-details-section'
import type { CatalogDetails } from '../catalog'

type CatalogDetailsTrendProps = {
  trend: CatalogDetails['trend']
}

const chartConfig = {
  value: {
    label: 'Minutes',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export const CatalogDetailsTrend = ({ trend }: CatalogDetailsTrendProps) => {
  return (
    <CatalogDetailsSection title="Trend">
      <ChartContainer config={chartConfig} className="aspect-auto h-36 w-full">
        <LineChart accessibilityLayer data={trend} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </CatalogDetailsSection>
  )
}
