import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import { AppHeader } from "~/components/app-header";

export default async function SettingsAboutPage() {
  return (
    <>
      <AppHeader items={["Settings", "About"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="max-w-screen-xl w-full mx-auto">
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>Key details about Harmony</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Version</h3>
              <div className="flex items-center gap-2">
                <p>2.3</p>
                <Badge>Latest</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p>
                Harmony is an open-source application that generates
                comprehensive statistics from your Spotify data plan, providing
                insights into your listening habits and music preferences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Features</h3>
              <ul className="list-disc pl-6">
                <li>Top tracks and artists analysis</li>
                <li>Recently played tracks overview</li>
                <li>Detailed rankings for tracks, albums, and artists</li>
                <li>In-depth listening habits statistics</li>
                <li>Year-over-year comparisons</li>
                <li>Artist vs. Artist comparisons</li>
                <li>Milestone tracking for your listening journey</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Open Source</h3>
              <p>
                Harmony is open-source software. You can view the source code,
                contribute, or report issues on our{" "}
                <a
                  href="https://github.com/aBgAmeuR/Harmony"
                  className="hover:underline text-chart-1"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Privacy</h3>
              <p>
                We take your privacy seriously. Harmony only accesses the
                Spotify data you explicitly grant permission for and does not
                store any personal information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
