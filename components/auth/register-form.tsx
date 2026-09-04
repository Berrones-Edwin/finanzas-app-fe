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
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation"

const CURRENCIES = ["MXN", "USD", "EUR", "GBP", "CAD", "ARS", "COP"]

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currency, setCurrency] = useState("MXN")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const nameErr = validateName(name, 4, "El nombre")
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    if (nameErr || emailErr || passErr) {
      setErrors({
        name: nameErr ?? undefined,
        email: emailErr ?? undefined,
        password: passErr ?? undefined,
      })
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        currency,
      })
      toast.success("Cuenta creada correctamente.")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo crear la cuenta."))
    } finally {
      setSubmitting(false)
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
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            disabled={submitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            disabled={submitting}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Moneda principal</Label>
          <Select
            value={currency}
            onValueChange={(v) => v && setCurrency(v)}
          >
            <SelectTrigger id="currency" disabled={submitting}>
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

        <Button type="submit" className="mt-2 w-full" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Crear cuenta
        </Button>
      </form>
    </AuthShell>
  )
}
