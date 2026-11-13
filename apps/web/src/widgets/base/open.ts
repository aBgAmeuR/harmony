import type { ListRow, Opens } from "@/data/bases";

import { UNKNOWN_ALBUM } from "@/data/aggregate";
import { useDetail } from "@/features/detail-panel";

export const useOpen = () => {
  const { open } = useDetail();

  return (opens: Opens, row: Pick<ListRow, "id" | "track">) => {
    if (opens === "genre") {
      void open({ kind: opens, id: String(row.id) });
      return;
    }
    const id = Number(row.track ?? row.id);
    if (id !== UNKNOWN_ALBUM) void open({ kind: opens, id });
  };
};
