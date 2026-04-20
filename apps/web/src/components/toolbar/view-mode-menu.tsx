import { Button } from '@harmony/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@harmony/ui/components/dropdown-menu'
import { LayoutGridIcon, Menu01Icon, SlidersHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type ViewMode, useUserPreferencesStore } from '@/lib/store'

export function ViewModeMenu() {
  const viewMode = useUserPreferencesStore((s) => s.viewMode)
  const setViewMode = useUserPreferencesStore((s) => s.setViewMode)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-4" />
          Display
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-28">
        <DropdownMenuGroup>
          <DropdownMenuLabel>View Mode</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={viewMode}
            onValueChange={(next) => setViewMode(next as ViewMode)}
          >
            <DropdownMenuRadioItem value="grid">
              <HugeiconsIcon icon={LayoutGridIcon} className="size-4" />
              Grid
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="list">
              <HugeiconsIcon icon={Menu01Icon} className="size-4" />
              List
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
