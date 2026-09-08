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
import { log } from "node:console"

const CURRENCIES = ["MXN", "USD", "EUR", "GBP", "CAD", "ARS", "COP"]

interface FieldErrors {
  name?: string
  lastName?: string
  email?: string
  password?: string
}

export function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currency, setCurrency] = useState("MXN")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const payload = {
      name, email, password,lastname:lastName
    }

    const result = registerSchema.safeParse(payload);
    console.log({result})

    if (!result.success) {

      const nextErrors: { email?: string; password?: string; name?: string; lastname?: string } = {};

      for (const issue of result.error.issues) {
        const field = issue.path?.[0];
        if (field === "email" && !nextErrors.email) nextErrors.email = issue.message;
        if (field === "password" && !nextErrors.password) nextErrors.password = issue.message;
        if (field === "name" && !nextErrors.name) nextErrors.name = issue.message;
        if (field === "lastname" && !nextErrors.lastname) nextErrors.lastname = issue.message;
      }

      setErrors(nextErrors);
      return;
    }

    setSubmitting(true)
    try {
     const response = await register({
        firstName: name.trim(),
        lastName: lastName,
        email: email.trim(),
        password,
        preferredCurrency: currency,
      })

      console.log({response,payload})

      toast.success("Cuenta creada correctamente.")
      router.push("/login")
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

          <Label htmlFor="name" className='w-100 '>Nombre completo</Label>

          <div
            className='grid grid-cols-2 gap-2'
          >

            <Input
              id="name"
              autoComplete="name"
              placeholder="Juan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              disabled={submitting}

            />
            <Input
              id="lastName"
              autoComplete="lastName"
              placeholder="Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={!!errors.lastName}
              disabled={submitting}

            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}

          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
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
