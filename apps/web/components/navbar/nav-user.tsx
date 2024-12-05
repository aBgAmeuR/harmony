"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Input } from "@repo/ui/input";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar";
import { ChevronsUpDown, LogOut, Moon, SunMedium } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

// import { deleteUserAction } from "@/actions/user/delete-user-action";

type NavUserProps = {
  user: User;
};

export function NavUser({ user }: NavUserProps) {
  const { setTheme, theme } = useTheme();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirmation === user.name) {
      // await deleteUserAction();
      await signOut({
        callbackUrl: "/",
      });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback className="rounded-lg">
                    {(user.name || user.id)?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  {/* <span className="truncate text-xs">{user.email}</span> */}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="mx-2 w-[271px] rounded-lg shadow-none"
              side="bottom"
              align="center"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback className="rounded-lg">
                      {(user.name || user.id)?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    {/* <span className="truncate text-xs">{user.email}</span> */}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Button
                  className="flex w-full cursor-pointer items-center justify-start"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/",
                    })
                  }
                >
                  <LogOut />
                  Log out
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Preferences
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="flex w-full cursor-pointer items-center justify-between"
                  variant="ghost"
                  size="sm"
                >
                  Theme
                  {theme === "dark" ? (
                    <Moon size={18} />
                  ) : (
                    <SunMedium size={18} />
                  )}
                </Button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem asChild>
                  <Button
                    className="w-full cursor-pointer focus:bg-destructive/90 focus-visible:ring-transparent"
                    variant="destructive"
                    size="sm"
                  >
                    Delete account
                  </Button>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                To confirm, please type your nickname:{" "}
                <span className="font-semibold">{user.name}</span>
              </p>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Enter your nickname"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== user.name}
              >
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
