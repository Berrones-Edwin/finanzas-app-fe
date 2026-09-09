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
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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

type AccountFormData = z.infer<typeof accountSchema>
const defaultValues: AccountFormData = {
  name: "",
  color: "#0d9488",
  balance: 0,
  type: "CASH",
  currency: "MXN",
}

export function AccountFormDialog({ open, onOpenChange, account }: Props) {
  const isEdit = !!account
  const createMut = useCreateAccount()
  const updateMut = useUpdateAccount()
  const isSubmitting = createMut.isPending || updateMut.isPending
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues
  })

  useEffect(() => {
    if (open) {
      if (account) {
        reset({
          name: account.name,
          color: account.color,
          balance: account.balance,
          type: account.accountType,
          currency: account.currency,
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [open, account, reset])

  async function onSubmit(data: AccountFormData) {


    const payload = {
      name: data.name.trim(),
      type: data.type,
      balance: data.balance,
      currency: data.currency,
      color: data.color.toLowerCase(),
    }


    try {
      if (isEdit && account) {
        const payloadEdit = { ...payload, accountType: payload.type }
        await updateMut.mutateAsync({ id: account.id, payload: payloadEdit })
        toast.success("Cuenta actualizada.")
      } else {
        await createMut.mutateAsync({ ...payload, accountType: payload.type })
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nombre</Label>
            <Input
              id="acc-name"
              {...register("name")}
              placeholder="Ej. Nómina, Efectivo…"
              aria-invalid={!!errors.balance}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-balance">Balance</Label>
            <Input
              id="acc-balance"
              {...register("balance", { valueAsNumber: true })}
              placeholder="$00.00"
              aria-invalid={!!errors.balance}
              disabled={isSubmitting}
            />
            {errors.balance && (
              <p className="text-sm text-destructive">{errors.balance.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-type">Tipo</Label>
              <Controller
                name='type'
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="acc-type" disabled={isSubmitting}>
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
                )}
              />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="acc-currency">Moneda</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="acc-currency" disabled={isSubmitting}>
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
                )}
              />
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>


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
              {isEdit ? "Guardar cambios" : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
