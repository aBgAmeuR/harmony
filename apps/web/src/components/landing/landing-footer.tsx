import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";

import { LandingLogo } from "@/components/landing/landing-logo";

import { useStaggerReveal } from "./use-stagger-reveal";

function GhostWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) {
      return;
    }

    const fit = () => {
      text.style.transform = "scale(1)";
      const width = wrap.clientWidth;
      const natural = text.offsetWidth;
      if (width <= 0 || natural <= 0) {
        return;
      }
      text.style.transform = `scale(${width / natural})`;
    };

    fit();
    void document.fonts.ready.then(fit);

    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[108px] overflow-hidden">
      <p
        ref={textRef}
        aria-hidden
        className="inline-block origin-top-left -translate-x-2 text-[108px] leading-none font-extrabold tracking-[-4px] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_#FFFFFF33]"
      >
        Harmony
      </p>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background from-0% to-transparent to-55%"
      />
    </div>
  );
}

export function LandingFooter() {
  const { ref, isShown } = useStaggerReveal<HTMLElement>();

  return (
    <footer ref={ref} className="mt-16 shrink-0">
      <div className={cn("t-stagger mx-auto w-full max-w-xl px-4 sm:px-0", isShown && "is-shown")}>
        <div className="t-stagger-line t-stagger-line--1 flex flex-wrap items-center justify-between gap-2 pb-3">
          <Link to="/" className="group/logo flex shrink-0 items-center gap-1 outline-none">
            <LandingLogo className="size-6" />
            <span className="text-lg font-bold tracking-tight text-foreground">Harmony</span>
          </Link>

          <nav className="-mr-2 flex items-center gap-0.5">
            <Button
              nativeButton={false}
              variant="ghost"
              render={
                <a
                  href="https://github.com/aBgAmeuR/Harmony#readme"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Docs
            </Button>
            <Button
              nativeButton={false}
              variant="ghost"
              render={
                <a
                  href="https://github.com/aBgAmeuR/Harmony/releases"
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Changelog
            </Button>
            <Button
              nativeButton={false}
              variant="ghost"
              render={
                <a href="https://github.com/aBgAmeuR/Harmony" target="_blank" rel="noreferrer" />
              }
            >
              GitHub
            </Button>
            <Button
              nativeButton={false}
              variant="ghost"
              render={<Link to="/app/$packageId" params={{ packageId: "demo" }} />}
            >
              Demo
            </Button>
            <Button nativeButton={false} variant="ghost" render={<a href="#" />}>
              Privacy
            </Button>
          </nav>
        </div>

        <div className="t-stagger-line t-stagger-line--2 flex w-full items-center justify-between pb-3">
          <p className="text-xs text-muted-foreground">
            Built by
            <Button
              nativeButton={false}
              render={<a href="https://github.com/aBgAmeuR" target="_blank" rel="noreferrer" />}
              variant="link"
              size="xs"
              className="-ml-1 text-foreground"
            >
              @aBgAmeuR
            </Button>
          </p>
          <p className="text-xs text-muted-foreground">v3.0-beta</p>
        </div>
        <div className="t-stagger-line t-stagger-line--3">
          <GhostWordmark />
        </div>
      </div>
    </footer>
  );
}
