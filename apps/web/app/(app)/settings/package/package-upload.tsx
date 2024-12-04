import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import { FileUpload } from "~/components/file-upload";

type PackageUploadProps = {
  className?: string;
};

export const PackageUpload = ({ className }: PackageUploadProps) => {
  return (
    <Card className={className}>
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
  );
};
