import { Button, buttonVariants } from "@harmony/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { Checkbox } from "@harmony/ui/components/checkbox";
import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";
import { unzipSync } from "fflate";
import { type CSSProperties, useEffect, useState } from "react";

import { useUpload } from "../context";

interface ArchiveJsonFile {
  path: string;
  name: string;
  size: string;
}

const archiveJsonPattern =
  /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)_(\d+)\.json/;

function normalizeArchivePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function UploadFilesStep() {
  const {
    state: { file, selection },
    actions: { setSelection, next, back },
  } = useUpload();

  const [jsonFiles, setJsonFiles] = useState<Array<ArchiveJsonFile>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const extractArchiveJsonFiles = async () => {
      setJsonFiles([]);
      setError(null);

      if (!file) {
        // Keep resume selection after refresh (File cannot survive sessionStorage).
        setError("No package selected. Please go back and upload a .zip file.");
        return;
      }

      setIsLoading(true);
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const archiveEntries = unzipSync(bytes);

        const extracted = Object.entries(archiveEntries)
          .filter(([filename]) => archiveJsonPattern.test(normalizeArchivePath(filename)))
          .map(([filename, content]) => ({
            path: normalizeArchivePath(filename),
            name: filename.split("/").pop() ?? filename,
            size: formatBytes((content as Uint8Array).byteLength),
          }));

        if (cancelled) return;

        if (extracted.length === 0) {
          setSelection([]);
          setError("No JSON files found in archive.");
          return;
        }

        setJsonFiles(extracted);
        setSelection(extracted.map((entry) => entry.path));
      } catch {
        if (!cancelled) {
          setSelection([]);
          setError("Unable to read archive. Please upload a valid .zip file.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void extractArchiveJsonFiles();

    return () => {
      cancelled = true;
    };
  }, [file, setSelection]);

  const toggleFile = (path: string) => {
    setSelection(
      selection.includes(path) ? selection.filter((f) => f !== path) : [...selection, path],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select configuration files</CardTitle>
        <CardDescription>
          Choose which JSON files from the package to include in the deployment.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Extracting archive…</p> : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!error ? (
          <>
            <ScrollArea
              className="h-[min(14rem,calc(var(--rows)*2rem))] rounded-lg border"
              style={
                {
                  "--rows": String(Math.max(jsonFiles.length, 1)),
                } as CSSProperties
              }
            >
              <div className="flex flex-col divide-x">
                {jsonFiles.map((entry, index) => (
                  <div
                    key={entry.path}
                    onClick={() => toggleFile(entry.path)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "cursor-pointer rounded-none",
                      index === 0 && "rounded-t-lg",
                      index === jsonFiles.length - 1 && "rounded-b-lg",
                    )}
                  >
                    <Checkbox
                      checked={selection.includes(entry.path)}
                      className="pointer-events-none"
                    />
                    <p
                      className={cn(
                        "me-auto",
                        selection.includes(entry.path) ? "text-foreground" : "text-foreground/80",
                      )}
                    >
                      {entry.name}
                    </p>
                    <span className="font-mono text-xs text-muted-foreground">{entry.size}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {selection.length === 0
                ? "No files selected"
                : `${selection.length} of ${jsonFiles.length} files selected`}
            </p>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={back}>
          Back
        </Button>
        <Button onClick={next} disabled={selection.length === 0 || isLoading || Boolean(error)}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
