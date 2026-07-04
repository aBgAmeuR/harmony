import { createFileRoute } from "@tanstack/react-router";
import {
  Icon,
  Alert02FreeIcons,
  Calendar02Icon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  Tick02Icon,
} from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@harmony/ui/components/alert-dialog";
import { Pipeline } from "@/features/packages/components/pipeline";
import { query } from "@/lib/query";
import { format } from "@/utils/format";
import { PipelineStep } from "@harmony/upload";
import { queryOptions, useQuery } from "@tanstack/react-query";

const getPackage = async (packageId: string) => {
  const pkg = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/packages/${packageId}`,
  );
  return (await pkg.json()) as {
    public_id: string;
    file_name: string;
    file_size: number;
    status: string;
    started_at: string;
    updated_at: string;
    created_at: string;
    data: {
      endedAt: string;
      startedAt: string;
      totalDurationMs: number;
      steps: PipelineStep[];
    };
  };
};

const packageQuery = (packageId: string) =>
  queryOptions({
    queryKey: ["package", packageId],
    queryFn: () => getPackage(packageId),
  });

const periodQuery = query.packages.period.queryOptions();

export const Route = createFileRoute("/app/$packageId/package")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise, params }) => {
    await parentMatchPromise;
    await Promise.all([
      queryClient.ensureQueryData(packageQuery(params.packageId)),
      queryClient.ensureQueryData(periodQuery),
    ]);
  },
  component: RouteComponent,
});

type PackageHeaderProps = {
  pkg: { fileName: string; status: string; id: string };
  subtitle: string;
};

function PackageHeaderSection({ pkg, subtitle }: PackageHeaderProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pkg.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <section className="space-y-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="truncate">{pkg.fileName}</CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
          <CardAction className="flex flex-wrap items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>
                <Icon icon={Delete02Icon} />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
        <CardFooter className="space-x-1 text-xs text-muted-foreground py-1!">
          <span className="font-mono text-foreground/80">{pkg.id}</span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="disabled:opacity-100"
                  onClick={handleCopy}
                  aria-label={copied ? "Copied" : "Copy to clipboard"}
                  disabled={copied}
                />
              }
            >
              <div
                className={cn(
                  "transition-all",
                  copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                )}
              >
                <Icon icon={Tick02Icon} className="size-4 text-emerald-500" />
              </div>
              <div
                className={cn(
                  "absolute transition-all",
                  copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                )}
              >
                <Icon icon={Copy01Icon} className="size-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs">
              Click to copy
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </section>
  );
}

function RouteComponent() {
  const { packageId } = Route.useParams();
  const { data } = useQuery(packageQuery(packageId));
  const { data: period } = useQuery(periodQuery);

  if (!data) return null;

  const missedTracks = data.data.steps.find(
    (step) => step.id === "resolve_tracks",
  )?.output?.missed as number | undefined;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-3 pt-12">
      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">
          Overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <Icon
                  icon={Clock01Icon}
                  className="size-4 text-muted-foreground"
                />
              </CardAction>
              <CardTitle className="text-muted-foreground">
                Total duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {format.duration(data.data.totalDurationMs)}
              </p>
              <p className="text-xs text-muted-foreground">
                Started at {format.date(data.started_at)}
              </p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <Icon
                  icon={Calendar02Icon}
                  className="size-4 text-muted-foreground"
                />
              </CardAction>
              <CardTitle className="text-muted-foreground">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {period ? `${period.days.toLocaleString()} days` : "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {period
                  ? `From ${format.date(period.startDate)} to ${format.date(period.endDate)}`
                  : "No listening history"}
              </p>
            </CardContent>
          </Card>
          <Card size="sm" className="gap-0!">
            <CardHeader>
              <CardAction>
                <Icon
                  icon={Alert02FreeIcons}
                  className="size-4 text-muted-foreground"
                />
              </CardAction>
              <CardTitle className="text-muted-foreground">
                Missed tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {missedTracks?.toLocaleString() ?? "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                During track resolution
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="mb-3 text-xs font-semibold text-muted-foreground">
          Pipeline
        </h2>
        <Pipeline steps={data.data.steps} />
      </section>

      {/* {details?.failure ? (
        <section className="space-y-2">
          <h2 className="mb-3 text-xs font-semibold text-destructive">Failure</h2>
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {details.failure.message}
          </div>
        </section>
      ) : null} */}

      <PackageHeaderSection
        pkg={{
          fileName: data.file_name,
          status: data.status,
          id: data.public_id,
        }}
        subtitle={`${format.date(data.created_at)} • ${format.bytes(data.file_size)}`}
      />
    </div>
  );
}
