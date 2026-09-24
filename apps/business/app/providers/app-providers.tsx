"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XpoUiProvider } from "@xpomag/ui/provider";
import { useState, type ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <XpoUiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </XpoUiProvider>
  );
}
