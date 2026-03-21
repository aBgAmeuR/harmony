import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Loading03Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Button } from '@harmony/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import { cn } from '@harmony/ui/lib/utils'
import { TextMorph } from 'torph/react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@harmony/ui/components/tooltip'
import { Badge } from '@harmony/ui/components/badge'

type UploadUiStepStatus = 'pending' | 'running' | 'done' | 'error'

type UploadUiStepKey =
  | 'extract_archive'
  | 'parse_interactions'
  | 'normalize_interactions'
  | 'resolve_tracks'
  | 'enrich_tracks'
  | 'persist_interactions'

type EnrichTracksStepData = {
  tracksToProcess: number
  tracksProcessed: number
  tracksSkipped: number
}

type NormalizeInteractionsStepData = {
  rejectedCount: number
  keptCount: number
}

type UploadUiStepData = EnrichTracksStepData | NormalizeInteractionsStepData

type UploadUiStep = {
  key: UploadUiStepKey
  label: string
  status: UploadUiStepStatus
  startAt?: string
  endAt?: string
  error?: string
  data?: UploadUiStepData
}

const STEP_ORDER: Array<UploadUiStepKey> = [
  'extract_archive',
  'parse_interactions',
  'normalize_interactions',
  'resolve_tracks',
  'enrich_tracks',
  'persist_interactions',
]

const STEP_LABEL: Record<UploadUiStepKey, string> = {
  extract_archive: 'Extract archive',
  parse_interactions: 'Parse interactions',
  normalize_interactions: 'Normalize interactions',
  resolve_tracks: 'Resolve tracks',
  enrich_tracks: 'Enrich tracks',
  persist_interactions: 'Save interactions',
}

function getIsoMs(iso?: string): number | null {
  if (!iso) return null
  const d = new Date(iso)
  const ms = d.getTime()
  if (Number.isNaN(ms)) return null
  return ms
}

function formatDurationMs(durationMs: number): string | null {
  if (!Number.isFinite(durationMs) || durationMs < 0) return null
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`
  return `${(durationMs / 1000).toFixed(1)}s`
}

function formatDurationSeconds(startAt?: string, endAt?: string): string | null {
  const startMs = getIsoMs(startAt)
  const endMs = getIsoMs(endAt)
  if (startMs === null || endMs === null) return null
  return formatDurationMs(endMs - startMs)
}

function formatElapsedSince(startAt?: string, nowTs?: number): string | null {
  if (!startAt || nowTs === undefined) return null
  const startMs = getIsoMs(startAt)
  if (startMs === null) return null
  return formatDurationMs(nowTs - startMs)
}

function isEnrichData(data: UploadUiStepData | undefined): data is EnrichTracksStepData {
  return Boolean(data && 'tracksToProcess' in data)
}

function isNormalizeData(
  data: UploadUiStepData | undefined
): data is NormalizeInteractionsStepData {
  return Boolean(data && 'keptCount' in data)
}

interface DeployStepProps {
  packageFile: File | null
  selectedFiles: Array<string>
  steps: Array<UploadUiStep> | null
  mutationError: string | null
  canViewStats: boolean
  onContinue: () => void
  onRetry: () => void
}

function StepStatusIcon({ status }: { status: UploadUiStepStatus }) {
  if (status === 'done') {
    return <HugeiconsIcon icon={Tick02Icon} className="size-4 text-primary" />
  }

  if (status === 'running') {
    return <HugeiconsIcon icon={Loading03Icon} className="size-4 text-primary animate-spin" />
  }

  if (status === 'error') {
    return <HugeiconsIcon icon={Cancel01Icon} className="size-4  text-destructive" />
  }

  return (
    <div className="grid place-items-center size-4">
      <div className="size-1.5 rounded-full bg-muted-foreground/35" />
    </div>
  )
}

export function DeployStep({
  packageFile,
  selectedFiles,
  steps,
  mutationError,
  canViewStats,
  onContinue,
  onRetry,
}: DeployStepProps) {
  const [nowTs, setNowTs] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => {
      setNowTs(Date.now())
    }, 100)
    return () => window.clearInterval(t)
  }, [])

  const orderedSteps = STEP_ORDER.map((key): UploadUiStep => {
    const step = steps?.find((s) => s.key === key)
    return {
      key,
      label: step?.label ?? STEP_LABEL[key],
      status: step?.status ?? 'pending',
      startAt: step?.startAt,
      endAt: step?.endAt,
      error: step?.error,
      data: step?.data,
    }
  })

  const persistStep = orderedSteps.find((s) => s.key === 'persist_interactions')
  const enrichStep = steps?.find((s) => s.key === 'enrich_tracks')
  const normalizeStep = steps?.find((s) => s.key === 'normalize_interactions')

  const canRetry =
    persistStep?.status === 'error' && Boolean(packageFile) && selectedFiles.length > 0
  const errorMessage = persistStep?.error ?? mutationError

  const enrichData = enrichStep?.data
  const normalizeData = normalizeStep?.data
  const totalElapsedMs = orderedSteps.reduce((acc, step) => {
    const startMs = getIsoMs(step.startAt)
    if (startMs === null) return acc
    const endMs = getIsoMs(step.endAt) ?? nowTs
    if (endMs === null) return acc
    const diff = endMs - startMs
    if (!Number.isFinite(diff) || diff < 0) return acc
    return acc + diff
  }, 0)

  const hasAnyStarted = orderedSteps.some((s) => getIsoMs(s.startAt) !== null)
  const headerElapsed = hasAnyStarted ? formatDurationMs(totalElapsedMs) : null

  const enrich = isEnrichData(enrichData) ? enrichData : null
  const normalize = isNormalizeData(normalizeData) ? normalizeData : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy package</CardTitle>
        <CardDescription className="truncate">
          {packageFile?.name ?? 'No package selected'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        <div className="rounded-lg grid grid-cols-3 border divide-x">
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Files included</span>
            <span className="text-sm font-medium text-foreground">
              {selectedFiles.length} JSON file{selectedFiles.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Time</span>
            <TextMorph duration={25} className="text-sm font-medium text-foreground">
              {headerElapsed ?? '—'}
            </TextMorph>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-primary">
              {persistStep?.status === 'done'
                ? 'Completed'
                : persistStep?.status === 'error'
                  ? 'Failed'
                  : 'In progress'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-px rounded-lg border divide-y divide-border/50 overflow-hidden">
          {orderedSteps.map((step) => (
            <div
              key={step.key}
              className={cn(
                'flex items-center gap-2 px-3 py-2',
                step.status === 'done' && 'bg-muted/10',
                step.status === 'running' && 'bg-primary/5',
                step.status === 'pending' && 'opacity-50'
              )}
            >
              <StepStatusIcon status={step.status} />
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <p
                  className={cn(
                    'text-sm transition-colors',
                    step.status === 'done'
                      ? 'text-foreground/70'
                      : step.status === 'running'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>

                {step.key === 'enrich_tracks' && enrich ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1.5">
                        <TextMorph duration={200} className="text-xs text-muted-foreground">
                          {enrich.tracksProcessed + enrich.tracksSkipped} / {enrich.tracksToProcess}
                        </TextMorph>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Processed: {enrich.tracksProcessed} • Skipped: {enrich.tracksSkipped}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                {step.key === 'normalize_interactions' && normalize ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1.5">
                        <HugeiconsIcon icon={Tick02Icon} className="size-3 text-primary" />
                        <TextMorph duration={200} className="text-xs text-muted-foreground">
                          {normalize.keptCount}
                        </TextMorph>
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3 text-destructive" />
                        <TextMorph duration={200} className="text-xs text-muted-foreground">
                          {normalize.rejectedCount}
                        </TextMorph>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Kept: {normalize.keptCount} • Rejected: {normalize.rejectedCount}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : null}

                {step.status === 'error' && step.error ? (
                  <p className="text-xs text-destructive">{step.error}</p>
                ) : null}
              </div>

              {step.startAt && step.endAt ? (
                <Tooltip>
                  <TooltipTrigger>
                    <TextMorph
                      duration={25}
                      className="text-xs text-muted-foreground font-mono shrink-0"
                    >
                      {formatDurationSeconds(step.startAt, step.endAt)}
                    </TextMorph>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>
                        Start{' '}
                        {new Date(step.startAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                      <p>
                        End{' '}
                        {new Date(step.endAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : step.startAt && !step.endAt ? (
                <Tooltip>
                  <TooltipTrigger>
                    <TextMorph
                      duration={25}
                      className="text-xs text-muted-foreground font-mono shrink-0"
                    >
                      {formatElapsedSince(step.startAt, nowTs)}
                    </TextMorph>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Start{' '}
                      {new Date(step.startAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm" disabled={!canRetry} onClick={onRetry}>
          Retry deploy
        </Button>

        <Button size="sm" disabled={!canViewStats} onClick={onContinue} className="shrink-0">
          Continue  
        </Button>
      </CardFooter>
    </Card>
  )
}
