import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_MOTION);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const getServerReducedMotion = () => false;

type UseStaggerRevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

export const useStaggerReveal = <T extends HTMLElement = HTMLElement>({
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
}: UseStaggerRevealOptions = {}) => {
  const ref = useRef<T>(null);
  const [isShown, setIsShown] = useState(false);
  // Reduced motion shows everything at once, with no reveal to wait for.
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsShown(true);
        observer.disconnect();
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, prefersReducedMotion]);

  return { ref, isShown: isShown || prefersReducedMotion };
};
