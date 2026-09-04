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
import { validateHexColor, validateName } from "@/lib/validation"
import type { Category, FlowTypeApi } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the dialog is in edit mode. */
  category?: Category | null
}

interface FieldErrors {
  name?: string
  color?: string
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const isEdit = !!category
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const submitting = createMut.isPending || updateMut.isPending

  const [name, setName] = useState("")
  const [type, setType] = useState<FlowTypeApi>("EXPENSE")
  const [color, setColor] = useState("#0d9488")
  const [errors, setErrors] = useState<FieldErrors>({})

  // Sync local state whenever the dialog opens or the target category changes.
  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setType(category?.categoryType ?? "EXPENSE")
      setColor(category?.color ?? "#0d9488")
      setErrors({})
    }
  }, [open, category])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nameErr = validateName(name, 4, "El nombre")
    const colorErr = validateHexColor(color)
    if (nameErr || colorErr) {
      setErrors({ name: nameErr ?? undefined, color: colorErr ?? undefined })
      return
    }
    setErrors({})

    const payload = {
      name: name.trim(),
      categoryType: type,
      color: color.toLowerCase(),
    }

    try {
      if (isEdit && category) {
        await updateMut.mutateAsync({ id: category.id, payload })
        toast.success("Categoría actualizada.")
      } else {
        await createMut.mutateAsync(payload)
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-name">Nombre</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Comida, Salario…"
              aria-invalid={!!errors.name}
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as FlowTypeApi)}
            >
              <SelectTrigger id="cat-type" disabled={submitting}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Ingreso</SelectItem>
                <SelectItem value="EXPENSE">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ColorField
            id="cat-color"
            value={color}
            onChange={setColor}
            error={errors.color}
            disabled={submitting}
          />

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
