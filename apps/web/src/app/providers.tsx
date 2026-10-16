import type { PropsWithChildren } from "react";

import { TooltipProvider } from "@harmony/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./query-client";

export const Providers = ({ children }: PropsWithChildren) => (
  <TooltipProvider>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </TooltipProvider>
);
