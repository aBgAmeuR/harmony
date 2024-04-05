'use client'

import { Group, Text, rem } from '@mantine/core';
import { Dropzone, DropzoneProps, MIME_TYPES } from '@mantine/dropzone';
import { IconPhoto } from '@tabler/icons-react';
import { useTransition } from 'react';

type FileError = {
  message: string;
  code: string;
}

const acceptedMimeTypes = [
  MIME_TYPES.zip,
];

export const FileDropZone = (props: Partial<DropzoneProps>) => {

  const [isPending, startTransition] = useTransition();

  const validator = (file: File): FileError | null => {
    if (!file.name.match('my_spotify_data.zip')) {
      return { message: 'File name should be my_spotify_data.zip', code: 'invalid-file-name' };
    }
    return null;
  };

  const onDrop = (files: File[]) => startTransition(async () => {
    const formData = new FormData();
    formData.append('file', files[0]);
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log(files);
  });


  return (
    <div>
      <Dropzone
        onDrop={onDrop}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={10 * 1024 ** 2}
        multiple={false}
        accept={acceptedMimeTypes}
        validator={validator}
        activateOnDrag={false}
        loading={isPending}
        {...props}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <IconPhoto
            style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
            stroke={1.5}
          />
          {/* <IconX
            style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
            stroke={1.5}
          /> */}
          <div>
            <Text size="xl" inline>
              Click <b>here</b> to select your Spotify data
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Only <b>my_spotify_data.zip</b> files are accepted
            </Text>
          </div>
        </Group>
      </Dropzone>
    </div>
  );
}
