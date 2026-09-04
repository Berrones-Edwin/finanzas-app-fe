"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeftRight,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Wallet,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { getApiErrorMessage } from "@/lib/api-client"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
  { href: "/categories", label: "Categorías", icon: ListTree },
  { href: "/transactions", label: "Transacciones", icon: Receipt },
  { href: "/transfers", label: "Transferencias", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: PiggyBank },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
      toast.success("Sesión cerrada.")
      router.replace("/login")
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?"

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Finanzas</span>
        </div>
        {navContent}
        <SidebarFooter
          name={user?.name ?? ""}
          email={user?.email ?? ""}
          initials={initials}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wallet className="size-4" aria-hidden="true" />
                </span>
                <span className="text-lg font-semibold">Finanzas</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            {navContent}
            <SidebarFooter
              name={user?.name ?? ""}
              email={user?.email ?? ""}
              initials={initials}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-5" />
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.currency}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {initials}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarFooter({
  name,
  email,
  initials,
  onLogout,
}: {
  name: string
  email: string
  initials: string
  onLogout: () => void
}) {
  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sm font-medium text-sidebar-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        className="mt-1 w-full justify-start gap-3 text-sidebar-foreground/70"
        onClick={onLogout}
      >
        <LogOut className="size-4" aria-hidden="true" />
        Cerrar sesión
      </Button>
    </div>
  )
}
