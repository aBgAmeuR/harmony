import { CARD_TOP_PX } from "./types";

interface DecorativeFrameProps {
  cardHeight: number;
}

export function DecorativeFrame({ cardHeight }: DecorativeFrameProps) {
  const bottomY = CARD_TOP_PX + cardHeight;

  return (
    <>
      {/* Vertical dashed lines */}
      <div className="pointer-events-none fixed inset-y-0 left-1/2 w-full max-w-152 -translate-x-1/2">
        <div className="absolute -left-1.5 h-full w-[calc(100%+12px)] border-x border-y-0 border-dashed border-border/50" />
      </div>

      {/* Horizontal dashed lines */}
      <div
        className="pointer-events-none fixed inset-x-0 border-x-0 border-y border-dashed border-border/50 transition-[height] duration-450 ease-out"
        style={{ top: CARD_TOP_PX - 40, height: cardHeight + 80 }}
      />

      {/* Top corner markers */}
      <div
        className="pointer-events-none fixed left-1/2 z-10 w-full max-w-152 -translate-x-1/2"
        style={{ top: CARD_TOP_PX - 40 - 3 }}
      >
        <div className="absolute -left-2.25 size-1.75 rounded-xs bg-background ring-1 ring-border/80" />
        <div className="absolute -right-2.25 size-1.75 rotate-90 rounded-xs bg-background ring-1 ring-border/80" />
      </div>

      {/* Bottom corner markers */}
      <div
        className="pointer-events-none fixed left-1/2 z-10 w-full max-w-152 -translate-x-1/2 transition-[top] duration-450 ease-out"
        style={{ top: bottomY + 40 - 3 }}
      >
        <div className="absolute -left-2.25 size-1.75 -rotate-90 rounded-xs bg-background ring-1 ring-border/80" />
        <div className="absolute -right-2.25 size-1.75 rotate-180 rounded-xs bg-background ring-1 ring-border/80" />
      </div>
    </>
  );
}
