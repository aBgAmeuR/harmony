'use client'

import { cn } from "@/lib/utils";
import { Button, Divider, Input, Text } from "@mantine/core";
import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";
import { FileDropZone } from "./file-dropzone";
import { filesProcessing } from "@/lib/files/files";

type GetFileInputsProps = ComponentPropsWithoutRef<'div'>;

export const GetFileInputs = (props: GetFileInputsProps) => {

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    console.log(url);
  }

  const handleFile = async (file: File) => {
    const res = await filesProcessing(file);
    console.log(res);
    
  }

  return (
    <div className={cn('flex flex-col gap-8', props.className)} {...props}>
      <FileDropZone handleFile={handleFile} />
      <Divider size="sm" label="Or" />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input type="text" name="url" placeholder="Paste your Spotify Data URL here" />
        <Button type="submit">Submit</Button>
      </form>
      <Text>No Spotify Data? <Link href="/demo" className="text-green">Try our demo</Link></Text>
    </div>
  )
}
