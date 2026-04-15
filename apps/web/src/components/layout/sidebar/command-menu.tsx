import { Button } from '@harmony/ui/components/button'
import { Kbd, KbdGroup } from '@harmony/ui/components/kbd'
import { useIsMac } from '@harmony/ui/hooks/use-is-mac'
import { cn } from '@harmony/ui/lib/utils';
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type CommandMenuProps = {
  className?: string
}

export function CommandMenu({ className }: CommandMenuProps) {
  const isMac = useIsMac()

  return (
      <Button variant="outline" className={cn("overflow-hidden", className)}>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        <span className="me-auto group-data-[collapsible=icon]:hidden">Search</span>
        <KbdGroup className="gap-1 group-data-[collapsible=icon]:hidden">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd className="aspect-square">K</Kbd>
        </KbdGroup>
      </Button>
  )
}
