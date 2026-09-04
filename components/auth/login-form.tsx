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
import { useAuth } from "@/components/providers/auth-provider"
import { getApiErrorMessage } from "@/lib/api-client"
import { validateEmail, validatePassword } from "@/lib/validation"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (emailErr || passErr) {
      setErrors({ email: emailErr ?? undefined, password: passErr ?? undefined })
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      toast.success("Sesión iniciada correctamente.")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo iniciar sesión."))
    } finally {
      setSubmitting(false)
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
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            disabled={submitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            disabled={submitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <Button type="submit" className="mt-2 w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Iniciar sesión
        </Button>
      </form>
    </AuthShell>
  )
}
