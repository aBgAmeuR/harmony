'use client'


import { cn } from "@/lib/utils";
import { Button, Divider, Input, Text } from "@mantine/core";
import Link from "next/link";
import { ComponentPropsWithoutRef, useTransition } from "react";
import { FileDropZone } from "./file-dropzone";
import { useRouter } from "next/navigation";
import { filesProcessing } from "@/services/file-processing";

type GetFileInputsProps = ComponentPropsWithoutRef<'div'>;

export const GetFileInputs = (props: GetFileInputsProps) => {
  const [inTransition, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    console.log(url);
  }

  const handleFile = async (file: File) => {
    startTransition(async () => {
      const time = new Date().getTime();
      const res = await filesProcessing(file);
      console.log('Processing time:', new Date().getTime() - time, 'ms');

      if (res.message === 'ok') {
        router.push('/overview');
      } else {
        alert('Error processing file');
      }
    });
  }

  return (
    <div className={cn('flex flex-col gap-8', props.className)} {...props}>
      <FileDropZone handleFile={handleFile} isLoading={inTransition} />
      <Divider size="sm" label="Or" />
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input type="text" name="url" placeholder="Paste your Spotify Data URL here" disabled={inTransition} required />
        <Button type="submit" loading={inTransition} >Submit</Button>
      </form>
      <Text>No Spotify Data? <Link href="/demo" className="text-green">Try our demo</Link></Text>
    </div>
  )
}
