import { Icon, PackageIcon } from "@harmony/icons";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@harmony/ui/components/sidebar";
import { Link } from "@tanstack/react-router";

export function NavUploadCta() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<Link to="/upload" />}>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary`}
          >
            <Icon icon={PackageIcon} className="size-4" />
          </span>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Upload package</span>
            <span className="truncate text-xs text-muted-foreground">
              Import your listening history
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
