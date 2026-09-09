"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColorField } from "@/components/shared/color-field"
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/lib/hooks/use-categories"
import { getApiErrorMessage } from "@/lib/api-client"
import type { Category, FlowTypeApi } from "@/lib/types"
import { categorySchema } from "@/lib/validation"
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the dialog is in edit mode. */
  category?: Category | null
}

type CategoryFormData = z.infer<typeof categorySchema>

const defaultValues: CategoryFormData = {
  name: "", color: "#0d9488", type: "EXPENSE"
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const isEdit = !!category
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const isSubmitting = createMut.isPending || updateMut.isPending
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues
  })

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          color: category.color,
          type: category.categoryType
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, category, reset])

  async function onSubmit(data: CategoryFormData) {
    const payload = {
      name: data.name.trim(),
      type: data.type,
      color: data.color.toLowerCase(),
    }


    try {
      if (isEdit && category) {
        const payloadEdit = { ...payload, categoryType: payload.type }
        await updateMut.mutateAsync({ id: category.id, payload: payloadEdit })
        toast.success("Categoría actualizada.")
      } else {
        await createMut.mutateAsync({ ...payload, categoryType: payload.type })
        toast.success("Categoría creada.")
      }
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos de esta categoría."
              : "Crea una categoría para clasificar tus movimientos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              {...register("name")}
              placeholder="Ej. Comida, Salario…"
              aria-invalid={!!errors.name}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="cat-type" disabled={isSubmitting}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Ingreso</SelectItem>
                    <SelectItem value="EXPENSE">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorField
                id="acc-color"
                value={field.value}
                onChange={field.onChange}
                error={errors.color?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
