"use client"

import { useEffect, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { useCategories } from "@/lib/hooks/use-categories"
import { useCreateTransaction } from "@/lib/hooks/use-transactions"
import { getApiErrorMessage } from "@/lib/api-client"
import { transactionSchema } from "@/lib/validation"
import type { FlowTypeApi } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TransactionFormData = z.infer<typeof transactionSchema>

function today(): string {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

const defaultValues: TransactionFormData = {
  accountId: 0,
  categoryId: 0,
  transactionType: "EXPENSE",
  amount: 0,
  description: "",
  date: today(),
}

const TYPE_OPTIONS: { value: FlowTypeApi; label: string }[] = [
  { value: "INCOME", label: "Ingreso" },
  { value: "EXPENSE", label: "Gasto" },
]

export function TransactionFormDialog({ open, onOpenChange }: Props) {
  const createMut = useCreateTransaction()

  const { data: accountsData } = useAccounts({ page: 0, size: 100 })
  const { data: categoriesData } = useCategories({ page: 0, size: 100 })
  const accounts = accountsData?.content ?? []
  const categories = categoriesData?.content ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  })

  const transactionType = watch("transactionType")

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.categoryType === transactionType),
    [categories, transactionType],
  )

  useEffect(() => {
    if (open) reset({ ...defaultValues, date: today() })
  }, [open, reset])

  function handleTypeChange(value: FlowTypeApi) {
    setValue("transactionType", value)
    // The selected category may not belong to the new type.
    setValue("categoryId", 0)
  }

  async function onSubmit(data: TransactionFormData) {
    try {
      await createMut.mutateAsync({
        accountId: data.accountId,
        categoryId: data.categoryId,
        transactionType: data.transactionType,
        amount: data.amount,
        description: data.description.trim(),
        date: data.date,
      })
      toast.success("Transacción creada.")
      onOpenChange(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva transacción</DialogTitle>
          <DialogDescription>
            Registra un ingreso o gasto en una de tus cuentas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-type">Tipo</Label>
              <Controller
                name="transactionType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      handleTypeChange(value as FlowTypeApi)
                    }
                    disabled={createMut.isPending}
                  >
                    <SelectTrigger id="tx-type" disabled={createMut.isPending}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.transactionType && (
                <p className="text-sm text-destructive">
                  {errors.transactionType.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-amount">Monto</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
                aria-invalid={!!errors.amount}
                disabled={createMut.isPending}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-account">Cuenta</Label>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : null}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : 0)
                  }
                  disabled={createMut.isPending || accounts.length === 0}
                >
                  <SelectTrigger
                    id="tx-account"
                    className="w-full"
                    disabled={createMut.isPending || accounts.length === 0}
                  >
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && (
              <p className="text-sm text-destructive">
                {errors.accountId.message}
              </p>
            )}
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Primero crea una cuenta para registrar transacciones.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-category">Categoría</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : null}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : 0)
                  }
                  disabled={createMut.isPending || categoryOptions.length === 0}
                >
                  <SelectTrigger
                    id="tx-category"
                    className="w-full"
                    disabled={
                      createMut.isPending || categoryOptions.length === 0
                    }
                  >
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
            {categoryOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay categorías para este tipo. Crea una primero.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-description">Descripción</Label>
            <Input
              id="tx-description"
              {...register("description")}
              placeholder="Ej. Compra del supermercado"
              aria-invalid={!!errors.description}
              disabled={createMut.isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tx-date">Fecha</Label>
            <Input
              id="tx-date"
              type="date"
              {...register("date")}
              aria-invalid={!!errors.date}
              disabled={createMut.isPending}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMut.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Crear transacción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
