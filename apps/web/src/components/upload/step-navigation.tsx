import { Button } from '@harmony/ui/components/button'
import { cn } from '@harmony/ui/lib/utils'
import { STEP_CONFIG, type WizardStep } from './types'

interface StepNavigationProps {
  currentStep: WizardStep
  minNavigableStep?: WizardStep
  onStepClick: (step: WizardStep) => void
}

export function StepNavigation({
  currentStep,
  minNavigableStep = 0,
  onStepClick,
}: StepNavigationProps) {
  return (
    <div className="absolute left-full translate-x-10 top-0 hidden lg:flex flex-col">
      {STEP_CONFIG.map((step, i) => {
        const stepIndex = i as WizardStep
        const isFuture = stepIndex > currentStep
        const isBeforeMin = stepIndex < minNavigableStep
        const isDisabled = isFuture || isBeforeMin

        return (
          <Button
            key={i}
            type="button"
            disabled={isDisabled}
            onClick={() => !isDisabled && onStepClick(stepIndex)}
            variant="ghost"
            className={cn('w-full justify-start', isDisabled && 'text-muted-foreground/40')}
          >
            <div
              className={cn(
                'size-2 rounded-full m-1',
                isFuture && 'border border-muted-foreground/30',
                isBeforeMin && 'bg-foreground/60',
                !isDisabled && 'bg-foreground',
              )}
            />
            {step.label}
          </Button>
        )
      })}
    </div>
  )
}
