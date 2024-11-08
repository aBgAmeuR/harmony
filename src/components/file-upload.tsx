"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FileArchive, LoaderCircle, Upload, X } from "lucide-react";

import { Button } from "./ui/button";

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [inTransition, startTransition] = useTransition();
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../public/worker.ts", import.meta.url)
    );
    // workerRef.current.onmessage = (event: MessageEvent<number>) =>
    //   alert(`WebWorker Response => ${event.data}`);
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (inTransition) {
      interval = setInterval(() => {
        setProcessingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setProcessingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inTransition]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (file) {
      startTransition(async () => {
        workerRef.current?.postMessage({ file });
      });
    }
  };

  return (
    <>
      <div className="mt-6">
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={handleFileChange}
          accept=".zip"
        />
        <label
          htmlFor="file-upload"
          className="flex cursor-pointer justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto size-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <span className="hover:text-primary-dark relative font-medium text-primary">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ZIP file up to 100MB
            </p>
          </div>
        </label>
      </div>
      {file && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex">
            <FileArchive className="mr-2 size-5 text-primary" />
            <p>
              <span>{file.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)}MB
              </span>
            </p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleFileRemove}
            className="size-8"
          >
            <X />
          </Button>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || inTransition}
        className="mt-4 w-full"
      >
        {inTransition ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Processing... ({processingTime}s)
          </>
        ) : (
          "Process Data"
        )}
      </Button>
    </>
  );
};
