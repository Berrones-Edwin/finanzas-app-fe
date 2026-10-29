"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowRightLeft, CalendarDays, Wallet } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransfer } from "@/lib/hooks/use-transfers"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"

export function TransferDetailView() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const { data, isLoading, isError, error } = useTransfer(id)

  if (isLoading) {
    return (
      <>
        <PageHeader title="Transferencia" description="Detalle del movimiento." />
        <Card><CardContent className="flex flex-col gap-4"><Skeleton className="h-6 w-48" /><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-64" /></CardContent></Card>
      </>
    )
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader title="Transferencia" description="Detalle del movimiento." />
        <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm font-medium">Transferencia no encontrada</p>
          <p className="text-sm text-muted-foreground">{isError ? getApiErrorMessage(error) : `No existe una transferencia con el id "${params.id}".`}</p>
          <Link href="/transfers" className={buttonVariants({ variant: "outline" })}><ArrowLeft className="size-4" />Volver a transferencias</Link>
        </CardContent></Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title={data.description || "Transferencia"} description="Detalle del movimiento." action={
        <Link href="/transfers" className={buttonVariants({ variant: "outline" })}><ArrowLeft className="size-4" />Volver</Link>
      } />

      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ArrowRightLeft className="size-5" /></span>
              <div><p className="text-xs text-muted-foreground">Transferencia</p><p className="font-mono text-sm text-muted-foreground">ID {data.id}</p></div>
            </div>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(data.amount)}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem label="Cuenta origen" value={data.fromAccount.name} color={data.fromAccount.color} />
            <DetailItem label="Cuenta destino" value={data.toAccount.name} color={data.toAccount.color} />
            <div className="flex flex-col gap-1"><p className="text-xs text-muted-foreground">Descripción</p><p className="text-sm font-medium">{data.description || "Sin descripción"}</p></div>
            <div className="flex flex-col gap-1"><p className="text-xs text-muted-foreground">Fecha</p><div className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="size-4 text-muted-foreground" />{formatDate(data.date)}</div></div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function DetailItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 text-sm font-medium"><span className="size-3 rounded-full border border-border" style={{ backgroundColor: color }} /><Wallet className="size-4 text-muted-foreground" />{value}</div>
    </div>
  )
}
