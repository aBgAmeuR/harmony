import { Icon, Loading03Icon } from "@harmony/icons";

import { Icons } from "./icons";

export function Pending() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <Icon icon={Loading03Icon} className="size-4 animate-spin" />
        <span className="text-sm font-medium">Setup your database</span>
      </div>

      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </div>
    </div>
  );
}
