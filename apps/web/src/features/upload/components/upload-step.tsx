import { WizardStep } from "@/components/upload/types";
import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

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
      className={cn(
        "w-full justify-start",
        isDisabled && "text-muted-foreground/40",
      )}
    >
      <div
        className={cn(
          "size-2 rounded-full m-1",
          isFuture && "border border-muted-foreground/30",
          isBeforeMin && "bg-foreground/60",
          !isDisabled && "bg-foreground",
        )}
      />
      {label}
    </Button>
  );
};
