import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const getSnapshot = () => navigator.platform.toUpperCase().includes("MAC");
const getServerSnapshot = () => true;

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
