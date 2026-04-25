import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@harmony/ui/components/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon } from '@hugeicons/core-free-icons'
import { Icons } from '@/components/icons'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Icons.logo className="size-7!" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate scroll-m-20 text-lg font-bold tracking-tight text-balance text-foreground">
                Harmony
              </span>
            </div>
          </div>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Button size="sm" variant="ghost" asChild>
              <a href="https://github.com/aBgAmeuR/Harmony" target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={GithubIcon} />
              </a>
            </Button>
            <Button size="sm" asChild>
              <a href="https://harmony.antoinejosset.fr" target="_blank" rel="noreferrer">
                Current version
              </a>
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
                I’m rebuilding the experience. In the meantime, the current version stays online and
                the upload beta is available for testing.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <a href="/upload">Upload (beta)</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://harmony.antoinejosset.fr" target="_blank" rel="noreferrer">
                  View current Harmony
                </a>
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
        <div className="mx-auto flex w-full max-w-6xl gap-1 px-3 py-2 text-xs text-muted-foreground items-center justify-between">
          <p>
            Built by{' '}
            <Button variant="link" size="xs" className="p-0" asChild>
              <a href="https://github.com/aBgAmeuR" target="_blank" rel="noreferrer">
                @aBgAmeuR
              </a>
            </Button>
          </p>
          <p>v3.0-beta</p>
        </div>
      </footer>
    </div>
  )
}
