import { TooltipProvider } from "@harmony/ui/components/tooltip";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { queryClient } from "@/lib/query-client";

import appCss from "../index.css?url";
import { getPublicConfig } from "@/lib/public-config";

export interface RouterAppContext {
  queryClient: QueryClient;
  config: Awaited<ReturnType<typeof getPublicConfig>>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async () => {
    const config = await getPublicConfig();
    return { config };
  },
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
          <QueryClientProvider client={queryClient}>
            <Outlet />

            {/* <TanStackRouterDevtools position="bottom-left" /> */}
            <Scripts />
          </QueryClientProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
