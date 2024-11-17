import { PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";

import { QueryClientProvider } from "./query-client-provider";
import { ThemeProvider } from "./theme-provider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider>{children}</QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};
