'use client'

import { ChartActivityMonth } from '@/components/chart-activity-month'
import { ChartHoursDistribution } from '@/components/chart-hours-distribution'
import { StatsCardsSection } from '@/components/stats-cards-section'

const StatsPage = () => {
  return (
    <main className="px-4 py-8 mx-auto w-full max-w-4xl">
      <StatsCardsSection version='grid' />
      <ChartHoursDistribution />
      <ChartActivityMonth />
    </main>
  )
}

export default StatsPage
