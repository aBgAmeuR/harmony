import { Link } from "@tanstack/react-router";

import { LINK, LandingSection } from "./landing-section";
import { SPOTIFY_PRIVACY_URL } from "./links";

export const LandingExport = () => (
  <LandingSection>
    <LandingSection.Title>Get your data from Spotify</LandingSection.Title>
    <LandingSection.Text>
      Harmony works from the export Spotify makes for you. You ask for it once and it arrives by
      email
    </LandingSection.Text>
    <LandingSection.Body>
      <ol className="flex max-w-lg list-decimal flex-col gap-1.5 pl-5 text-sm text-pretty text-muted-foreground marker:text-muted-foreground/70">
        <li>
          Open your{" "}
          <LandingSection.ExternalLink href={SPOTIFY_PRIVACY_URL}>
            Spotify privacy settings
          </LandingSection.ExternalLink>
        </li>
        <li>
          Select <LandingSection.Em>Extended streaming history</LandingSection.Em> and send the
          request
        </li>
        <li>Wait for the email with the download link. It can take up to 30 days</li>
        <li>
          <Link to="/upload" className={LINK}>
            Upload the ZIP
          </Link>{" "}
          as it is, without unzipping it
        </li>
      </ol>
    </LandingSection.Body>
  </LandingSection>
);
