"use client"

import { useState } from "react"
import { ArrowDownRight, ArrowUpRight, Scale, TrendingUp, RotateCcw } from "lucide-react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import {
    useDashboardByAccount,
    useDashboardByCategory,
    useDashboardMonthlyTrends,
    useDashboardSummary,
} from "@/lib/hooks/use-dashboard"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getStartDate, getCurrentDate, toInputDate, toBackendDate } from '@/lib/utils'

function SectionError() {
    return (
        <div className="flex min-h-48 items-center justify-center text-sm text-destructive">
            No fue posible cargar esta información.
        </div>
    )
}

function EmptySection({ message = "No hay datos para el período seleccionado." }: { message?: string }) {
    return (
        <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
            {message}
        </div>
    )
}

export function DashboardView() {
    const [start, setStart] = useState(getStartDate())
    const [end, setEnd] = useState(getCurrentDate())

    const summaryQuery = useDashboardSummary(start || undefined, end || undefined)
    const categoryQuery = useDashboardByCategory(start || undefined, end || undefined)
    const trendsQuery = useDashboardMonthlyTrends(start || undefined, end || undefined)
    const accountQuery = useDashboardByAccount(start || undefined, end || undefined)

    const summary = summaryQuery.data
    const categories = categoryQuery.data ?? []
    const trends = trendsQuery.data ?? []
    const accounts = accountQuery.data ?? []

    const trendData = trends.map((item) => {
        const source = item.month || item.yearmonth
        const date = source ? new Date(source) : null
        const label = date && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit" }).format(date)
            : "Mes"

        return {
            label,
            ingresos: item.income,
            gastos: item.expense,
        }
    })

    const summaryCards = summary
        ? [
            { title: "Ingresos", value: summary.income, icon: ArrowUpRight, color: "text-chart-2" },
            { title: "Gastos", value: summary.expenses, icon: ArrowDownRight, color: "text-chart-4" },
            { title: "Balance", value: summary.balance, icon: Scale, color: "text-chart-1" },
            { title: "Tasa de ahorro", value: summary.savingsRate, icon: TrendingUp, color: "text-chart-3", percent: true },
        ]
        : []

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Período</CardTitle>
                    <CardDescription>Filtra los indicadores y las gráficas por fecha.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dashboard-start">Desde</Label>
                            <Input
                                id="dashboard-start"
                                type="date"
                                value={toInputDate(start)}
                                max={end ? toInputDate(end) : undefined}
                                onChange={(event) => setStart(toBackendDate(event.target.value))}
                                className="w-40"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dashboard-end">Hasta</Label>
                            <Input
                                id="dashboard-end"
                                type="date"
                                value={toInputDate(end)}
                                min={start ? toInputDate(start) : undefined}
                                onChange={(event) => setEnd(toBackendDate(event.target.value))}
                                className="w-40"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStart(getStartDate())
                                setEnd(getCurrentDate())
                            }}
                            disabled={!start && !end}
                        >
                            <RotateCcw className="size-4" />
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {summaryQuery.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
                </div>
            ) : summaryQuery.isError ? (
                <Card><CardContent><SectionError /></CardContent></Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <Card key={card.title}>
                                <CardContent className="flex items-center justify-between py-5">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">{card.title}</p>
                                        <p className="text-xl font-semibold tabular-nums">
                                            {card.percent ? `${Number(card.value).toFixed(2)}%` : formatCurrency(Number(card.value))}
                                        </p>
                                    </div>
                                    <Icon className={`size-5 ${card.color}`} aria-hidden="true" />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Tendencias mensuales</CardTitle>
                    <CardDescription>Ingresos y gastos por mes dentro del período.</CardDescription>
                </CardHeader>
                <CardContent>
                    {trendsQuery.isLoading ? (
                        <Skeleton className="h-72 w-full" />
                    ) : trendsQuery.isError ? (
                        <SectionError />
                    ) : trendData.length === 0 ? (
                        <EmptySection />
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                                    <CartesianGrid stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                                    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="var(--chart-2)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="gastos" name="Gastos" stroke="var(--chart-4)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Por categoría</CardTitle>
                        <CardDescription>Distribución de movimientos por categoría.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryQuery.isLoading ? (
                            <Skeleton className="h-72 w-full" />
                        ) : categoryQuery.isError ? (
                            <SectionError />
                        ) : categories.length === 0 ? (
                            <EmptySection />
                        ) : (
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categories} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                                        <CartesianGrid stroke="var(--border)" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} />
                                        <YAxis type="category" dataKey="categoryName" width={90} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Bar dataKey="amount" name="Monto" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Por cuenta</CardTitle>
                        <CardDescription>Distribución de movimientos por cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {accountQuery.isLoading ? (
                            <Skeleton className="h-72 w-full" />
                        ) : accountQuery.isError ? (
                            <SectionError />
                        ) : accounts.length === 0 ? (
                            <EmptySection />
                        ) : (
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={accounts} margin={{ top: 8, right: 8, left: 8, bottom: 48 }}>
                                        <CartesianGrid stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="accountName" angle={-35} textAnchor="end" interval={0} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                                        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(value) => formatCurrency(Number(value))} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Bar dataKey="amount" name="Monto" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
