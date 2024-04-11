import { GetFileInputs } from "@/components/get-file-inputs";
import { Logo } from "@/components/logo";
import { Steps } from "@/components/steps";
import { Text, Title } from "@mantine/core";
import Link from "next/link";

export default function Home() {

  return (
    <main className="grid grid-rows-[64px_1fr_64px] min-h-screen">
      <header className="flex items-center justify-center h-16 bg-secondary">
        <Logo className="size-8 mx-2" />
        <Title order={2}>Harmony</Title>
      </header>
      <section className="flex flex-col p-8 mx-auto w-full max-w-2xl gap-12">
        <Text>Harmony is a website that generates stats from your Spotify data Package. To get started, click the button below to upload your Spotify Data Package.</Text>
        <Link href="/help" className="bg-secondary w-full relative flex flex-col items-center justify-center select-none p-5 rounded-lg">
          <Text>Get my Spotify Data 👆</Text>
          <Text>(click on this button)</Text>
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3">
            <Steps number={1} />
          </div>
        </Link>
        <GetFileInputs />
      </section>
      <footer className="flex items-center justify-start h-16 px-4 bg-secondary">
        <Text>Made with ❤️ by aBgAmeuR. Harmony is an open source software.</Text>
      </footer>
    </main>
  );
}
