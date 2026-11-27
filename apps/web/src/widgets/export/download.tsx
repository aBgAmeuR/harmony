import { Download04Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { useMutation } from "@tanstack/react-query";

import { exportCsvFn, type ColumnId, type ExportQuery } from "@/data/export";
import { isoDay } from "@/shared/lib/date";

const save = (csv: string, name: string) => {
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url));
};

type DownloadProps = {
  query: ExportQuery;
  columns: readonly ColumnId[];
};

export const Download = ({ query, columns }: DownloadProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => exportCsvFn(query, columns),
    onSuccess: (csv) => {
      const range = [query.from, query.to].flatMap((date) => (date ? [isoDay(date)] : []));
      save(csv, ["harmony-plays", ...range].join("-") + ".csv");
    },
  });

  return (
    <Button disabled={isPending} onClick={() => mutate()}>
      <Icon icon={Download04Icon} />
      {isPending ? "Exporting…" : "Export CSV"}
    </Button>
  );
};
