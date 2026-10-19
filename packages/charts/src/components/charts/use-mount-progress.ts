"use client";

import { animate, type Transition, useMotionValue } from "motion/react";
import { useEffect, useEffectEvent } from "react";

import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation";

/** Drives 0→1 enter progress using the studio motion transition (spring or tween). */
export function useMountProgress(
  enterTransition: Transition | undefined,
  delaySeconds: number,
  replayKey: number | string,
) {
  const progress = useMotionValue(0);
  // Read the latest transition without replaying the enter when it changes.
  const getTransition = useEffectEvent(() => enterTransition ?? DEFAULT_CHART_ENTER_TRANSITION);

  // replayKey intentionally retriggers enter when motion settings change
  // biome-ignore lint/correctness/useExhaustiveDependencies: replayKey
  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, 1, {
      ...getTransition(),
      delay: delaySeconds,
    });
    return () => controls.stop();
  }, [delaySeconds, replayKey, progress]);

  return progress;
}
