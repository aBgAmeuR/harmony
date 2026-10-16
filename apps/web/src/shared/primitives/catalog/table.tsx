import { Icon, Loading03Icon, ViewIcon, ViewOffSlashIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card, CardContent } from "@harmony/ui/components/card";
import { cn } from "@harmony/ui/lib/utils";
import { useState } from "react";

import { Stat } from "../stat";
import { Trend, type TrendPoint } from "../trend";
import { Catalog } from "./catalog";

export type CatalogItem = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  streams: number;
  playtime: number;
};

type CatalogTableProps = {
  catalog: Array<CatalogItem> | undefined;
  empty?: string;
  loading?: boolean;
  selectedId?: number;
  onSelectItem?: (item: CatalogItem) => void;
  stickyHeader?: boolean;
  trends?: Record<number, TrendPoint[]>;
};

export const CatalogTable = ({
  catalog,
  empty = "No items yet.",
  loading = false,
  selectedId,
  onSelectItem,
  stickyHeader = false,
  trends,
}: CatalogTableProps) => {
  const [showTrends, setShowTrends] = useState(true);
  const hasTrends = trends !== undefined;
  const cols = hasTrends ? 5 : 4;

  if (!loading && (!catalog || catalog.length <= 0)) {
    return (
      <Card size="sm">
        <CardContent className="text-sm text-muted-foreground">{empty}</CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(stickyHeader && "[&_[data-slot=table-container]]:overflow-visible")}>
      <Catalog>
        <Catalog.Head className={cn(stickyHeader ? "bg-background!" : "bg-muted/50")}>
          <Catalog.Row className={cn("bg-background!", stickyHeader && "sticky top-0 z-10")}>
            <Catalog.Col className="w-[35.5px] pl-4 text-center">#</Catalog.Col>
            <Catalog.Col className="text-left">Title</Catalog.Col>
            {hasTrends && (
              <Catalog.Col className="w-32">
                <div className="flex items-center">
                  <span>Trend</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowTrends((current) => !current)}
                  >
                    <Icon icon={showTrends ? ViewIcon : ViewOffSlashIcon} />
                  </Button>
                </div>
              </Catalog.Col>
            )}
            <Catalog.Col className="w-16 text-right tabular-nums">Streams</Catalog.Col>
            <Catalog.Col className="w-28 pr-4 text-right tabular-nums">Time Listened</Catalog.Col>
          </Catalog.Row>
        </Catalog.Head>
        <Catalog.Body>
          {loading ? (
            <Catalog.Row>
              <Catalog.Cell
                colSpan={cols}
                className="h-32 text-center align-middle text-sm text-muted-foreground"
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon icon={Loading03Icon} className="size-4 animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              </Catalog.Cell>
            </Catalog.Row>
          ) : (
            catalog?.map((item, index) => {
              const trend = trends?.[item.id];

              return (
                <Catalog.Row
                  key={item.id}
                  selected={selectedId === item.id}
                  onClick={onSelectItem ? () => onSelectItem(item) : undefined}
                >
                  <Catalog.Pos n={index + 1} />
                  <Catalog.Item
                    name={item.name}
                    image={item.image}
                    description={item.description}
                  />
                  {hasTrends && (
                    <Catalog.Cell>
                      {showTrends && trend && trend.length > 0 ? <Trend data={trend} /> : null}
                    </Catalog.Cell>
                  )}
                  <Catalog.Cell className="text-right">
                    <Stat value={item.streams} />
                  </Catalog.Cell>
                  <Catalog.Cell className="pr-4">
                    <Stat value={item.playtime} unit="min" />
                  </Catalog.Cell>
                </Catalog.Row>
              );
            })
          )}
        </Catalog.Body>
      </Catalog>
    </div>
  );
};
