import { useEffect, useRef, useState } from "react";

type UseStaggerRevealOptions = {
  /** Reveal on mount (above-the-fold) instead of waiting for scroll. */
  immediate?: boolean;
  threshold?: number;
  rootMargin?: string;
};

export function useStaggerReveal<T extends HTMLElement = HTMLElement>({
  immediate = false,
  threshold = 0.18,
  rootMargin = "0px 0px -8% 0px",
}: UseStaggerRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsShown(true);
      return;
    }

    if (immediate) {
      // Double rAF so the browser paints the pre-reveal state first.
      let innerId = 0;
      const outerId = requestAnimationFrame(() => {
        innerId = requestAnimationFrame(() => setIsShown(true));
      });
      return () => {
        cancelAnimationFrame(outerId);
        cancelAnimationFrame(innerId);
      };
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
  }, [immediate, threshold, rootMargin]);

  return { ref, isShown };
}
