import { Button } from "@harmony/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { Link } from "@tanstack/react-router";

import { useUpload } from "../context";

export function UploadStatsStep() {
  const {
    state: { publicId },
    actions: { back },
  } = useUpload();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Package stats ready</CardTitle>
        <CardDescription>
          Your package has been uploaded. You can now view usage and file insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-center gap-3 py-1">
          <span className="h-px max-w-16 flex-1 bg-border" aria-hidden />
          <p className="shrink-0 text-center text-xs text-muted-foreground">
            Full breakdown in dashboard
          </p>
          <span className="h-px max-w-16 flex-1 bg-border" aria-hidden />
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={back}>
          Back
        </Button>
        <Button render={<Link to="/app/$packageId" params={{ packageId: publicId }} />}>
          View dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
