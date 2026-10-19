import { db } from "@harmony/duckdb";

import type { Range } from "@/data/overview/range";
import type { RankBy, RankSort } from "@/data/rank";
import type { Scope } from "@/shared/scope";

import { rankSources } from "@/data/rank";
import { escapeLike } from "@/data/sql/escape";

export type ExplorerRow = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  streams: number;
  playtime: number;
  rank: number;
  prevRank: number | null;
};

export type ExplorerList = {
  rows: ExplorerRow[];
  total: number;
};

export type ExplorerQuery = {
  by: RankBy;
  scope: Scope;
  sort: RankSort;
  search: string;
};

// Albums without an album id are grouped under this id, they have no page.
export const UNKNOWN_ID = -1;

const normalized = (by: RankBy, scope: Scope): string => `
  SELECT
    COALESCE(id::DOUBLE, ${UNKNOWN_ID}) AS id,
    COALESCE(name, 'Unknown album') AS name,
    description::VARCHAR AS description,
    image,
    streams,
    ROUND(playtime)::INTEGER AS playtime
  FROM (${rankSources[by](scope)})`;

const ranked = (by: RankBy, scope: Scope, sort: RankSort): string => `
  SELECT
    *,
    ROW_NUMBER() OVER (ORDER BY ${sort} DESC, name ASC, id ASC)::INTEGER AS rank
  FROM (${normalized(by, scope)})`;

const searchWhere = (search: string): string => {
  const term = search.trim();
  if (term === "") return "";
  const like = `'%${escapeLike(term)}%' ESCAPE '\\'`;
  return `WHERE (cur.name ILIKE ${like} OR cur.description ILIKE ${like})`;
};

type ListSqlArgs = ExplorerQuery & {
  // The period the ranks are compared with.
  previous: Range;
  limit: number;
};

export const listSql = ({ by, scope, sort, search, previous, limit }: ListSqlArgs): string => `
WITH cur AS (${ranked(by, scope, sort)}),
prev AS (${ranked(by, { ...scope, ...previous }, sort)})
SELECT
  cur.id,
  cur.name,
  cur.description,
  cur.image,
  cur.streams,
  cur.playtime,
  cur.rank,
  prev.rank AS prev_rank,
  (COUNT(*) OVER ())::INTEGER AS total
FROM cur
LEFT JOIN prev ON prev.id = cur.id
${searchWhere(search)}
ORDER BY cur.rank
LIMIT ${Math.trunc(limit)}`;

type ListRow = Omit<ExplorerRow, "prevRank"> & { prev_rank: number | null; total: number };

export const explorerListFn = async (args: ListSqlArgs): Promise<ExplorerList> => {
  const rows = await db.query<ListRow>(listSql(args));

  return {
    rows: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      image: row.image,
      streams: row.streams,
      playtime: row.playtime,
      rank: row.rank,
      prevRank: row.prev_rank,
    })),
    total: rows[0]?.total ?? 0,
  };
};
