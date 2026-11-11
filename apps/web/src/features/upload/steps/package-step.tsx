import { Icon, Cancel01FreeIcons, FolderUploadIcon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { format } from "@/shared/lib/format";

import { useUpload } from "../context";
import { serverConfigQuery } from "../queries";

const isZipFile = (file: File) => {
  return file.name.toLowerCase().endsWith(".zip");
};

export const UploadPackageStep = () => {
  const {
    state: { file },
    actions: { setFile, next },
  } = useUpload();
  // Until the limit is known, the server is the one to refuse a file too large.
  const { data: serverConfig } = useQuery(serverConfigQuery());
  const maxZipSize = serverConfig?.maxUploadBytes;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateAndSetFile = (nextFile: File | null) => {
    if (!nextFile) return;
    if (!isZipFile(nextFile)) {
      setError("Please upload a .zip file.");
      return;
    }
    if (maxZipSize !== undefined && nextFile.size > maxZipSize) {
      setError(`File is too large. Maximum allowed size is ${format.bytes(maxZipSize)}.`);
      return;
    }
    setError(null);
    setFile(nextFile);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setFile(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upload your package</CardTitle>
          <CardDescription>
            Select or drag and drop your{" "}
            <span className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.zip</span> file to get
            started.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => inputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-3 rounded-xl",
              "h-44 w-full cursor-pointer outline-none",
              "transition-[color,background-color,transform] duration-150 ease-out",
              "bg-background/50 ring-1 ring-border/50 hover:bg-background/30",
              isDragOver && "bg-background/30 ring-primary/50",
              "after:absolute after:inset-1 after:rounded-lg",
              "after:border after:border-dashed after:border-border/50",
              "after:pointer-events-none after:transition-colors hover:after:border-border/80",
              isDragOver && "after:border-primary/60",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={(e) => {
                validateAndSetFile(e.target.files?.[0] ?? null);
                e.currentTarget.value = "";
              }}
              className="hidden"
            />
            <div className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground ring-1 ring-border/50 transition-[background-color,color] duration-150 ease-out group-hover:bg-background group-hover:text-foreground">
              <Icon icon={FolderUploadIcon} size={16} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drag & drop or{" "}
                <span className="underline decoration-[0.5px] underline-offset-2">
                  click to upload
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports <span className="font-mono">.zip</span> files
                {maxZipSize !== undefined ? ` up to ${format.bytes(maxZipSize)}` : null}
              </p>
            </div>
          </Button>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          {file ? (
            <div className="flex min-w-0 items-center gap-1 rounded-lg border px-3 py-1">
              <p className="flex-1 truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{format.bytes(file.size)}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                aria-label="Remove package"
              >
                <Icon icon={Cancel01FreeIcons} size={14} />
              </Button>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="justify-end">
          <Button onClick={next} disabled={!file}>
            Continue
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-5 flex justify-center text-center">
        <p className="bg-background px-2 text-sm text-muted-foreground">
          <span>Don't have a package? </span>
          <Button
            variant="link"
            className="-ml-1.5 text-foreground"
            render={<Link to="/app/$packageId" params={{ packageId: "demo" }} />}
          >
            See a demo
          </Button>
        </p>
      </div>
    </>
  );
};
