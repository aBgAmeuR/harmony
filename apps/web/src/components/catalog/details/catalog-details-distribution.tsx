import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@harmony/ui/components/chart'
import { Bar, BarChart, Cell, XAxis } from 'recharts'
import React from 'react'
import { CatalogDetailsSection } from './catalog-details-section'
import type { CatalogDetails } from '../catalog'

type CatalogDetailsDistributionProps = {
  distribution: CatalogDetails['distribution']
}

const chartConfig = {
  value: {
    label: 'Minutes',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export const CatalogDetailsDistribution = ({ distribution }: CatalogDetailsDistributionProps) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  return (
    <CatalogDetailsSection title="Distribution">
      <ChartContainer config={chartConfig} className="aspect-auto h-36 w-full">
        <BarChart
          accessibilityLayer
          data={distribution}
          barCategoryGap="12%"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-value)">
            {distribution.map((_, index) => (
              <Cell
                className="duration-200 ease-in-out"
                key={`cell-${index}`}
                fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3}
                stroke={activeIndex === index ? 'var(--color-value)' : ''}
                onMouseEnter={() => setActiveIndex(index)}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </CatalogDetailsSection>
  )
}
