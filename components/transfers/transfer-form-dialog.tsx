"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useCreateTransfer } from "@/lib/hooks/use-transfers"
import { getApiErrorMessage } from "@/lib/api-client"
import { transferSchema } from "@/lib/validation"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function today(): string {
  const date = new Date()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

type TransferFormData = z.infer<typeof transferSchema>

const defaultValues: TransferFormData = {
  fromAccount: 0,
  toAccount: 0,
  amount: 0,
  description: "",
  date: today(),
}

export function TransferFormDialog({ open, onOpenChange }: Props) {
  const createMutation = useCreateTransfer()
  const { data: accountsData } = useAccounts({ page: 0, size: 50 })
  console.log({accountsData})
  const accounts = accountsData?.content.filter((account) => account.active) ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues,
  })

  const fromAccount = watch("fromAccount")

  useEffect(() => {
    if (open) reset({ ...defaultValues, date: today() })
  }, [open, reset])

  function changeFromAccount(value: number) {
    setValue("fromAccount", value)
    const toAccount = watch("toAccount")
    if (value === toAccount) setValue("toAccount", 0)
  }

  async function onSubmit(data: TransferFormData) {
    try {
      await createMutation.mutateAsync({
        fromAccount: data.fromAccount,
        toAccount: data.toAccount,
        amount: data.amount,
        description: data.description.trim(),
        date: data.date,
      })
      toast.success("Transferencia creada.")
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva transferencia</DialogTitle>
          <DialogDescription>Mueve dinero entre dos cuentas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-from">Cuenta origen</Label>
              <Controller
                name="fromAccount"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : null}
                    onValueChange={(value) => changeFromAccount(value ? Number(value) : 0)}
                    disabled={createMutation.isPending || accounts.length === 0}
                  >
                    <SelectTrigger id="transfer-from" className="w-full">
                      <SelectValue placeholder="Selecciona origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fromAccount && <p className="text-sm text-destructive">{errors.fromAccount.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-to">Cuenta destino</Label>
              <Controller
                name="toAccount"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : null}
                    onValueChange={(value) => field.onChange(value ? Number(value) : 0)}
                    disabled={createMutation.isPending || accounts.length === 0}
                  >
                    <SelectTrigger id="transfer-to" className="w-full">
                      <SelectValue placeholder="Selecciona destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter((account) => account.id !== fromAccount)
                        .map((account) => (
                          <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.toAccount && <p className="text-sm text-destructive">{errors.toAccount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-amount">Monto</Label>
              <Input
                id="transfer-amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                disabled={createMutation.isPending}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-date">Fecha</Label>
              <Input
                id="transfer-date"
                type="date"
                {...register("date")}
                aria-invalid={!!errors.date}
                disabled={createMutation.isPending}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="transfer-description">Descripción</Label>
            <Input
              id="transfer-description"
              {...register("description")}
              placeholder="Describe la transferencia"
              maxLength={100}
              aria-invalid={!!errors.description}
              disabled={createMutation.isPending}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {accounts.length === 0 && (
            <p className="text-sm text-muted-foreground">Necesitas al menos una cuenta activa para transferir dinero.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending || accounts.length < 2}>
              {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Crear transferencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
