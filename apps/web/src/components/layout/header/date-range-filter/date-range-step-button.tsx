import { Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";

type DateRangeStepButtonProps = {
  direction: -1 | 1;
  disabled: boolean;
  onStep: (direction: -1 | 1) => void;
};

export function DateRangeStepButton({ direction, disabled, onStep }: DateRangeStepButtonProps) {
  return (
    <Button size="icon" variant="secondary" disabled={disabled} onClick={() => onStep(direction)}>
      <Icon icon={direction === -1 ? ArrowLeft01Icon : ArrowRight01Icon} />
    </Button>
  );
}
