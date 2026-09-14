"use client"

import { useEffect, useId, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Receipt,
  Target,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import {  buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
import { formatCurrency, formatDate } from "@/lib/format"
import type { FlowTypeApi } from "@/lib/types"
import { useCategory } from '@/lib/hooks/use-categories'
import { getApiErrorMessage } from '@/lib/api-client'
import { useBudgets } from '@/lib/hooks/use-budgets'
import { useTransactions } from '@/lib/hooks/use-transactions'



const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

type TypeFilter = "ALL" | FlowTypeApi

function formatBudgetMonth(value: string): string {
  const d = new Date(`${value}`)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(d)
}
const PAGE_SIZE = 25
export function CategoryDetailView() {
  const id = useId()
  const params = useParams<{ id: string }>()
  const { data, isLoading, error, isError } = useCategory(Number(params.id))

  const [pageBudgets, setPageBudgets] = useState(0)
  const [month, setMonth] = useState("ALL")
  const [year, setYear] = useState("ALL")
  const { data: budgets, isLoading: isLoadingBudgets, error: errorBudget, isError: isErrorBudget } = useBudgets(
    {
      page: pageBudgets,
      size: PAGE_SIZE
    },
    Number(params.id),
    month === "ALL" ? undefined : Number(month),
    year === "ALL" ? undefined : Number(year),
  )

  const years = useMemo(() => {
    const allYears = budgets?.content.map(y => new Date(y.month).getFullYear());
    const removeDuplicates = [... new Set(allYears)]
    return removeDuplicates;

  }, [])


  function handleBudgetMonth(value: string | null) {
    setMonth(value ?? "ALL")
    console.log({ value })
    setPageBudgets(0)
  }
  function handleBudgetYearChange(value: string | null) {
    setYear(value ?? "ALL")
    setPageBudgets(0)
  }

  const [txPage, setTxPage] = useState(0)
  const [txType, setTxType] = useState<TypeFilter>("ALL")
  const [txAccount, setTxAccount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const { data: transactions, isLoading: isLoadingTransactions, error: errorTransaction, isError: isErrorTransaction } = useTransactions(
    {
      page: txPage,
      size: PAGE_SIZE
    },
    Number(params.id),
    txType === "ALL" ? undefined : txType,
    txAccount === "ALL" ? undefined : Number(txAccount),
    startDate === "" ? undefined : startDate,
    endDate === "" ? undefined : endDate


  )

  const accountsIds = useMemo(() => {
    const ids = transactions?.content.map(t => t.account.id)
    return [...new Set(ids)]
  }, [])


  function handleTxAccount(value: string | null) {
    setTxAccount(value ?? "ALL")
    setTxPage(0)
  }
  function handleTxTypeChange(value: TypeFilter | null) {
    setTxType(value ?? "ALL")
    console.log(txType)
    setTxPage(0)
  }

  function handleStartDateChange(value: string) {
    setStartDate(value)
    console.log(startDate)
    setTxPage(0)
  }

  function handleEndDateChange(value: string) {
    setEndDate(value)
    console.log(endDate)
    setTxPage(0)
  }



  {
    isError && !isLoading && (
      <TableRow>
        <TableCell colSpan={4} className="py-10 text-center">
          <p className="text-sm text-destructive">
            {getApiErrorMessage(error)}
          </p>
        </TableCell>
      </TableRow>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm font-medium">Categoría no encontrada</p>
          <p className="text-sm text-muted-foreground">
            No existe una categoría con el id &quot;{params.id}&quot;.
          </p>
          <Link
            href="/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="size-4" />
            Volver a categorías
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <PageHeader
        title={data.name}
        description="Detalle de la categoría y sus movimientos."
        action={
          <Link
            href="/categories"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        }
      />

      <Card className="mb-8">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <span
              className="size-10 rounded-lg ring-1 ring-foreground/10"
              style={{ backgroundColor: data.color }}
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-semibold leading-tight">
                {data.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ID {data.id}
              </p>
            </div>
          </div>
          <Badge
            variant={
              data.categoryType === "INCOME" ? "default" : "secondary"
            }
          >
            {data.categoryType === "INCOME" ? "Ingreso" : "Gasto"}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            Creada el {formatDate(data.created_at)}
          </div>
          <span className="font-mono text-xs uppercase text-muted-foreground">
            {data.color}
          </span>
        </CardContent>
      </Card>

      {/* Transactions */}
      <section className="mb-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Receipt className="size-4 text-muted-foreground" />
            Transacciones
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={txType} onValueChange={handleTxTypeChange}>
              <SelectTrigger aria-label="Filtrar por tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value="INCOME">Ingreso</SelectItem>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
              </SelectContent>
            </Select>
            <Select value={txAccount} onValueChange={handleTxAccount}>
              <SelectTrigger aria-label="Filtrar por tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Cuentas Disponibles</SelectItem>
                {
                  accountsIds.map((a) => (

                    <SelectItem value={a} key={id} > {a}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <Input
              type="date"
              aria-label="Fecha inicial"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              aria-label="Fecha final"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                isErrorTransaction && !isLoadingTransactions && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      <p className="text-sm text-destructive">
                        {getApiErrorMessage(errorBudget)}
                      </p>
                    </TableCell>
                  </TableRow>
                )
              }

              {isLoadingTransactions &&
                Array.from({ length: 4 }).map((_, i) => (
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
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoadingTransactions && transactions?.content.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay transacciones con los filtros aplicados.
                  </TableCell>
                </TableRow>
              )}

              {!isLoadingTransactions &&
                transactions?.content.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.account.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.transactionType === "INCOME"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {t.transactionType === "INCOME" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          t.transactionType === "INCOME"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        }
                      >
                        {t.transactionType === "INCOME" ? "+" : "−"}
                        {formatCurrency(t.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>

        {!isLoadingTransactions && transactions && transactions?.totalPages > 0 && (
          <Pagination
            page={transactions.number}
            totalPages={transactions.totalPages}
            total={transactions.total}
            isFirst={transactions.first}
            isLast={transactions.last}
            onChange={setTxPage}
          />
        )}
      </section >

      {/* BUDGETS */}

      < section >
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Target className="size-4 text-muted-foreground" />
            Presupuestos
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* TO:DO */}
            <Select value={year} onValueChange={handleBudgetYearChange}>
              <SelectTrigger aria-label="Filtrar por año">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los años</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month} onValueChange={handleBudgetMonth}>
              <SelectTrigger aria-label="Filtrar por mes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los meses</SelectItem>
                {MONTH_LABELS.map((label, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Planificado</TableHead>
                <TableHead className="text-right">Gastado</TableHead>
                <TableHead className="text-right">Restante</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                isErrorBudget && !isLoadingBudgets && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      <p className="text-sm text-destructive">
                        {getApiErrorMessage(errorBudget)}
                      </p>
                    </TableCell>
                  </TableRow>
                )
              }


              {isLoadingBudgets &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoadingBudgets && budgets?.content.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay presupuestos con los filtros aplicados.
                  </TableCell>
                </TableRow>
              )}

              {!isLoadingBudgets &&
                budgets?.content.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatBudgetMonth(b.month)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(b.plannedAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(b.spentAmount)}
                    </TableCell>
                    <TableCell
                      className={
                        b.remainingAmount < 0
                          ? "text-right text-destructive"
                          : "text-right"
                      }
                    >
                      {formatCurrency(b.remainingAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={
                              b.percentageUsed >= 90
                                ? "h-full rounded-full bg-destructive"
                                : b.percentageUsed >= 70
                                  ? "h-full rounded-full bg-amber-500"
                                  : "h-full rounded-full bg-primary"
                            }
                            style={{
                              width: `${Math.min(b.percentageUsed, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-sm">
                          {b.percentageUsed.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {b.isAlertSent ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="size-3" />
                          Alerta
                        </Badge>
                      ) : (
                        <Badge variant="secondary">En orden</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>

        {
          !isLoadingBudgets && budgets && budgets?.totalPages > 0 && (
            <Pagination
              page={budgets.number}
              totalPages={budgets.totalPages}
              total={budgets.total}
              isFirst={budgets.first}
              isLast={budgets.last}
              onChange={setPageBudgets}
      
              />
          )
        }
      </section >
    </>
  )
}