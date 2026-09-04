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
  useCreateAccount,
  useUpdateAccount,
} from "@/lib/hooks/use-accounts"
import { getApiErrorMessage } from "@/lib/api-client"
import { validateHexColor, validateName } from "@/lib/validation"
import type { Account, AccountType } from "@/lib/types"

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Banco" },
  { value: "credit", label: "Crédito" },
  { value: "savings", label: "Ahorro" },
]

const CURRENCIES = ["MXN", "USD", "EUR", "GBP", "CAD", "ARS", "COP"]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
}

interface FieldErrors {
  name?: string
  color?: string
}

export function AccountFormDialog({ open, onOpenChange, account }: Props) {
  const isEdit = !!account
  const createMut = useCreateAccount()
  const updateMut = useUpdateAccount()
  const submitting = createMut.isPending || updateMut.isPending

  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("bank")
  const [currency, setCurrency] = useState("MXN")
  const [color, setColor] = useState("#0d9488")
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "")
      setType(account?.type ?? "bank")
      setCurrency(account?.currency ?? "MXN")
      setColor(account?.color ?? "#0d9488")
      setErrors({})
    }
  }, [open, account])

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
      type,
      currency,
      color: color.toLowerCase(),
    }

    try {
      if (isEdit && account) {
        await updateMut.mutateAsync({ id: account.id, payload })
        toast.success("Cuenta actualizada.")
      } else {
        await createMut.mutateAsync(payload)
        toast.success("Cuenta creada.")
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
          <DialogTitle>{isEdit ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos de esta cuenta."
              : "Crea una cuenta para registrar tus movimientos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nombre</Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Nómina, Efectivo…"
              aria-invalid={!!errors.name}
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as AccountType)}
              >
                <SelectTrigger id="acc-type" disabled={submitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-currency">Moneda</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger id="acc-currency" disabled={submitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ColorField
            id="acc-color"
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
              {isEdit ? "Guardar cambios" : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
