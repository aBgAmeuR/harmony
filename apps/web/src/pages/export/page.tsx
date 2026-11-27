import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { format } from "@/shared/lib/format";
import { useScope } from "@/shared/scope";
import { exportQueries } from "@/widgets/export/api";
import { Columns } from "@/widgets/export/columns";
import { Download } from "@/widgets/export/download";
import { Filters } from "@/widgets/export/filters";
import { Grid } from "@/widgets/export/grid";
import { resolveExport, type ExportState } from "@/widgets/export/state";
import { Page } from "@/widgets/page/page";

const FROM = "/app/$packageId/export";

export const ExportPage = () => {
  const search = useSearch({ from: FROM });
  const navigate = useNavigate({ from: FROM });
  const { from, to } = useScope();
  const view = resolveExport(search);
  const query = { from, to, rules: view.rules, sort: view.sort, desc: view.desc };
  const { data: shown } = useQuery(exportQueries.count({ from, to, rules: view.rules }));
  const { data: total } = useQuery(exportQueries.count({ from, to, rules: [] }));

  const change = (patch: ExportState) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <Page title="Export" fill>
      <div className="flex flex-wrap items-center gap-1 border-t border-border px-3 py-2">
        <Filters
          rules={view.rules}
          onRules={(rules) => change({ rules: rules.length > 0 ? rules : undefined })}
        />
        <span className="ml-auto px-2 text-xs text-muted-foreground tabular-nums">
          {shown === undefined || total === undefined
            ? null
            : `${format.count(shown)} of ${format.count(total)} rows`}
        </span>
        <Columns columns={view.columns} onHidden={(hidden) => change({ hidden })} />
        <Download query={query} columns={view.columns} />
      </div>
      <Grid
        query={query}
        columns={view.columns}
        onSort={(sort) =>
          change({ sort, desc: sort === view.sort ? !view.desc : sort === "played_at" })
        }
      />
    </Page>
  );
};
