import type { ReactNode } from "react"
import { AuthGate } from "@/components/auth/auth-gate"
import { AppShell } from "@/components/layout/app-shell"

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
