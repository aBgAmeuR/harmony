import { TooltipProvider } from "@harmony/ui/components/tooltip";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import appCss from "../index.css?url";

export const Route = createRootRouteWithContext()({
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
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="dark scheme-only-dark">
      <head>
        <HeadContent />
      </head>
      <body className="grid h-svh grid-rows-[auto_1fr] antialiased">
        <TooltipProvider>
          <Outlet />
          <Scripts />
        </TooltipProvider>
      </body>
    </html>
  );
}
