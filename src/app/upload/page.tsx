import { AlertCircle } from "lucide-react";

import { FileUpload } from "@/components/file-upload";
import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="flex gap-2">
          <Icons.logo className="size-10" />
          <h1 className="text-4xl font-semibold tracking-tight">Harmony</h1>
        </div>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Upload Your Spotify Data Package</CardTitle>
            <CardDescription>
              Generate stats from your Spotify listening history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info">
              <AlertCircle className="size-4" />
              <AlertTitle>Privacy First</AlertTitle>
              <AlertDescription>
                Your data is processed locally on your device. Nothing is sent
                to any server!
              </AlertDescription>
            </Alert>
            <FileUpload />
          </CardContent>
        </Card>
        <Card className="mt-2 w-full max-w-2xl">
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
      </main>
      <Footer />
    </div>
  );
}
