import { cn } from "@harmony/ui/lib/utils";

import { COLUMN } from "./landing-section";
import { AUTHOR_URL } from "./links";

export const LandingFooter = () => (
  <footer
    className={cn(
      COLUMN,
      "flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground/70",
    )}
  >
    <p>
      Built by{" "}
      <a
        href={AUTHOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-sm text-foreground hover:underline"
      >
        @aBgAmeuR
      </a>
    </p>
    <p className="tabular-nums">{import.meta.env.VITE_APP_VERSION}</p>
  </footer>
);
