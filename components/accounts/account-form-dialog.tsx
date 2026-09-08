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
import type { Account, AccountType } from "@/lib/types"
import { accountSchema } from '../../lib/validation'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "BANK", label: "Banco" },
  { value: "CREDIT", label: "Crédito" },
  { value: "SAVINGS", label: "Ahorro" },
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
  balance?: string
  type?: string
  currency?: string
}

export function AccountFormDialog({ open, onOpenChange, account }: Props) {
  const isEdit = !!account
  const createMut = useCreateAccount()
  const updateMut = useUpdateAccount()
  const submitting = createMut.isPending || updateMut.isPending

  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("CASH")
  const [currency, setCurrency] = useState("MXN")
  const [color, setColor] = useState("#0d9488")
  const [balance, setBalance] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "")
      setType(account?.accountType ?? "BANK")
      setCurrency(account?.currency ?? "MXN")
      setColor(account?.color ?? "#0d9488")
      setBalance(account?.balance ?? 0)
      setErrors({})
    }
  }, [open, account])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const payload = {
      name: name.trim(),
       type,
      balance,
      currency,
      color: color.toLowerCase(),
    }


    const result = accountSchema.safeParse(payload)

    if (!result.success) {
      const nextErrors: { name?: string; type?: string, balance?: string, currency?: string, color?: string } = {};

      for (const issue of result.error.issues) {
        const field = issue.path?.[0];
        if (field === "name" && !nextErrors.name) nextErrors.name = issue.message;
        if (field === "type" && !nextErrors.type) nextErrors.type = issue.message;
        if (field === "currency" && !nextErrors.currency) nextErrors.currency = issue.message;
        if (field === "color" && !nextErrors.color) nextErrors.color = issue.message;
        if (field === "balance" && !nextErrors.balance) nextErrors.balance = issue.message;
      }

      setErrors(nextErrors);
      console.log({ payload, errors })
      return;
    }


    console.log({ payload, errors })
    try {
      if (isEdit && account) {
        await updateMut.mutateAsync({ id: account.id, payload })
        toast.success("Cuenta actualizada.")
      } else {
        await createMut.mutateAsync({...payload,accountType:payload.type})
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
              aria-invalid={!!errors.balance}
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-balance">Balance</Label>
            <Input
              id="acc-balance"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              placeholder="00.00$"
              aria-invalid={!!errors.balance}
              disabled={submitting}
            />
            {errors.balance && (
              <p className="text-sm text-destructive">{errors.balance}</p>
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
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type}</p>
              )}
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
               {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency}</p>
              )}
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
