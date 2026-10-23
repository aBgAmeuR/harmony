import type { ReactNode } from "react";

import { LandingSection } from "./landing-section";
import { GITHUB_URL } from "./links";

const QUESTIONS: ReadonlyArray<{ q: string; a: ReactNode }> = [
  {
    q: "Is it free?",
    a: "Yes. Harmony is free and open source under the GPL-3.0 license",
  },
  {
    q: "Do I need to log in with Spotify?",
    a: "No. Harmony only reads the export you upload. It never connects to your Spotify account",
  },
  {
    q: "What happens to my file?",
    a: "The server reads every stream, looks up each track and album on Deezer for covers and album details, and saves the result as one small DuckDB file. Your browser downloads that file and runs every query itself",
  },
  {
    q: "Which export do I need?",
    a: (
      <>
        The <LandingSection.Em>Extended streaming history</LandingSection.Em>. The regular account
        data only covers the last year; the extended one goes back to your first stream
      </>
    ),
  },
  {
    q: "Who can see my package?",
    a: "There are no accounts. Your package lives at a six-character link, and anyone with that link can open it",
  },
  {
    q: "Can I host it myself?",
    a: (
      <>
        Yes. One Docker image serves the app and the API:
        <pre className="mt-2 overflow-x-auto rounded-lg bg-card px-3 py-2.5 font-mono text-xs text-foreground ring-1 ring-border">
          <span className="text-muted-foreground select-none">$ </span>
          <span className="text-primary">docker</span>
          {" run -p 3000:3000 -v harmony-data:/data ghcr.io/abgameur/harmony"}
        </pre>
      </>
    ),
  },
  {
    q: "Where's the code?",
    a: (
      <>
        On <LandingSection.ExternalLink href={GITHUB_URL}>GitHub</LandingSection.ExternalLink>.
        Issues and pull requests are welcome
      </>
    ),
  },
];

export const LandingFaq = () => (
  <LandingSection>
    <LandingSection.Title>Questions</LandingSection.Title>
    <dl className="t-stagger-line t-stagger-line--2 mt-4 flex flex-col gap-6">
      {QUESTIONS.map((item) => (
        <div key={item.q} className="flex max-w-xl flex-col gap-1 text-sm">
          <dt className="font-medium text-foreground">{item.q}</dt>
          <dd className="text-pretty text-muted-foreground/70">{item.a}</dd>
        </div>
      ))}
    </dl>
  </LandingSection>
);
