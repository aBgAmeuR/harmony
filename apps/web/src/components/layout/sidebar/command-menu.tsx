import { Icon, Search01Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Kbd, KbdGroup } from "@harmony/ui/components/kbd";
import { SidebarGroup } from "@harmony/ui/components/sidebar";
import { useIsMac } from "@harmony/ui/hooks/use-is-mac";

export function CommandMenu() {
  const isMac = useIsMac();

  return (
    <SidebarGroup>
      <Button variant="outline" className="gap-2 overflow-hidden px-2">
        <Icon icon={Search01Icon} strokeWidth={2} />
        <span className="me-auto group-data-[collapsible=icon]:hidden">Search</span>
        <KbdGroup className="gap-0.5 group-data-[collapsible=icon]:hidden">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd className="aspect-square">K</Kbd>
        </KbdGroup>
      </Button>
    </SidebarGroup>
  );
}
