import { UploadWizard } from "@/components/upload/upload-wizard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UploadWizard />;
}
