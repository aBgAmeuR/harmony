import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@harmony/ui/components/sidebar";

import { useAppLinkAdapter } from "./app-link.adapter";
import { appNav } from "./app-nav.config";
import { NavBrand } from "./ui/nav-brand";
import { NavFooter } from "./ui/nav-footer";
import { NavSearch } from "./ui/nav-search";
import { NavSection } from "./ui/nav-section";

export function AppNav() {
  const link = useAppLinkAdapter();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavSearch />
        <NavSection items={appNav.main} link={link} />
        <NavSection items={appNav.library} title="Library" link={link} />
        <NavSection items={appNav.insights} title="Insights" link={link} />
        <NavSection items={appNav.social} title="Social" link={link} />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter items={appNav.secondary} link={link} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
