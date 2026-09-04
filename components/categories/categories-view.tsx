"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/shared/pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { useCategories, useDeleteCategory } from "@/lib/hooks/use-categories"
import { getApiErrorMessage } from "@/lib/api-client"
import type { Category } from "@/lib/types"

const PAGE_SIZE = 10

export function CategoriesView() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error } = useCategories({
    page,
    size: PAGE_SIZE,
  })
  const deleteMut = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!toDelete) return
    try {
      await deleteMut.mutateAsync(toDelete.id)
      toast.success("Categoría eliminada.")
      setToDelete(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const categories = data?.content ?? []

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Clasifica tus ingresos y gastos."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="w-12 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <p className="text-sm text-destructive">
                    {getApiErrorMessage(error)}
                  </p>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Aún no tienes categorías. Crea la primera.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        cat.categoryType === "INCOME" ? "default" : "secondary"
                      }
                    >
                      {cat.categoryType === "INCOME" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs uppercase text-muted-foreground">
                        {cat.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem onClick={() => openEdit(cat)}>
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setToDelete(cat)}
                        >
                          <Trash2 className="size-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Eliminar categoría"
        description={`¿Seguro que deseas eliminar "${toDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleteMut.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}
