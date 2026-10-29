"use client"

import { useState } from "react"
import { AlertTriangle, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Pagination } from "@/components/shared/pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getApiErrorMessage } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { useDeleteBudget, useBudgets } from "@/lib/hooks/use-budgets"
import { useCategories } from "@/lib/hooks/use-categories"
import type { BudgetResponse } from "@/lib/types"

const PAGE_SIZE = 10
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function formatBudgetMonth(value: string): string {
  const date = new Date(`${value.slice(0, 7)}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(date)
}

export function BudgetsView() {
  const [page, setPage] = useState(0)
  const [categoryId, setCategoryId] = useState<number>()
  const [month, setMonth] = useState<number>()
  const [year, setYear] = useState<number>()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetResponse | null>(null)
  const [toDelete, setToDelete] = useState<BudgetResponse | null>(null)

  const budgetsQuery = useBudgets({
    page,
    size: PAGE_SIZE,
    categoryId,
    month,
    year,
  })
  const categoriesQuery = useCategories({ page: 0, size: 100 })
  const deleteMutation = useDeleteBudget()

  const budgets = budgetsQuery.data?.content ?? []
  const categories = categoriesQuery.data?.content ?? []
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(budget: BudgetResponse) {
    setEditing(budget)
    setFormOpen(true)
  }

  function resetPage() {
    setPage(0)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteMutation.mutateAsync(toDelete.id)
      toast.success("Presupuesto eliminado.")
      setToDelete(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Presupuestos"
        description="Administra los límites de gasto por categoría."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo presupuesto
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select
          value={categoryId ? String(categoryId) : "ALL"}
          onValueChange={(value) => {
            setCategoryId(value === "ALL" ? undefined : Number(value))
            resetPage()
          }}
        >
          <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={month ? String(month) : "ALL"}
          onValueChange={(value) => {
            setMonth(value === "ALL" ? undefined : Number(value))
            resetPage()
          }}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filtrar por mes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los meses</SelectItem>
            {MONTHS.map((name, index) => (
              <SelectItem key={index + 1} value={String(index + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year ? String(year) : "ALL"}
          onValueChange={(value) => {
            setYear(value === "ALL" ? undefined : Number(value))
            resetPage()
          }}
        >
          <SelectTrigger className="sm:w-36" aria-label="Filtrar por año">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los años</SelectItem>
            {years.map((value) => (
              <SelectItem key={value} value={String(value)}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {budgetsQuery.isError && !budgetsQuery.isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {getApiErrorMessage(budgetsQuery.error)}
          </CardContent>
        </Card>
      )}

      {budgetsQuery.isLoading && (
        <Card className="p-0">
          <Table>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((__, column) => (
                    <TableCell key={column}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {!budgetsQuery.isLoading && !budgetsQuery.isError && budgets.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay presupuestos con los filtros aplicados.
          </CardContent>
        </Card>
      )}

      {!budgetsQuery.isLoading && !budgetsQuery.isError && budgets.length > 0 && (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Planificado</TableHead>
                <TableHead className="text-right">Gastado</TableHead>
                <TableHead className="text-right">Restante</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{budget.category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatBudgetMonth(budget.month)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(budget.plannedAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(budget.spentAmount)}</TableCell>
                  <TableCell className={budget.remainingAmount < 0 ? "text-right text-destructive" : "text-right"}>
                    {formatCurrency(budget.remainingAmount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-32 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={budget.percentageUsed >= 90 ? "h-full bg-destructive" : budget.percentageUsed >= 70 ? "h-full bg-amber-500" : "h-full bg-primary"}
                          style={{ width: `${Math.min(Math.max(budget.percentageUsed, 0), 100)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right tabular-nums text-sm">{budget.percentageUsed.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {budget.isAlertSent ? (
                      <Badge variant="destructive"><AlertTriangle className="size-3" />Alerta</Badge>
                    ) : (
                      <Badge variant="secondary">En orden</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /><span className="sr-only">Abrir acciones</span></Button>}
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(budget)}>
                          <Pencil className="size-4" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setToDelete(budget)}>
                          <Trash2 className="size-4" />Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {budgetsQuery.data && budgetsQuery.data.totalPages > 0 && (
        <Pagination
          page={budgetsQuery.data.number}
          totalPages={budgetsQuery.data.totalPages}
          total={budgetsQuery.data.total}
          isFirst={budgetsQuery.data.first}
          isLast={budgetsQuery.data.last}
          onChange={setPage}
        />
      )}

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={editing}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminar presupuesto"
        description={toDelete ? `Se eliminará el presupuesto de ${toDelete.category.name} para ${formatBudgetMonth(toDelete.month)}.` : ""}
        confirmLabel="Eliminar"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}
