import { cn } from "@harmony/ui/lib/utils";
import { Children, useEffect, useMemo, useState, type ReactNode } from "react";

import { useUpload } from "./context";
import { CARD_TOP_PX, stepIndex } from "./types";

const PEEK_BOTTOM_PX = 75;

function parkTransform(cardHeight: number): string {
  const ty = Math.round(PEEK_BOTTOM_PX - CARD_TOP_PX - cardHeight * 0.925);
  return `translateY(${ty}px) scale(0.85)`;
}

function cardTransform(i: number, current: number, heights: Record<number, number>): string {
  if (i < current - 1) return "translateY(-210%)";
  if (i === current - 1) return parkTransform(heights[i] ?? 360);
  if (i === current) return "translateY(0px)";
  return "translateY(210%)";
}

function cardOpacity(i: number, current: number): number {
  if (i < current - 1) return 0;
  if (i === current - 1) return 0.5;
  if (i === current) return 1;
  return 0;
}

function cardZIndex(i: number, current: number): number {
  return i === current ? 30 : 0;
}

type UploadStackProps = {
  children: ReactNode;
};

export function UploadStack({ children }: UploadStackProps) {
  const {
    state: { step, locked, cardHeight },
    actions: { back, setCardHeight },
  } = useUpload();

  const current = stepIndex(step);
  const minNavigable = locked ? stepIndex("deploy") : stepIndex("package");
  const slots = Children.toArray(children);
  const [heights, setHeights] = useState<Record<number, number>>({});

  const cardRefs = useMemo(
    () =>
      Array.from({ length: slots.length }, (_, idx) => {
        return (el: HTMLDivElement | null): (() => void) | void => {
          if (!el) return;
          const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;
            const h = Math.round(entry.contentRect.height);
            setHeights((prev) => (prev[idx] === h ? prev : { ...prev, [idx]: h }));
          });
          observer.observe(el);
          return () => observer.disconnect();
        };
      }),
    [slots.length],
  );

  useEffect(() => {
    const activeHeight = heights[current];
    if (activeHeight !== undefined) {
      setCardHeight(activeHeight);
    }
  }, [current, heights, setCardHeight]);

  return (
    <div className="relative">
      <div className="relative w-full" style={{ height: cardHeight }}>
        {slots.map((slot, i) => {
          const isParked = i === current - 1;
          const isHidden = i < current - 1 || i > current;
          const canClickParked = isParked && current > minNavigable;

          return (
            <div
              key={i}
              ref={cardRefs[i]}
              onClick={canClickParked ? back : undefined}
              style={{
                transform: cardTransform(i, current, heights),
                opacity: cardOpacity(i, current),
                zIndex: cardZIndex(i, current),
              }}
              className={cn(
                "absolute inset-x-0 top-0",
                "transition-[transform,opacity] duration-450 ease-out",
                canClickParked &&
                  "cursor-pointer [&_a]:pointer-events-none [&_button]:pointer-events-none",
                isHidden && "pointer-events-none",
              )}
            >
              {slot}
            </div>
          );
        })}
      </div>
    </div>
  );
}
