import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@harmony/ui/components/resizable'
import { useDefaultLayout } from 'react-resizable-panels'
import type { PropsWithChildren } from 'react'
import { cookieStorage } from '@/lib/resizable-panels'

type CatalogPageShellRootProps = PropsWithChildren<{
  hasDetails: boolean
}>

export function CatalogPageShellRoot({ hasDetails, children }: CatalogPageShellRootProps) {
  const panelIds = hasDetails ? ['list-panel', 'details-panel'] : ['list-panel']

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: 'global-layout',
    panelIds,
    storage: cookieStorage,
  })

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-0 w-full h-svh!"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      {children}
    </ResizablePanelGroup>
  )
}

type CatalogPageShellListProps = PropsWithChildren<{}>

export function CatalogPageShellList({ children }: CatalogPageShellListProps) {
  return (
    <ResizablePanel id="list-panel" className="flex min-h-0 min-w-0 flex-col overflow-hidden!">
      {children}
    </ResizablePanel>
  )
}

type CatalogPageShellDetailsProps = PropsWithChildren<{
  open: boolean
}>

export function CatalogPageShellDetails({ open, children }: CatalogPageShellDetailsProps) {
  if (!open) {
    return null
  }

  return (
    <>
      <ResizableHandle />
      <ResizablePanel id="details-panel" defaultSize={300} minSize={300} maxSize={500}>
        {children}
      </ResizablePanel>
    </>
  )
}

