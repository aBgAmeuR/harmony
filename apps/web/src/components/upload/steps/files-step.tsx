import { type CSSProperties, useEffect, useRef, useState } from "react";
import { unzipSync } from "fflate";
import { Button, buttonVariants } from "@harmony/ui/components/button";
import { Checkbox } from "@harmony/ui/components/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { ScrollArea } from "@harmony/ui/components/scroll-area";
import { cn } from "@harmony/ui/lib/utils";

interface FilesStepProps {
  packageFile: File | null;
  selectedFiles: Array<string>;
  onSelectionChange: (files: Array<string>) => void;
  onContinue: () => void;
  onBack: () => void;
}

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

export function FilesStep({
  packageFile,
  selectedFiles,
  onSelectionChange,
  onContinue,
  onBack,
}: FilesStepProps) {
  const [jsonFiles, setJsonFiles] = useState<Array<ArchiveJsonFile>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSelectionChangeRef = useRef(onSelectionChange);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    let cancelled = false;

    const extractArchiveJsonFiles = async () => {
      setJsonFiles([]);
      setError(null);

      if (!packageFile) {
        onSelectionChangeRef.current([]);
        setError("No package selected. Please go back and upload a .zip file.");
        return;
      }

      setIsLoading(true);
      try {
        const bytes = new Uint8Array(await packageFile.arrayBuffer());
        const archiveEntries = unzipSync(bytes);

        const extracted = Object.entries(archiveEntries)
          .filter(([filename]) =>
            archiveJsonPattern.test(normalizeArchivePath(filename)),
          )
          .map(([filename, content]) => ({
            path: normalizeArchivePath(filename),
            name: filename.split("/").pop() ?? filename,
            size: formatBytes((content as Uint8Array).byteLength),
          }));

        if (cancelled) return;

        if (extracted.length === 0) {
          onSelectionChangeRef.current([]);
          setError("No JSON files found in archive.");
          return;
        }

        setJsonFiles(extracted);
        onSelectionChangeRef.current(extracted.map((file) => file.path));
      } catch {
        if (!cancelled) {
          onSelectionChangeRef.current([]);
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
  }, [packageFile]);

  const toggleFile = (path: string) => {
    onSelectionChange(
      selectedFiles.includes(path)
        ? selectedFiles.filter((f) => f !== path)
        : [...selectedFiles, path],
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
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Extracting archive…</p>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!error ? (
          <>
            <ScrollArea
              className="rounded-lg border h-[min(14rem,calc(var(--rows)*2rem))]"
              style={
                {
                  "--rows": String(Math.max(jsonFiles.length, 1)),
                } as CSSProperties
              }
            >
              <div className="flex flex-col divide-x">
                {jsonFiles.map((file, index) => (
                  <div
                    key={file.path}
                    onClick={() => toggleFile(file.path)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "active:translate-y-0 rounded-none cursor-pointer",
                      index === 0 && "rounded-t-lg",
                      index === jsonFiles.length - 1 && "rounded-b-lg",
                    )}
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.path)}
                      className="pointer-events-none"
                    />
                    <p
                      className={cn(
                        "me-auto",
                        selectedFiles.includes(file.path)
                          ? "text-foreground"
                          : "text-foreground/80",
                      )}
                    >
                      {file.name}
                    </p>
                    <span className="text-xs text-muted-foreground font-mono">
                      {file.size}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground">
              {selectedFiles.length === 0
                ? "No files selected"
                : `${selectedFiles.length} of ${jsonFiles.length} files selected`}
            </p>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={selectedFiles.length === 0 || isLoading || Boolean(error)}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
