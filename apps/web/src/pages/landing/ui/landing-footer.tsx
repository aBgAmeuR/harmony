import { AUTHOR_URL } from "./links";

export const LandingFooter = () => (
  <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-8 text-xs text-muted-foreground/70">
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
