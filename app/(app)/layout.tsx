import type { ReactNode } from "react"
import { AuthGate } from "@/components/auth/auth-gate"
import { AppShell } from "@/components/layout/app-shell"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

// ============================================================================
// Layout for all authenticated routes. Guards access then renders the shell.
// ============================================================================

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  )
}
