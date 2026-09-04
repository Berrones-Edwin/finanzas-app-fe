"use client"

import Link from "next/link"
import { ListTree, Wallet } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useAuth } from "@/components/providers/auth-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <>
      <PageHeader
        title={`Hola, ${user?.name?.split(" ")[0] ?? ""}`}
        description="Este es el resumen de tu actividad financiera."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/accounts">
          <Card className="transition-colors hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Wallet className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="text-base">Cuentas</CardTitle>
                  <CardDescription>
                    Administra tus cuentas y balances
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/categories">
          <Card className="transition-colors hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ListTree className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="text-base">Categorías</CardTitle>
                  <CardDescription>
                    Organiza tus ingresos y gastos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card className="mt-4">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Los gráficos analíticos del dashboard (resumen del mes, gastos por
          categoría y tendencias) se conectarán a los endpoints{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            /api/dashboard/*
          </code>{" "}
          en el siguiente módulo.
        </CardContent>
      </Card>
    </>
  )
}
