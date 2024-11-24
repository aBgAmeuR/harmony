import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import { AppHeader } from "~/components/app-header";
import { FileUpload } from "~/components/file-upload";

import { PackageHistoryUpload } from "./package-history-upload";

export default function SettingsPackagePage() {
  return (
    <>
      <AppHeader items={["Settings", "Package"]} />
      <div className="flex flex-1 flex-col items-center gap-4 p-4 pt-0">
        <Suspense fallback={null}>
          <PackageHistoryUpload />
        </Suspense>

        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Upload Your Spotify Data Package</CardTitle>
            <CardDescription>
              Please upload your Spotify data package to generate your listening
              stats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>

        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>How to Get Your Spotify Data Package</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Go to your{" "}
                <a
                  href="https://www.spotify.com/account/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Spotify Account Privacy Settings
                </a>
              </li>
              <li>Scroll down to the &quot;Download your data&quot; section</li>
              <li>
                Click on the &quot;Request&quot; button next to &quot;Extended
                streaming history&quot;
              </li>
              <li>
                Wait for an email from Spotify (this can take up to 30 days, but
                usually arrives within a few days)
              </li>
              <li>Download the ZIP file from the link in the email</li>
              <li>Upload the ZIP file here on Harmony</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
