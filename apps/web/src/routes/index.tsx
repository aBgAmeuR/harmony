import { createFileRoute } from "@tanstack/react-router";

import { LandingPage } from "@/pages/landing/page";

export const Route = createFileRoute("/")({
  ssr: true,
  component: LandingPage,
});
