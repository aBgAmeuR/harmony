import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'

import appCss from '@harmony/ui/globals.css?url'
import '@bprogress/core/css?url'
import { TooltipProvider } from '@harmony/ui/components/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import fontsCss from '../styles/fonts.css?url'
import type { QueryClient } from '@tanstack/react-query'
import type { api } from '@/lib/api'
import { queryClient } from '@/lib/api'
import { RouterProgress } from '@/components/router-progress'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  api: typeof api
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Harmony',
        description: 'Harmony is a web app that helps you visualize your Spotify data.',
      },
    ],
    links: [
      {
        rel: 'preload',
        href: '/SpotifyMix-Regular.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/SpotifyMix-Bold.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/SpotifyMix-Extrabold.ttf',
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: fontsCss,
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scheme-only-dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <RouterProgress />
            {children}
            <Scripts />
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
