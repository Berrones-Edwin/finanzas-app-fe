"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api-client"
import {
  useCreateBudget,
  useUpdateBudget,
} from "@/lib/hooks/use-budgets"
import { useCategories } from "@/lib/hooks/use-categories"
import type { BudgetResponse } from "@/lib/types"
import {
  budgetCreateSchema,
  budgetUpdateSchema,
} from "@/lib/validation"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: BudgetResponse | null
}

type CreateFormData = z.infer<typeof budgetCreateSchema>
type UpdateFormData = z.infer<typeof budgetUpdateSchema>

export function BudgetFormDialog({ open, onOpenChange, budget }: Props) {
  const isEdit = !!budget
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const categoriesQuery = useCategories({ page: 0, size: 100 })
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(budgetCreateSchema),
    defaultValues: {
      categoryId: 0,
      month: "",
      amount: 0,
      alertThreshold: undefined,
      notes: "",
    },
  })

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(budgetUpdateSchema),
    defaultValues: {
      amount: 0,
      alertThreshold: undefined,
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) return

    if (budget) {
      updateForm.reset({
        amount: budget.plannedAmount,
        alertThreshold: budget.alertThreshold ?? undefined,
        notes: "",
      })
    } else {
      createForm.reset({
        categoryId: 0,
        month: "",
        amount: 0,
        alertThreshold: undefined,
        notes: "",
      })
    }
  }, [open, budget, createForm, updateForm])

  async function submitCreate(data: CreateFormData) {
    try {
      await createMutation.mutateAsync({
        categoryId: data.categoryId,
        month: `${data.month}-01`,
        amount: data.amount,
        alertThreshold: data.alertThreshold,
        notes: data.notes?.trim() || undefined,
      })
      toast.success("Presupuesto creado.")
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  async function submitUpdate(data: UpdateFormData) {
    if (!budget) return

    try {
      await updateMutation.mutateAsync({
        id: budget.id,
        payload: {
          amount: data.amount,
          alertThreshold: data.alertThreshold,
          notes: data.notes?.trim() || undefined,
        },
      })
      toast.success("Presupuesto actualizado.")
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const categories = categoriesQuery.data?.content ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza el monto, la alerta y las notas."
              : "Define el límite de gasto mensual para una categoría."}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <form
            onSubmit={updateForm.handleSubmit(submitUpdate)}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label>Monto planificado</Label>
              <Input
                type="number"
                step="0.01"
                {...updateForm.register("amount", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {updateForm.formState.errors.amount && (
                <p className="text-sm text-destructive">{updateForm.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Umbral de alerta (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                {...updateForm.register("alertThreshold", {
                  setValueAs: (value) => value === "" ? undefined : Number(value),
                })}
                disabled={isSubmitting}
              />
              {updateForm.formState.errors.alertThreshold && (
                <p className="text-sm text-destructive">{updateForm.formState.errors.alertThreshold.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Notas</Label>
              <Input
                {...updateForm.register("notes")}
                placeholder="Notas opcionales"
                maxLength={100}
                disabled={isSubmitting}
              />
              {updateForm.formState.errors.notes && (
                <p className="text-sm text-destructive">{updateForm.formState.errors.notes.message}</p>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form
            onSubmit={createForm.handleSubmit(submitCreate)}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <Controller
                name="categoryId"
                control={createForm.control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                    disabled={isSubmitting || categoriesQuery.isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {createForm.formState.errors.categoryId && (
                <p className="text-sm text-destructive">{createForm.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Mes</Label>
                <Input type="month" {...createForm.register("month")} disabled={isSubmitting} />
                {createForm.formState.errors.month && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.month.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Monto planificado</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...createForm.register("amount", { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {createForm.formState.errors.amount && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Umbral de alerta (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                {...createForm.register("alertThreshold", {
                  setValueAs: (value) => value === "" ? undefined : Number(value),
                })}
                disabled={isSubmitting}
              />
              {createForm.formState.errors.alertThreshold && (
                <p className="text-sm text-destructive">{createForm.formState.errors.alertThreshold.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Notas</Label>
              <Input
                {...createForm.register("notes")}
                placeholder="Notas opcionales"
                maxLength={100}
                disabled={isSubmitting}
              />
              {createForm.formState.errors.notes && (
                <p className="text-sm text-destructive">{createForm.formState.errors.notes.message}</p>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Crear presupuesto
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
