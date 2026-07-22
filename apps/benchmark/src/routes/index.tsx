import { db } from "@harmony/duckdb";
import { GithubIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

import { BenchmarkPanel } from "@/components/benchmark-panel";
import { Error } from "@/components/error";
import { Icons } from "@/components/icons";
import { Pending } from "@/components/pending";
import { BENCHMARK_PACKAGE_ID } from "@/lib/benchmark-query";

export const Route = createFileRoute("/")({
  ssr: false,
  loader: () => db.init(BENCHMARK_PACKAGE_ID, import.meta.env.VITE_API_URL),
  staleTime: Infinity,
  component: HomeComponent,
  pendingComponent: Pending,
  errorComponent: Error,
});

function HomeComponent() {
  return (
    <div className="flex min-h-svh flex-col bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Icons.logo className="size-7!" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
                Harmony
              </span>
            </div>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={
                <a href="https://github.com/aBgAmeuR/Harmony" target="_blank" rel="noreferrer" />
              }
            >
              <Icon icon={GithubIcon} />
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a href="https://harmony.antoinejosset.fr" target="_blank" rel="noreferrer" />
              }
            >
              Current version
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 items-center">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-3">
          <BenchmarkPanel />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-1 px-3 py-2 text-xs text-muted-foreground">
          <p>
            Built by{" "}
            <Button
              variant="link"
              size="xs"
              className="p-0"
              nativeButton={false}
              render={<a href="https://github.com/aBgAmeuR" target="_blank" rel="noreferrer" />}
            >
              @aBgAmeuR
            </Button>
          </p>
          <p>v3.0-beta</p>
        </div>
      </footer>
    </div>
  );
}
