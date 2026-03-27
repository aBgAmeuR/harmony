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
import { CatalogImage } from './catalog-image'
import type { Catalog } from './catalog'

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
  if (!loading && (!catalog || catalog.length <= 0)) {
    return (
      <Card size="sm">
        <CardContent className="text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    )
  }

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[35.5px] h-8 pl-3 text-xs text-center font-medium text-muted-foreground">
            #
          </TableHead>
          <TableHead className="h-8 text-xs font-medium text-muted-foreground">Title</TableHead>
          <TableHead className="h-8 w-28 text-right text-xs font-medium text-muted-foreground">
            Streams
          </TableHead>
          <TableHead className="h-8 w-28 pr-3 text-right text-xs font-medium text-muted-foreground">
            Listening
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
            <TableRow key={item.id}>
              <TableCell className="pl-3 text-xs text-center tabular-nums text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <CatalogImage image={item.image} alt={item.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-px">
                <span className="text-xs text-muted-foreground">x</span>
                <span className="text-sm font-medium">{item.streams.toLocaleString('en-US')}</span>
              </TableCell>
              <TableCell className="pr-3 text-right space-x-px">
                <span className="text-sm font-medium">
                  {item.playtime.toLocaleString('en-US', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </span>
                <span className="text-xs text-muted-foreground">min</span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
