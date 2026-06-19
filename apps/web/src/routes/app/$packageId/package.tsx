import { createFileRoute } from '@tanstack/react-router'
import {
  Alert02Icon,
  Calendar02Icon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@harmony/ui/components/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@harmony/ui/components/tooltip'
import { cn } from '@harmony/ui/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@harmony/ui/components/alert-dialog'
import { Pipeline } from '@/components/pipeline'
import { format } from '@/utils/format'

export const Route = createFileRoute('/app/$packageId/package')({
  component: RouteComponent,
})

type PackageHeaderProps = {
  pkg: { fileName: string; status: string; id: string }
  subtitle: string
}

function PackageHeaderSection({ pkg, subtitle }: PackageHeaderProps) {
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pkg.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <section className="space-y-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="truncate text-lg font-semibold tracking-tight">
            {pkg.fileName}
          </CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
          <CardAction className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <HugeiconsIcon icon={Delete02Icon} />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account from our
                    servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
        <CardFooter className="space-x-1 text-xs text-muted-foreground py-1!">
          <span className="font-mono text-foreground/80">{pkg.id}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="disabled:opacity-100"
                onClick={handleCopy}
                aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                disabled={copied}
              >
                <div
                  className={cn(
                    'transition-all',
                    copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  )}
                >
                  <HugeiconsIcon icon={Tick02Icon} className="size-4 text-emerald-500" />
                </div>
                <div
                  className={cn(
                    'absolute transition-all',
                    copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                  )}
                >
                  <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">Click to copy</TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </section>
  )
}

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
              <p className="text-lg font-semibold">{format.duration(143753)}</p>
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
              <p className="text-xs text-muted-foreground">
                From {format.date('2023-02-11')} to {format.date('2026-06-10')}
              </p>
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
        <Pipeline />
      </section>

      {/* {details?.failure ? (
        <section className="space-y-2">
          <h2 className="mb-3 text-xs font-semibold text-destructive">Failure</h2>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {details.failure.message}
          </div>
        </section>
      ) : null} */}

      <PackageHeaderSection
        pkg={{
          fileName: 'package.json',
          status: 'completed',
          id: '1234567890',
        }}
        subtitle={`${format.date('2023-02-11')} • ${format.bytes(1523532)}`}
      />
    </div>
  )
}
