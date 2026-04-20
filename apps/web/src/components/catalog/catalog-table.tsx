import { Card, CardContent } from '@harmony/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@harmony/ui/components/table'
import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { useNavigate } from '@tanstack/react-router'
import { FormattedMetric } from '../format/formatted-metric';
import { CatalogImage } from './catalog-image'
import type { Catalog } from './catalog'

const getRankClassName = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
    case 2:
      return 'bg-slate-400/20 text-slate-200 ring-1 ring-slate-300/35'
    case 3:
      return 'bg-orange-700/25 text-orange-200 ring-1 ring-orange-400/35'
    default:
      return 'text-muted-foreground'
  }
}

type CatalogTableProps = {
  catalog: Array<Catalog> | undefined
  empty?: string
  loading?: boolean
}

export const CatalogTable = ({
  catalog,
  empty = 'No items yet.',
  loading = false,
}: CatalogTableProps) => {
  const navigate = useNavigate()

  if (!loading && (!catalog || catalog.length <= 0)) {
    return (
      <Card size="sm">
        <CardContent className="text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    )
  }

  return (
    <Table className="pb-2">
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[35.5px] h-8 pl-4 text-xs text-center font-medium text-muted-foreground">
            #
          </TableHead>
          <TableHead className="h-8 text-xs font-medium text-muted-foreground">Title</TableHead>
          <TableHead className="h-8 w-16 text-right text-xs font-medium tabular-nums text-muted-foreground">
            Streams
          </TableHead>
          <TableHead className="h-8 w-28 pr-4 text-right text-xs font-medium tabular-nums text-muted-foreground">
            Time Listened
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-32 align-middle text-center text-sm text-muted-foreground"
            >
              <div className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
                <span className="text-sm font-medium">Loading...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          catalog?.map((item, index) => (
            <TableRow
              key={item.id}
              onClick={() => navigate({ to: '.', search: { details: item.id }, resetScroll: false })}
            >
              <TableCell className="pl-4 text-center tabular-nums">
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium ${getRankClassName(index + 1)}`}
                >
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="max-w-0">
                <div className="flex min-w-0 items-center gap-3">
                  <CatalogImage image={item.image} alt={item.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <FormattedMetric value={item.streams} className="justify-end" size="sm" />
              </TableCell>
              <TableCell className="pr-4">
                <FormattedMetric value={item.playtime} unit="min" className="justify-end" size="sm" />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
