'use client'

import { cn } from '@/lib/utils';
import { Text } from '@mantine/core';
import { useState } from 'react';

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
    if (file.type !== 'application/x-zip-compressed') {
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
        <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
          <g clipPath="url(#clip0_151_82)">
            <path d="M22.2036 21.9632L22.3876 24.5935L10.7441 25.4076L10.5872 23.1631L15.6804 16.8745C16.1907 16.2202 16.5893 15.648 16.8761 15.1581C17.1624 14.6603 17.3626 14.2195 17.4767 13.8356C17.5981 13.4434 17.6468 13.0758 17.6228 12.7329C17.5869 12.2185 17.4703 11.7842 17.2733 11.4299C17.0756 11.0678 16.8022 10.7971 16.4529 10.6179C16.1114 10.4382 15.6991 10.3652 15.2159 10.399C14.7015 10.435 14.266 10.5907 13.9093 10.8663C13.5605 11.1413 13.3042 11.5077 13.1404 11.9656C12.9844 12.4229 12.9261 12.9321 12.9653 13.4932L9.58682 13.7295C9.51598 12.7163 9.69272 11.772 10.1171 10.8965C10.5409 10.0132 11.1756 9.29141 12.0214 8.73104C12.8667 8.16289 13.8933 7.83657 15.1013 7.7521C16.2937 7.66872 17.3126 7.79326 18.1582 8.12571C19.011 8.44982 19.6732 8.95956 20.1447 9.65492C20.6235 10.3419 20.8978 11.1842 20.9675 12.1818C21.0068 12.7429 20.9556 13.2986 20.8139 13.8489C20.6717 14.3914 20.4516 14.9394 20.1535 15.4927C19.8627 16.0378 19.5023 16.5955 19.0723 17.166C18.6423 17.7364 18.163 18.3299 17.6344 18.9464L14.9089 22.4733L22.2036 21.9632Z" fill="#C9C9C9" />
          </g>
          <defs>
            <clipPath id="clip0_151_82">
              <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
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
