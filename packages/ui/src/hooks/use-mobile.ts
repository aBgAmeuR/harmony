import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => false;

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
