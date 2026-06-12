import {
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@harmony/ui/components/collapsible'
import { Button } from '@harmony/ui/components/button'
import { PipelineItem, PipelineItemContent, PipelineItemDuration, PipelineItemHeader, PipelineItemIcon, PipelineItemLabel } from './ui/pipeline';
import { format } from '@/utils/format'

const STEP_MOCK = [
  {
    key: 'extract_archive',
    label: 'Extract archive',
    status: 'done',
    startAt: '2026-06-10T12:00:00.000Z',
    endAt: '2026-06-10T12:00:00.039Z', // 39 ms
    data: {
      file: {
        name: 'data.zip',
        size: 100000,
      },
    },
  },
  {
    key: 'parse_interactions',
    label: 'Parse interactions',
    status: 'done',
    startAt: '2026-06-10T12:00:00.039Z',
    endAt: '2026-06-10T12:00:00.039Z', // 0 ms
    data: {
      count: 100,
    },
  },
  {
    key: 'normalize_interactions',
    label: 'Normalize interactions',
    status: 'error',
    startAt: '2026-06-10T12:00:00.055Z',
    endAt: '2026-06-10T12:00:00.071Z', // 16 ms
    data: {
      keptCount: 90,
      rejectedCount: 10,
      period: {
        startAt: '2023-02-11',
        endAt: '2026-06-10',
      },
    },
  },
  {
    key: 'resolve_tracks',
    label: 'Resolve tracks',
    status: 'done',
    startAt: '2026-06-10T12:00:00.071Z',
    endAt: '2026-06-10T12:00:00.549Z', // 478 ms
  },
  {
    key: 'enrich_tracks',
    label: 'Enrich tracks',
    status: 'done',
    startAt: '2026-06-10T12:00:00.549Z',
    endAt: '2026-06-10T12:00:27.359Z', // 26.81 s
    data: {
      count: 100,
      skippedCount: 10,
      tracksNotFound: ['track1', 'track2', 'track3'],
    },
  },
  {
    key: 'persist_interactions',
    label: 'Save interactions',
    status: 'loading',
    startAt: '2026-06-10T12:00:27.391Z',
    // endAt: '2026-06-10T12:00:27.423Z',
    endAt: undefined,
    data: {
      count: 100,
    },
  },
] as const

export function Pipeline() {
  return (
    <div className="space-y-3 py-3 rounded-lg bg-card">
      {STEP_MOCK.map((item) => (
        <PipelineItem key={item.key}>
          <PipelineItemHeader>
            <PipelineItemIcon status={item.status} />
            <PipelineItemLabel label={item.label} />
            <PipelineItemDuration startAt={item.startAt} endAt={item.endAt} />
          </PipelineItemHeader>
          <PipelineItemContent>
            <PipelineItemContentContent item={item} />
          </PipelineItemContent>
        </PipelineItem>
      ))}
    </div>
  )
}

function PipelineItemContentContent({ item }: { item: (typeof STEP_MOCK)[number] }) {
  switch (item.key) {
    case 'extract_archive':
      return <span>{item.data.file.name} • {format.bytes(item.data.file.size)}</span>
    case 'parse_interactions':
      return <span>{item.data.count.toLocaleString()} parsed</span>
    case 'normalize_interactions':
      return <span>{item.data.keptCount.toLocaleString()} kept • {item.data.rejectedCount.toLocaleString()} rejected</span>
    case 'resolve_tracks':
      return null
    case 'enrich_tracks':
      return (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group p-0 h-auto hover:bg-transparent! text-xs"
            >
              {item.data.count.toLocaleString()} resolved •{' '}
              {item.data.skippedCount.toLocaleString()} skipped
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <span>{item.data.tracksNotFound.join(', ')}</span>
          </CollapsibleContent>
        </Collapsible>
      )
    case 'persist_interactions':
      return <span>{item.data.count.toLocaleString()} saved</span>
    default:
      return null
  }
}
