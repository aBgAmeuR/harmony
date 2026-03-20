import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '@harmony/ui/globals.css?url'
import fontsCss from '../styles/fonts.css?url'
import { TooltipProvider } from '@harmony/ui/components/tooltip'
import { queryClient } from '@/lib/api'
import { QueryClientProvider } from '@tanstack/react-query'

export const Route = createRootRoute({
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
            <Scripts />
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
