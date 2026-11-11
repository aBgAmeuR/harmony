import { parseTrack } from "@/features/track-panel";
import { parseView, type ViewState } from "@/widgets/base/view";

export type ExplorerSearch = ViewState & { track?: number };

export const parseExplorerSearch = (raw: Record<string, unknown>): ExplorerSearch => ({
  ...parseView(raw),
  track: parseTrack(raw.track),
});
