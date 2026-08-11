import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

import { useUpload } from "./context";
import { STEP_CONFIG, STEP_ORDER, stepIndex, type Step } from "./types";

export function UploadNav() {
  const {
    state: { step, locked },
    actions: { goTo },
  } = useUpload();

  const current = stepIndex(step);
  const minNavigable = locked ? stepIndex("deploy") : stepIndex("package");

  return (
    <div className="relative">
      <div className="absolute top-0 left-full hidden translate-x-10 flex-col lg:flex">
        {STEP_ORDER.map((id) => {
          const index = stepIndex(id);
          const isFuture = index > current;
          const isBeforeMin = index < minNavigable;
          const isDisabled = isFuture || isBeforeMin;

          return (
            <Button
              key={id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) goTo(id as Step);
              }}
              variant="ghost"
              className={cn("w-full justify-start", isDisabled && "text-muted-foreground/40")}
            >
              <div
                className={cn(
                  "m-1 size-2 rounded-full",
                  isFuture && "border border-muted-foreground/30",
                  isBeforeMin && "bg-foreground/60",
                  !isDisabled && "bg-foreground",
                )}
              />
              {STEP_CONFIG[id].label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
