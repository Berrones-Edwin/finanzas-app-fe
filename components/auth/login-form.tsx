"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useForm, SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/providers/auth-provider"
import { getApiErrorMessage } from "@/lib/api-client"
import { loginSchema } from "@/lib/validation"
import * as z from "zod"
import { zodResolver } from '@hookform/resolvers/zod'

type LoginFormData = z.infer<typeof loginSchema>
export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  async function onSubmit(data:LoginFormData) {
    
    try {
      await login({ email: data.email, password:data.password })
      toast.success("Sesión iniciada correctamente.")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo iniciar sesión."))
    } 
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para administrar tus finanzas"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  )
}
