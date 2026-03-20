import { Button } from '@harmony/ui/components/button'
import { Kbd, KbdGroup } from '@harmony/ui/components/kbd'
import { SidebarGroup } from '@harmony/ui/components/sidebar'
import { useIsMac } from '@harmony/ui/hooks/use-is-mac'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function CommandMenu() {
  const isMac = useIsMac()

  return (
    <SidebarGroup>
      <Button variant="outline" className="overflow-hidden">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        <span className="me-auto group-data-[collapsible=icon]:hidden">Search</span>
        <KbdGroup className="gap-1 group-data-[collapsible=icon]:hidden">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd className="aspect-square">K</Kbd>
        </KbdGroup>
      </Button>
    </SidebarGroup>
  )
}
