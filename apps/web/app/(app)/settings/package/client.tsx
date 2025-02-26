"use client";

import { PropsWithChildren, useRef, useState, useTransition } from "react";
import { signOut } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Progress } from "@repo/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Files,
  HelpCircle,
  History,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { filesProcessing, getFiles } from "~/services/file-processing";

import { DocsModal } from "./docs-modal";
import { HistoryModal } from "./history-modal";

type ClientProps = PropsWithChildren<{
  isDemo?: boolean;
  hasPackage?: boolean;
}>;

export const Client = ({
  isDemo = false,
  hasPackage = false,
  children,
}: ClientProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [inTransition, startTransition] = useTransition();
  const [filesQueue, setFilesQueue] = useState<
    {
      filename: string;
      status: "pending" | "processing" | "done" | "error";
    }[]
  >([]);
  const queryClient = useQueryClient();

  const setProgress = (progress: number) => {
    setProcessingProgress(progress);
  };

  const handleFileSelect = () => {
    if (fileInputRef.current?.files) {
      const selectedFile = fileInputRef.current.files[0];
      if (!selectedFile) return;
      startTransition(async () => {
        // 2s delay to simulate processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const files = await getFiles(selectedFile);
        if (!Array.isArray(files) && files.message === "error") {
          toast.error(files.error);
          return;
        }
        if (Array.isArray(files)) {
          setFilesQueue(
            files.map((file) => ({
              filename: file.filename,
              status: "pending",
            })),
          );
        }

        // // const res = await filesProcessing(selectedFile, setProgress);
        // if (res.message === "error") {
        //   toast.error(res.error);
        //   return;
        // }
        // queryClient.clear();
        // // TODO: Update user session but next-auth has not yet implemented the solution
        // await signOut({ redirect: true, redirectTo: "/settings/package" });
      });
    }
  };

  return (
    <EmptyState
      title="Upload Your Spotify Data Package"
      description="Please upload your Spotify data package to generate your listening stats."
      icons={[Files, Package, History]}
      action={{
        label: "Upload my package",
        onClick: () => fileInputRef.current?.click(),
        disabled: isDemo,
        loading: inTransition,
      }}
      action2={
        <DocsModal>
          <Button variant="outline">
            <HelpCircle className="size-4" />
            How to get my package
          </Button>
        </DocsModal>
      }
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".zip"
      />
      {!inTransition && hasPackage && !isDemo && (
        <HistoryModal>{children}</HistoryModal>
      )}
      {filesQueue.length > 0 ? (
        <div className="mt-4 space-y-4">
          <Progress value={processingProgress} />
          <div className="space-y-2">
            {filesQueue.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                {file.status === "pending" && (
                  <AlertCircle className="size-4 text-muted-foreground" />
                )}
                {file.status === "processing" && (
                  <Loader2 className="size-4 animate-spin text-primary" />
                )}
                {file.status === "done" && (
                  <Check className="size-4 text-primary" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="size-4 text-destructive" />
                )}
                <span className="text-sm">{file.filename.split("/")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </EmptyState>
  );
};
