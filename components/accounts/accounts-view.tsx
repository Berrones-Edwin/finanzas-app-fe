"use client"

import { useState } from "react"
import {
  Banknote,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  Power,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { AccountFormDialog } from "@/components/accounts/account-form-dialog"
import {
  useAccountBalances,
  useAccounts,
  useDeactivateAccount,
} from "@/lib/hooks/use-accounts"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import type { Account, AccountType } from "@/lib/types"

const TYPE_META: Record<
  AccountType,
  { label: string; icon: typeof Banknote }
> = {
  cash: { label: "Efectivo", icon: Banknote },
  bank: { label: "Banco", icon: Landmark },
  credit: { label: "Crédito", icon: CreditCard },
  savings: { label: "Ahorro", icon: PiggyBank },
}

export function AccountsView() {
  const { data: accounts, isLoading, isError, error } = useAccounts()
  const deactivateMut = useDeactivateAccount()

  const ids = (accounts ?? []).map((a) => a.id)
  const { byId: balances, isLoading: balancesLoading } =
    useAccountBalances(ids)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [toDeactivate, setToDeactivate] = useState<Account | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(account: Account) {
    setEditing(account)
    setFormOpen(true)
  }

  async function confirmDeactivate() {
    if (!toDeactivate) return
    try {
      await deactivateMut.mutateAsync(toDeactivate.id)
      toast.success("Cuenta desactivada.")
      setToDeactivate(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Cuentas"
        description="Tus cuentas y sus balances actuales."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva cuenta
          </Button>
        }
      />

      {isError && !isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {getApiErrorMessage(error)}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && accounts && accounts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no tienes cuentas. Crea la primera.
          </CardContent>
        </Card>
      )}

      {!isLoading && accounts && accounts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const meta = TYPE_META[account.type]
            const Icon = meta.icon
            const balance = balances.get(account.id)
            return (
              <Card key={account.id} className={account.isActive ? "" : "opacity-60"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-10 items-center justify-center rounded-lg text-primary-foreground"
                        style={{ backgroundColor: account.color }}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-medium leading-tight">
                          {account.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {meta.label} · {account.currency}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Abrir acciones</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(account)}>
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        {account.isActive && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setToDeactivate(account)}
                          >
                            <Power className="size-4" />
                            Desactivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Balance actual</p>
                  {balancesLoading && balance === undefined ? (
                    <Skeleton className="mt-1 h-8 w-28" />
                  ) : (
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {balance !== undefined
                        ? formatCurrency(balance, account.currency)
                        : "—"}
                    </p>
                  )}
                  {!account.isActive && (
                    <Badge variant="secondary" className="mt-3">
                      Inactiva
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AccountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editing}
      />

      <ConfirmDialog
        open={!!toDeactivate}
        onOpenChange={(o) => !o && setToDeactivate(null)}
        title="Desactivar cuenta"
        description={`¿Seguro que deseas desactivar "${toDeactivate?.name}"? Podrás seguir consultando su historial.`}
        confirmLabel="Desactivar"
        loading={deactivateMut.isPending}
        onConfirm={confirmDeactivate}
      />
    </>
  )
}
