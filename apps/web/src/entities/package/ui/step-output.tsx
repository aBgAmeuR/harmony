import type { StepId, StepOutput as Output } from "@harmony/upload";

import { Cancel01Icon, Icon, Tick02Icon } from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

const STEP_COUNTS: Record<StepId, { read: string; keep: string; drop: string }> = {
  extract_archive: { read: "scanned", keep: "files", drop: "skipped" },
  parse_interactions: { read: "files", keep: "plays", drop: "dropped" },
  normalize_interactions: { read: "plays", keep: "kept", drop: "rejected" },
  resolve_tracks: { read: "plays", keep: "matched", drop: "missed" },
  enrich_tracks: { read: "tracks", keep: "kept", drop: "dropped" },
  enrich_albums: { read: "albums", keep: "kept", drop: "dropped" },
  persist_interactions: { read: "listens", keep: "saved", drop: "dropped" },
};

// What a pipeline step kept and dropped, with the full counts in a tooltip.
export const StepOutput = ({ output, stepId }: { output?: Output; stepId: StepId }) => {
  if (!output) {
    return null;
  }

  const copy = STEP_COUNTS[stepId];

  return (
    <Tooltip>
      <TooltipTrigger render={<Badge variant="secondary" className="me-1.5 shrink-0" />}>
        <span className="flex items-center gap-0.5">
          <Icon icon={Tick02Icon} className="size-3 text-primary" />
          {output.keep.toLocaleString()}
        </span>
        {output.drop > 0 ? (
          <span className="flex items-center gap-0.5">
            <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
            {output.drop.toLocaleString()}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-start gap-0.5">
        <p>
          {output.read.toLocaleString()} {copy.read}
        </p>
        <p>
          {output.keep.toLocaleString()} {copy.keep}
        </p>
        {output.drop > 0 ? (
          <p>
            {output.drop.toLocaleString()} {copy.drop}
          </p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};
