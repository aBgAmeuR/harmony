import type { QueryClient } from "@tanstack/react-query";

import fontUrl from "@harmony/font/regular.woff2?url";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { Providers } from "@/app/providers";

import appCss from "../index.css?url";

export type RouterAppContext = {
  queryClient: QueryClient;
};

const RootDocument = () => (
  <html lang="en" className="dark scheme-only-dark">
    <head>
      <HeadContent />
    </head>
    <body className="grid h-svh grid-rows-[auto_1fr] antialiased">
      <Providers>
        <Outlet />
        <Scripts />
      </Providers>
    </body>
  </html>
);

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Harmony",
        description: "Harmony is a web app that helps you visualize your Spotify data.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preload", href: fontUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ],
  }),

  component: RootDocument,
});
