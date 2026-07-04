import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

import { STEP_CONFIG, type WizardStep } from "./types";

interface StepNavigationProps {
  currentStep: WizardStep;
  minNavigableStep?: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export function StepNavigation({
  currentStep,
  minNavigableStep = 0,
  onStepClick,
}: StepNavigationProps) {
  return (
    <div className="absolute top-0 left-full hidden translate-x-10 flex-col lg:flex">
      {STEP_CONFIG.map((step, i) => {
        const stepIndex = i as WizardStep;
        const isFuture = stepIndex > currentStep;
        const isBeforeMin = stepIndex < minNavigableStep;
        const isDisabled = isFuture || isBeforeMin;

        return (
          <Button
            key={i}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onStepClick(stepIndex)}
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
            {step.label}
          </Button>
        );
      })}
    </div>
  );
}
