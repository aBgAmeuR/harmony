import { GetFileInputs } from "@/components/get-file-inputs";
import { Logo } from "@/components/logo";
import { Steps } from "@/components/steps";
import { Button, Text, Title } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {

  return (
    <main className="grid grid-rows-[64px_1fr_64px] min-h-screen">
      <header className="flex items-center justify-center h-16 bg-secondary">
        <Logo className="size-8 mx-2" />
        <Title order={2}>Harmony</Title>
      </header>
      <section className="flex flex-col p-8 mx-auto w-full max-w-2xl">
        <Link href="/">
          <Button variant="light">
            <ArrowLeft className="mr-1 size-4" />
            <Text>Back</Text>
          </Button>
        </Link>
        <Title order={2} className="mt-4">Get your Spotify data</Title>
        <Title order={3} className="mt-3">1. Request your data from Spotify</Title>
        <Text className="mt-2">In order to request the extended streaming history files, simply press the correct buttons on the Spotify website.</Text>
        <ul className="list-decimal list-inside ml-2 mt-1">
          <li>To get started, open the <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noreferrer" className="underline text-green cursor-pointer">Privacy page</a> on the Spotify website.</li>
          <li>Scroll down to the &quot;Download your data&quot; section.</li>
          <li>Configure the page so it looks like the screenshot below (Unticked the &quot;Account data&quot; and ticked the &quot;Extended streaming history&quot; boxes).</li>
          <Image src="/privacy-step3.webp" alt="Spotify data request" width={400} height={300} className="mt-4" />
          <li className="mt-4">Press the &quot;Request&quot; button.</li>
        </ul>
        <Title order={3} className="mt-3">2. Confirm your request</Title>
        <Text className="mt-2">As soon as your request is accepted by Spotify, you&apos;ll receive a link to confirm the request in your email. Confirm it, and Spotify will start gathering your data.</Text>
        <Image src="/step2.png" alt="Spotify data request" width={800} height={600} className="mt-4" />

        <Title order={3} className="mt-3">3. Wait until you receive your data</Title>
        <Text className="mt-2">This can take a while. As Spotify states: <br />We&apos;re currently gathering a copy of your personal data. This shouldn&apos;t take longer than 30 days. But don&apos;t worry, we&apos;ll send you an email when it&apos;s ready.</Text>

        <Title order={3} className="mt-3">4. Download and extract the files</Title>
        <Text className="mt-2">Once your data is ready to download, you&apos;ll get an email with a link to download a .ZIP file.</Text>
        <Image src="/step5.png" alt="Spotify data request" width={800} height={600} className="mt-4" />

        <Title order={3} className="mt-3">5. Import your files</Title>
        <Text className="mt-2 mb-8">Upload the files from the .ZIP file you downloaded to Harmony. We will process the files on your device and generate stats for you.</Text>
      </section>
      <footer className="flex items-center justify-start h-16 px-4 bg-secondary">
        <Text>Made with ❤️ by aBgAmeuR. Harmony is an open source software.</Text>
      </footer>
    </main>
  );
}
