import { Icons } from "@/components/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@harmony/ui/components/sidebar";

export function NavBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="h-10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Icons.logo className="size-8!" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="scroll-m-20 truncate text-xl font-bold tracking-tight text-balance text-foreground">
              Harmony
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
