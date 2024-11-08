import "./globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";

import { JotaiProvider } from "@/components/jotai-provider";
import { QueryClientProvider } from "@/components/query-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: "Harmony",
  description:
    "Harmony is a web app that helps you visualize your Spotify data."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Harmony" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        vaul-drawer-wrapper=""
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          <JotaiProvider>
            <SessionProvider>
              <QueryClientProvider>{children}</QueryClientProvider>
            </SessionProvider>
          </JotaiProvider>
        </ThemeProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
