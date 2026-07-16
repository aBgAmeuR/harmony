import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

import { WizardStep } from "@/components/upload/types";

type UploadStepProps = {
  index: WizardStep;
  currentStep: WizardStep;
  minNavigableStep: WizardStep;
  onStepClick: (stepIndex: WizardStep) => void;
  label: string;
};

export const UploadStep = ({
  index,
  currentStep,
  minNavigableStep,
  onStepClick,
  label,
}: UploadStepProps) => {
  const stepIndex = index;
  const isFuture = stepIndex > currentStep;
  const isBeforeMin = stepIndex < minNavigableStep;
  const isDisabled = isFuture || isBeforeMin;

  return (
    <Button
      type="button"
      disabled={isDisabled}
      onClick={() => onStepClick(stepIndex)}
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
      {label}
    </Button>
  );
};
