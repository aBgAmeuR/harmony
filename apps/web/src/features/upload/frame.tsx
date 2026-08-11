import type { PropsWithChildren } from "react";

import { Link } from "@tanstack/react-router";

import { Icons } from "@/components/icons";

import { useUpload } from "./context";
import { DecorativeFrame } from "./decorative-frame";

export function UploadFrame({ children }: PropsWithChildren) {
  const { state } = useUpload();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <DecorativeFrame cardHeight={state.cardHeight} />

      <div className="pointer-events-none absolute left-1/2 w-full max-w-152 -translate-x-1/2">
        <p className="absolute top-45 right-[calc(100%+3rem)] hidden pt-2 text-right text-sm font-medium whitespace-nowrap text-foreground/70 lg:block">
          Deploy Package
        </p>
      </div>

      <div className="mx-auto w-full max-w-152 px-6 pt-45 pb-24">{children}</div>

      <Link
        to="/"
        className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2"
      >
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </Link>
    </div>
  );
}
