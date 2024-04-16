import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ColorSchemeScript } from "@mantine/core";
import { Nunito } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Harmony",
  description: "Harmony is a web app that helps you visualize your Spotify data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={nunito.className + 'relative bg-primary min-h-screen'}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
