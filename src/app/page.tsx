'use client'

import { FileDropZone } from "@/components/file-dropzone";
import { Button, Input, Title } from "@mantine/core";
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function Home() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const handleUpload = async (event: any) => {
    event.preventDefault();

    const response = await fetch('/api/upload', {
      method: 'POST',
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <div className="h-screen flex flex-col gap-12 justify-center items-center">
      <Title order={1}>Upload Your Spotify Data</Title>
      <div>
        <Title order={2}>Production environment</Title>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            if (!inputFileRef.current?.files) {
              throw new Error('No file selected');
            }

            const file = inputFileRef.current.files[0];

            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            });

            setBlob(newBlob);
          }}
          className="flex gap-4"
        >
          <Input name="file" ref={inputFileRef} type="file" required />
          <Button type="submit">Upload</Button>
        </form>
        {blob && (
          <div>
            Blob url: <a href={blob.url}>{blob.url}</a>
          </div>
        )}
      </div>

      <div>
        <Title order={2}>Development environment</Title>
        <form onSubmit={handleUpload} method="post">
          <Button type="submit">Upload</Button>
        </form>
      </div>
    </div>
  );
}
