"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/collapsible";
import { Separator } from "@repo/ui/separator";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui/sidebar";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import { usePathname, useRouter } from "next/navigation";
import { Link } from "next-view-transitions";

type Item = {
  title: string;
  url: string;
  anotherUrl?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
};

type NavMainProps = {
  label: string;
  items: Item[];
  disable?: boolean;
};

export function NavMain({ label, items, disable }: NavMainProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={
              item.isActive || item.items?.some((i) => i.url === pathname)
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={
                      !open &&
                      !isMobile &&
                      (item.isActive ||
                        item.items.some((i) => i.url === pathname))
                    }
                    tooltip={{
                      children: (
                        <>
                          <div className="px-2 py-1">
                            <p className="text-sm">{item.title}</p>
                          </div>
                          <Separator className="mb-1" />
                          {item.items.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.title}
                              isActive={subItem.url === pathname}
                              asChild
                              size="sm"
                              className="group-data-[collapsible=icon]:!size-auto"
                            >
                              {!disable ? (
                                <Link
                                  href={subItem.url}
                                  onMouseEnter={() => {
                                    router.prefetch(item.url, {
                                      kind: PrefetchKind.FULL,
                                    });
                                  }}
                                >
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.title}</span>
                                </Link>
                              ) : (
                                <div>
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.title}</span>
                                </div>
                              )}
                            </SidebarMenuButton>
                          ))}
                        </>
                      ),
                      className: "p-1 min-w-32",
                    }}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={
                    item.url === pathname || item.anotherUrl === pathname
                  }
                >
                  {!disable ? (
                    <a
                      onMouseEnter={() => {
                        router.prefetch(item.url, {
                          kind: PrefetchKind.FULL,
                        });
                      }}
                      onClick={() => {
                        router.push(item.url);
                      }}
                      className="cursor-pointer"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <div>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              )}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.url}
                      >
                        {!disable ? (
                          <a
                            onMouseEnter={() => {
                              router.prefetch(subItem.url, {
                                kind: PrefetchKind.FULL,
                              });
                            }}
                            onClick={() => {
                              router.push(subItem.url);
                            }}
                            className="cursor-pointer"
                          >
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </a>
                        ) : (
                          <div>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </div>
                        )}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
