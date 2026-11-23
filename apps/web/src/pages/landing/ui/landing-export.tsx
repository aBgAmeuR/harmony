import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { useUploadEnabled } from "@/features/upload/use-upload-enabled";

import { LandingSection } from "./landing-section";
import { SPOTIFY_PRIVACY_URL } from "./links";

type StepProps = {
  n: number;
  children: ReactNode;
};

const Step = ({ n, children }: StepProps) => (
  <li className="flex grow basis-44 flex-col gap-2">
    <span className="text-2xl leading-none font-bold text-primary tabular-nums">{n}</span>
    <span className="text-pretty">{children}</span>
  </li>
);

export const LandingExport = () => {
  const uploadEnabled = useUploadEnabled();

  return (
    <LandingSection>
      <LandingSection.Title>Get your data from Spotify</LandingSection.Title>
      <ol className="t-stagger-line t-stagger-line--2 flex flex-wrap gap-6 text-sm text-muted-foreground">
        <Step n={1}>
          Open your{" "}
          <LandingSection.ExternalLink href={SPOTIFY_PRIVACY_URL}>
            Spotify privacy settings
          </LandingSection.ExternalLink>
        </Step>
        <Step n={2}>
          Select <LandingSection.Em>Extended streaming history</LandingSection.Em> and send the
          request
        </Step>
        <Step n={3}>Wait for the email with the download link. It can take up to 30 days</Step>
        {uploadEnabled ? (
          <Step n={4}>
            <Link
              to="/upload"
              className="rounded-sm text-foreground underline decoration-foreground/30 underline-offset-3 transition-colors hover:decoration-foreground"
            >
              Upload the ZIP
            </Link>{" "}
            as it is, without unzipping it
          </Step>
        ) : null}
      </ol>
    </LandingSection>
  );
};
