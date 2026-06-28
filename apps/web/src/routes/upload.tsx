import { Icons } from "@/components/icons";
import { UploadStep } from "@/features/upload/components/upload-step";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* <DecorativeFrame cardHeight={containerHeight} /> */}

      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-full max-w-152">
        <p className="absolute right-[calc(100%+3rem)] top-[180px] pt-2 hidden lg:block text-sm font-medium text-foreground/70 whitespace-nowrap text-right">
          Upload Package
        </p>
      </div>

      <div className="mx-auto w-full max-w-152 px-6 pt-[180px] pb-24">
        <div className="absolute left-full translate-x-10 top-0 hidden lg:flex flex-col">
          <UploadStep index={0} currentStep={0} minNavigableStep={0} onStepClick={() => {}} label="Choose Package" />
          <UploadStep index={1} currentStep={0} minNavigableStep={0} onStepClick={() => {}} label="Select Files" />
          <UploadStep index={2} currentStep={0} minNavigableStep={0} onStepClick={() => {}} label="Deploy" />
          <UploadStep index={3} currentStep={0} minNavigableStep={0} onStepClick={() => {}} label="Package Stats" />
        </div>

        <div className="relative w-full">
          {/* {cardSlots.map((slot, i) => {
            const isParked = i === currentStep - 1;
            const isHidden = i < currentStep - 1 || i > currentStep;
            const canClickParked = isParked && currentStep > minNavigableStep;

            return (
              <div
                key={i}
                ref={cardRefs[i]}
                onClick={canClickParked ? goBack : undefined}
                style={{
                  transform: cardTransform(i, currentStep, cardHeights),
                  opacity: cardOpacity(i, currentStep),
                  zIndex: cardZIndex(i, currentStep),
                }}
                className={cn(
                  "absolute inset-x-0 top-0",
                  "transition-[transform,opacity] duration-450 ease-in-out",
                  canClickParked &&
                    "cursor-pointer [&_button]:pointer-events-none [&_a]:pointer-events-none",
                  isHidden && "pointer-events-none",
                )}
              >
                {slot}
              </div>
            );
          })} */}
        </div>
      </div>

      <Link
        to="/"
        className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2"
      >
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate scroll-m-20 text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </Link>
    </div>
  );
}
