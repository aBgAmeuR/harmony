'use client'

import { cn } from '@/lib/utils';
import { Text } from '@mantine/core';
import { useState } from 'react';
import { Steps } from './steps';

type FileDropZoneProps = {
  handleFile: (file: File) => void;
  isLoading?: boolean;
};

export const FileDropZone = ({ handleFile, isLoading = false }: FileDropZoneProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!verifyFile(file)) return;

    handleFile(file);
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
    if (!file || !verifyFile(file)) return;

    handleFile(file);
  }

  const verifyFile = (file: File) => {
    if (file.type !== 'application/x-zip-compressed' && file.type !== 'application/zip') {
      console.log('file.type', file.type);
      setErrorMessage('Invalid file type. Please upload a .zip file.');
    } else if (file.size > 100000000) {
      console.log('file.size', file.size);
      setErrorMessage('File size exceeds 100MB limit.');
    } else {
      setErrorMessage(null);
      return true;
    }
    return false;
  }

  return (
    <div className='flex items-center justify-center w-full relative border-2 border-dashed border-primary rounded-lg'>
      {isLoading && (
        <div className="absolute top-0 left-0 z-10 w-full h-full bg-white bg-opacity-50 flex items-center justify-center">
          <svg aria-hidden="true" className="inline size-12 text-white-500 animate-spin fill-green " viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      )}
      <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3">
        <Steps number={2} />
      </div>
      <label htmlFor="dropzone-file" className={cn("w-full relative flex flex-col items-center justify-center select-none p-5  cursor-pointer", isLoading && 'opacity-10 pointer-events-none')} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => e.preventDefault()} onDragLeave={(e) => e.preventDefault()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
        <Text>Click <span className="font-bold">here</span> to select your Spotify Data Package</Text>
        {errorMessage && <Text color="red">{errorMessage}</Text>}
        <input id="dropzone-file" type="file" name="file" className="hidden" onChange={handleFileInput} />
      </label>
    </div>
  );
}
