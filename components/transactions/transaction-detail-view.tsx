"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CalendarDays, Receipt, Wallet } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransaction } from "@/lib/hooks/use-transactions"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"

export function TransactionDetailView() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, isLoading, isError, error } = useTransaction(id)

  if (isLoading) {
    return (
      <>
        <PageHeader title="Transacción" description="Detalle del movimiento." />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader title="Transacción" description="Detalle del movimiento." />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm font-medium">Transacción no encontrada</p>
            <p className="text-sm text-muted-foreground">
              {isError
                ? getApiErrorMessage(error)
                : `No existe una transacción con el id "${params.id}".`}
            </p>
            <Link
              href="/transactions"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft className="size-4" />
              Volver a transacciones
            </Link>
          </CardContent>
        </Card>
      </>
    )
  }

  const isIncome = data.transactionType === "INCOME"

  return (
    <>
      <PageHeader
        title={data.description}
        description="Detalle de la transacción."
        action={
          <Link
            href="/transactions"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 items-center justify-center rounded-lg text-primary-foreground"
                style={{ backgroundColor: data.category.color }}
              >
                <Receipt className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">
                  {isIncome ? "Ingreso" : "Gasto"}
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  ID {data.id}
                </p>
              </div>
            </div>
            <p
              className={
                isIncome
                  ? "text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400"
                  : "text-2xl font-semibold tabular-nums text-destructive"
              }
            >
              {isIncome ? "+" : "−"}
              {formatCurrency(data.amount, data.account.currency)}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Descripción
              </p>
              <p className="text-sm font-medium">{data.description}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tipo
              </p>
              <div>
                <Badge variant={isIncome ? "default" : "secondary"}>
                  {isIncome ? "Ingreso" : "Gasto"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Categoría
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: data.category.color }}
                  aria-hidden="true"
                />
                {data.category.name}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Cuenta
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Wallet className="size-4 text-muted-foreground" />
                {data.account.name}
                <span className="text-muted-foreground">
                  ({data.account.currency})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Fecha
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="size-4 text-muted-foreground" />
                {formatDate(data.date)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
