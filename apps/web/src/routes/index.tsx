import { GithubIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Icons } from "@/components/icons";

export const Route = createFileRoute("/")({
  ssr: true,
  component: HomeComponent,
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
              render={
                <a href="https://github.com/aBgAmeuR/Harmony" target="_blank" rel="noreferrer" />
              }
            >
              <Icon icon={GithubIcon} />
            </Button>
            <Button
              size="sm"
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
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
                Harmony v3 is not ready yet.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                I'm rebuilding the experience. In the meantime, the current version stays online and
                the upload beta is available for testing.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button render={<a href="/upload" />}>Upload (beta)</Button>
              <Button render={<Link to="/app/$packageId" params={{ packageId: "667IkR" }} />}>
                Go to app
              </Button>
              <Button
                variant="outline"
                render={
                  <a href="https://harmony.antoinejosset.fr" target="_blank" rel="noreferrer" />
                }
              >
                View current Harmony
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-muted/30 p-0.5 shadow-sm">
            <img
              src="/demo.png"
              alt="Harmony interface preview"
              className="w-full rounded-md object-cover"
            />
          </div>
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
