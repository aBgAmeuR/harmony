/* eslint-disable no-undef */
"use client";

import * as React from "react";
import { type DialogProps, DialogTitle } from "@radix-ui/react-dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@repo/ui/command";
import { File, Laptop, Moon, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { data as sidebarConfig } from "./navbar/sidebar-config";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div className="@container">
        <button
          className="border-input bg-background text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-8 @[150px]:h-9 w-full rounded-md border @[150px]:px-3 @[150px]:py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring hover:bg-background/80"
          onClick={() => setOpen(true)}
        >
          <span className="flex grow items-center justify-center @[150px]:justify-start">
            <Search
              className="text-muted-foreground/80 @[150px]:me-2"
              size={16}
              aria-hidden="true"
            />
            <span className="text-muted-foreground/70 font-normal @[150px]:block hidden">
              Search
            </span>
          </span>
          <kbd className="@[150px]:inline-flex hidden bg-background text-muted-foreground/70 ms-12 -me-1 h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
            ⌘K
          </kbd>
        </button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search Menu</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Links">
            {sidebarConfig.stats.map((navItem) => (
              <CommandItem
                key={navItem.url}
                value={navItem.title}
                onSelect={() => {
                  runCommand(() => router.push(navItem.url as string));
                }}
              >
                <File />
                {navItem.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {/* {sidebarConfig.package.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem) => (
                <CommandItem
                  key={navItem.href}
                  value={navItem.title}
                  onSelect={() => {
                    runCommand(() => router.push(navItem.href as string));
                  })}
                >
                  <div className="mr-2 flex size-4 items-center justify-center">
                    <Circle className="size-3" />
                  </div>
                  {navItem.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))} */}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
