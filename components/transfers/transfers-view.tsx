"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightLeft, Eye, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/shared/pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { TransferFormDialog } from "@/components/transfers/transfer-form-dialog"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useDeleteTransfer, useTransfers } from "@/lib/hooks/use-transfers"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"
import type { TransferResponse } from "@/lib/types"

const PAGE_SIZE = 10
const ALL = "ALL"

export function TransfersView() {
  const [page, setPage] = useState(0)
  const [accountId, setAccountId] = useState<string>(ALL)
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [toDelete, setToDelete] = useState<TransferResponse | null>(null)

  const { data: accountsData } = useAccounts({ page: 0, size: 100 })
  const accounts = accountsData?.content.filter((account) => account.isActive) ?? []
  const { data, isLoading, isError, error } = useTransfers({
    page,
    size: PAGE_SIZE,
    accountId: accountId === ALL ? undefined : Number(accountId),
    start: start || undefined,
    end: end || undefined,
  })
  const deleteMutation = useDeleteTransfer()

  const transfers = data?.content ?? []
  const hasFilters = accountId !== ALL || start !== "" || end !== ""

  function clearFilters() {
    setAccountId(ALL)
    setStart("")
    setEnd("")
    setPage(0)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success("Transferencia eliminada.")
      setToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Transferencias"
        description="Mueve dinero entre tus cuentas."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Nueva transferencia
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-transfer-account">Cuenta</Label>
            <Select value={accountId} onValueChange={(value) => { setAccountId(value ?? ALL); setPage(0) }}>
              <SelectTrigger id="filter-transfer-account" aria-label="Filtrar por cuenta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las cuentas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-transfer-start">Desde</Label>
            <Input id="filter-transfer-start" type="date" value={start} max={end || undefined} className="w-40" onChange={(event) => { setStart(event.target.value); setPage(0) }} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-transfer-end">Hasta</Label>
            <Input id="filter-transfer-end" type="date" value={end} min={start || undefined} className="w-40" onChange={(event) => { setEnd(event.target.value); setPage(0) }} />
          </div>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters}><X className="size-4" />Limpiar filtros</Button>
          )}
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>{Array.from({ length: 6 }).map((__, cellIndex) => <TableCell key={cellIndex}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
            ))}

            {isError && !isLoading && (
              <TableRow><TableCell colSpan={6} className="py-10 text-center"><p className="text-sm text-destructive">{getApiErrorMessage(error)}</p></TableCell></TableRow>
            )}

            {!isLoading && !isError && transfers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ArrowRightLeft className="size-6" aria-hidden="true" />
                    <p className="text-sm">{hasFilters ? "No hay transferencias con los filtros aplicados." : "Aún no tienes transferencias. Registra la primera."}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="whitespace-nowrap">{formatDate(transfer.date)}</TableCell>
                <TableCell className="max-w-xs truncate font-medium">{transfer.description}</TableCell>
                <TableCell><AccountLabel transferAccount={transfer.fromAccount} /></TableCell>
                <TableCell><AccountLabel transferAccount={transfer.toAccount} /></TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatCurrency(transfer.amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/transfers/${transfer.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label={`Ver transferencia ${transfer.id}`}><Eye className="size-4" /></Link>
                    <Button variant="ghost" size="icon" aria-label={`Eliminar transferencia ${transfer.id}`} onClick={() => setToDelete(transfer)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.totalPages > 0 && (
        <Pagination page={data.number} totalPages={data.totalPages} total={data.total} isFirst={data.first} isLast={data.last} onChange={setPage} />
      )}

      <TransferFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminar transferencia"
        description={toDelete ? `¿Seguro que deseas eliminar la transferencia de ${formatCurrency(toDelete.amount)}?` : "¿Seguro que deseas eliminar esta transferencia?"}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

function AccountLabel({ transferAccount }: { transferAccount: { name: string; color: string } }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-full border border-border" style={{ backgroundColor: transferAccount.color }} aria-hidden="true" />
      <span>{transferAccount.name}</span>
    </div>
  )
}
