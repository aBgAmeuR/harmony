"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

import { useMounted } from "@/app/hooks/use-mounted";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const isMounted = useMounted();

  if (!isMounted) return <>{children}</>;

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
