import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/pages/landing/page";
import { preloadLandingPages } from "@/pages/landing/preload";

export const Route = createFileRoute("/")({
  ssr: true,
  loader: preloadLandingPages,
  component: LandingPage,
});
