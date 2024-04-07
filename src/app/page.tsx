'use client'

import { Button, Divider, Input, Text, Title } from "@mantine/core";
import { type PutBlobResult } from '@vercel/blob';
import Link from "next/link";
import { useRef, useState } from 'react';

export default function Home() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  return (
    <>
      <header className="flex items-center justify-center h-16 bg-secondary">
        <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2">
          <rect y="2.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 2.09082)" fill="#141414" />
          <g clip-path="url(#clip0_148_68)">
            <path d="M9.29199 17.8384L7.74693 17.9465C7.15836 17.9876 6.71817 18.5473 6.76356 19.1964L7.16359 24.9172C7.20899 25.5664 7.72279 26.0593 8.31136 26.0182L9.85641 25.9101C10.445 25.869 10.8852 25.3093 10.8398 24.6601L10.4397 18.9394C10.3944 18.2902 9.88055 17.7973 9.29199 17.8384Z" fill="#1ED760" />
            <path d="M13.5895 6.72956L12.0444 6.8376C11.4559 6.87875 11.0157 7.43839 11.061 8.0876L12.2132 24.5641C12.2586 25.2132 12.7724 25.7062 13.361 25.665L14.906 25.557C15.4946 25.5158 15.9348 24.9562 15.8894 24.307L14.7372 7.83054C14.6918 7.18133 14.178 6.6884 13.5895 6.72956Z" fill="#1ED760" />
            <path d="M19.1486 13.6627L17.6035 13.7707C17.015 13.8119 16.5605 14.1678 16.5883 14.5658L17.2946 24.6658C17.3224 25.0637 17.822 25.3529 18.4105 25.3118L19.9556 25.2037C20.5441 25.1626 20.9986 24.8066 20.9708 24.4087L20.2645 14.3087C20.2367 13.9108 19.7371 13.6215 19.1486 13.6627Z" fill="#1ED760" />
            <path d="M23.9237 9.38483L22.3786 9.49287C21.7901 9.53402 21.3561 10.1829 21.4092 10.9421L22.2984 23.6586C22.3515 24.4178 22.8716 25 23.4601 24.9588L25.0052 24.8508C25.5937 24.8096 26.0277 24.1607 25.9746 23.4016L25.0854 10.6851C25.0323 9.92582 24.5122 9.34368 23.9237 9.38483Z" fill="#1ED760" />
          </g>
          <defs>
            <clipPath id="clip0_148_68">
              <rect width="18.8709" height="18.8734" fill="white" transform="translate(5.92926 7.26514) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
        <Title order={2}>Harmony</Title>
      </header>
      {/* <div className="h-screen flex flex-col gap-12 justify-center items-center">
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
      </div> */}
      <main className="flex flex-col p-8 mx-auto w-full max-w-2xl gap-12">
        <Text>Harmony is a website that generates stats from your Spotify data Package. To get started, click the button below to upload your Spotify Data Package.</Text>
        <Link href="/help" className="bg-secondary w-full relative flex flex-col items-center justify-center select-none p-5 rounded-lg">
          <Text>Get my Spotify Data 👆</Text>
          <Text>(click on this button)</Text>
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3">
            <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
              <g clip-path="url(#clip0_151_82)">
                <path d="M17.758 7.77778L18.9506 24.8338L15.5839 25.0692L14.6626 11.8944L10.7077 13.4631L10.5221 10.8094L17.3956 7.80312L17.758 7.77778Z" fill="#C9C9C9" />
              </g>
              <defs>
                <clipPath id="clip0_151_82">
                  <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </Link>
        <div className="flex flex-col gap-8">
          <div className="border-2 border-dashed border-secondary w-full relative flex flex-col items-center justify-center select-none p-5 rounded-lg">
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3">
              <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
                <g clip-path="url(#clip0_151_82)">
                  <path d="M22.2036 21.9632L22.3876 24.5935L10.7441 25.4076L10.5872 23.1631L15.6804 16.8745C16.1907 16.2202 16.5893 15.648 16.8761 15.1581C17.1624 14.6603 17.3626 14.2195 17.4767 13.8356C17.5981 13.4434 17.6468 13.0758 17.6228 12.7329C17.5869 12.2185 17.4703 11.7842 17.2733 11.4299C17.0756 11.0678 16.8022 10.7971 16.4529 10.6179C16.1114 10.4382 15.6991 10.3652 15.2159 10.399C14.7015 10.435 14.266 10.5907 13.9093 10.8663C13.5605 11.1413 13.3042 11.5077 13.1404 11.9656C12.9844 12.4229 12.9261 12.9321 12.9653 13.4932L9.58682 13.7295C9.51598 12.7163 9.69272 11.772 10.1171 10.8965C10.5409 10.0132 11.1756 9.29141 12.0214 8.73104C12.8667 8.16289 13.8933 7.83657 15.1013 7.7521C16.2937 7.66872 17.3126 7.79326 18.1582 8.12571C19.011 8.44982 19.6732 8.95956 20.1447 9.65492C20.6235 10.3419 20.8978 11.1842 20.9675 12.1818C21.0068 12.7429 20.9556 13.2986 20.8139 13.8489C20.6717 14.3914 20.4516 14.9394 20.1535 15.4927C19.8627 16.0378 19.5023 16.5955 19.0723 17.166C18.6423 17.7364 18.163 18.3299 17.6344 18.9464L14.9089 22.4733L22.2036 21.9632Z" fill="#C9C9C9" />
                </g>
                <defs>
                  <clipPath id="clip0_151_82">
                    <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-cloud-upload"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
            <Text>Click <span className="font-bold">here</span> to select your Spotify Data</Text>
          </div>
          <Divider size="sm" label="Or" />
          {/*  input text and button submit */}
          <form className="flex flex-col gap-4">
            <Input type="text" placeholder="Paste your Spotify Data URL here" />
            <Button type="submit">Submit</Button>
          </form>
          <Text>No Spotify Data? <Link href="/demo" className="text-green">Try our demo</Link></Text>
        </div>
      </main>
      <footer className="absolute bottom-0 right-0 left-0 flex items-center justify-start h-16 px-4 bg-secondary">
        <Text>Made with ❤️ by aBgAmeuR. Harmony is an open source software.</Text>
      </footer>
    </>
  );
}
