import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/upload"!</div>;
}
