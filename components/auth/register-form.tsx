"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
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
import { useAuth } from "@/components/providers/auth-provider"
import { getApiErrorMessage } from "@/lib/api-client"
import { registerSchema } from "@/lib/validation"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from "react-hook-form"


const CURRENCIES = ["MXN", "USD", "EUR", "GBP", "CAD", "ARS", "COP"]

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
      currency: "MXN"
    }
  })

  async function onSubmit(data: RegisterFormData) {

    try {
      await registerUser({
        firstName: data.name.trim(),
        lastName: data.lastname.trim(),
        email: data.email.trim(),
        password: data.password,
        preferredCurrency: data.currency,
      })
      toast.success("Cuenta creada correctamente.")
      router.push("/login")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo crear la cuenta."))
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza a tomar el control de tu dinero"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">

          <Label htmlFor="name" className='w-100 '>Nombre completo</Label>

          <div
            className='grid grid-cols-2 gap-2'
          >

            <Input
              id="name"
              autoComplete="name"
              placeholder="Juan"
              {...register("name")}
              aria-invalid={!!errors.name}
              disabled={isSubmitting}

            />
            <Input
              id="lastName"
              autoComplete="lastName"
              placeholder="Pérez"
              {...register("lastname")}
              aria-invalid={!!errors.lastname}
              disabled={isSubmitting}

            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}

          {errors.lastname && (
            <p className="text-sm text-destructive">{errors.lastname.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...register("email")}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
            aria-invalid={!!errors.password}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Moneda principal</Label>
          <Controller
            name='currency'
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                disabled={isSubmitting}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="currency" disabled={isSubmitting}>
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
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Crear cuenta
        </Button>
      </form>
    </AuthShell>
  )
}
