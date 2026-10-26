"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Plus, Receipt, X } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/shared/pagination"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useCategories } from "@/lib/hooks/use-categories"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"
import type { FlowTypeApi } from "@/lib/types"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10
const ALL = "ALL"

type TypeFilter = typeof ALL | FlowTypeApi

export function TransactionsView() {
  const [page, setPage] = useState(0)
  const [type, setType] = useState<TypeFilter>(ALL)
  const [accountId, setAccountId] = useState<string>(ALL)
  const [categoryId, setCategoryId] = useState<string>(ALL)
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")

  const [formOpen, setFormOpen] = useState(false)

  const { data: accountsData } = useAccounts({ page: 0, size: 100 })
  const { data: categoriesData } = useCategories({ page: 0, size: 100 })
  const accounts = accountsData?.content ?? []
  const categories = categoriesData?.content ?? []

  const {
    data,
    isLoading,
    isError,
    error,
  } = useTransactions(
    { page, size: PAGE_SIZE },
    categoryId === ALL ? undefined : Number(categoryId),
    type === ALL ? undefined : type,
    accountId === ALL ? undefined : Number(accountId),
    start || undefined,
    end || undefined,
  )

  const transactions = data?.content ?? []

  const hasFilters =
    type !== ALL ||
    accountId !== ALL ||
    categoryId !== ALL ||
    start !== "" ||
    end !== ""

  function clearFilters() {
    setType(ALL)
    setAccountId(ALL)
    setCategoryId(ALL)
    setStart("")
    setEnd("")
    setPage(0)
  }

  return (
    <>
      <PageHeader
        title="Transacciones"
        description="Registra y consulta tus ingresos y gastos."
        action={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Nueva transacción
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as TypeFilter)
                setPage(0)
              }}
            >
              <SelectTrigger id="filter-type" aria-label="Filtrar por tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos los tipos</SelectItem>
                <SelectItem value="INCOME">Ingreso</SelectItem>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-account">Cuenta</Label>
            <Select
              value={accountId}
              onValueChange={(value) => {
                setAccountId(value ?? ALL)
                setPage(0)
              }}
            >
              <SelectTrigger id="filter-account" aria-label="Filtrar por cuenta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las cuentas</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-category">Categoría</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value ?? ALL)
                setPage(0)
              }}
            >
              <SelectTrigger
                id="filter-category"
                aria-label="Filtrar por categoría"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las categorías</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-start">Desde</Label>
            <Input
              id="filter-start"
              type="date"
              value={start}
              max={end || undefined}
              onChange={(e) => {
                setStart(e.target.value)
                setPage(0)
              }}
              className="w-40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-end">Hasta</Label>
            <Input
              id="filter-end"
              type="date"
              value={end}
              min={start || undefined}
              onChange={(e) => {
                setEnd(e.target.value)
                setPage(0)
              }}
              className="w-40"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="size-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <p className="text-sm text-destructive">
                    {getApiErrorMessage(error)}
                  </p>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Receipt className="size-6" aria-hidden="true" />
                    <p className="text-sm">
                      {hasFilters
                        ? "No hay transacciones con los filtros aplicados."
                        : "Aún no tienes transacciones. Registra la primera."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">
                    {t.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.account.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: t.category.color }}
                        aria-hidden="true"
                      />
                      <span>{t.category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.transactionType === "INCOME" ? "default" : "secondary"
                      }
                    >
                      {t.transactionType === "INCOME" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        t.transactionType === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive",
                      )}
                    >
                      {t.transactionType === "INCOME" ? "+" : "−"}
                      {formatCurrency(t.amount, t.account.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/transactions/${t.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon",
                      })}
                      aria-label={`Ver transacción ${t.id}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.totalPages > 0 && (
        <Pagination
          page={data.number}
          totalPages={data.totalPages}
          total={data.total}
          isFirst={data.first}
          isLast={data.last}
          onChange={setPage}
        />
      )}

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
