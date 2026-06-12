import { createFileRoute } from '@tanstack/react-router'
import {
  Alert02Icon,
  Calendar02Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import { format } from '@/utils/format';

export const Route = createFileRoute('/app/$packageId/settings')({
  component: RouteComponent,
})


function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-3 pt-12">
      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Clock01Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Total duration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{format.duration(1000)}</p>
              <p className="text-xs text-muted-foreground">End-to-end processing time</p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Calendar02Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">1,234 days</p>
              <p className="text-xs text-muted-foreground">From {format.date("2023-02-11")} to {format.date("2026-06-10")}</p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <HugeiconsIcon icon={Alert02Icon} className="size-4 text-muted-foreground" />
              </CardAction>
              <CardTitle className="text-muted-foreground">Skipped tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">64</p>
              <p className="text-xs text-muted-foreground">During enrichment</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">Pipeline</h2>
      </section>

    </div>
  )
}
