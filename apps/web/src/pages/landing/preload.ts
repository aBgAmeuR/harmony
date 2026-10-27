import type { ComponentType } from "react";

export const loadPages = () =>
  import("./ui/landing-pages").then((m) => ({ default: m.LandingPages }));

// Set on the server by the route loader, so the prerender renders the demo widgets in place
// instead of streaming them after the rest of the page.
export const serverPages: { current?: ComponentType } = {};

export const preloadLandingPages = async () => {
  if (typeof window !== "undefined") return;
  serverPages.current = (await loadPages()).default;
};
