import { Icons } from "@/shared/primitives/icons";

export const AppFooter = () => (
  <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
    <Icons.logo className="size-7!" />
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
        Harmony
      </span>
    </div>
  </div>
);
