"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

// ============================================================================
// React Query provider. Created once per client via useState so the cache
// survives re-renders but is never shared across requests on the server.
// ============================================================================

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
