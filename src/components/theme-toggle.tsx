"use client";

import * as React from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button, ButtonProps } from "@/components/ui/button";

export function ThemeToggle(props: ButtonProps) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
      {...props}
    >
      <SunMedium
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        size={18}
      />
      <Moon
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        size={18}
      />
    </Button>
  );
}
