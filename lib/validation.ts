

import * as z from "zod"

const MIN_LENGTH = 4;
const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/
const HexColorSchema = z
  .string()
  .refine((val) => HEX_PATTERN.test(val), { error: "Invalid hex color" });


const passwordSchema = z
  .string()
  .min(8)

const passwordRegisterSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), { error: "Must include an uppercase letter" })
  .refine((val) => /[a-z]/.test(val), { error: "Must include a lowercase letter" })
  .refine((val) => /[0-9]/.test(val), { error: "Must include a number" })
  .refine((val) => /[^A-Za-z0-9]/.test(val), { error: "Must include a special character" });
export const registerSchema = z.object({
  name: z.string().min(MIN_LENGTH),
  lastname: z.string(),
  email: z.email(),
  password: passwordRegisterSchema,
  currency:z.string().min(3).max(3)
})

export const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
})

export const accountSchema = z.object({
  name: z.string().min(MIN_LENGTH),
  color: HexColorSchema,
  balance: z.number().positive({message:"Balance must be greather than zero"}),
  type: z.enum(["CASH", "BANK", "CREDIT", "SAVINGS"] as const),
  currency: z.string().min(3).max(3)
})

export const categorySchema = z.object({
  name: z.string().min(MIN_LENGTH),
  color: HexColorSchema,
  type:z.enum(["INCOME","EXPENSE"])
})

export const transactionSchema = z.object({
  accountId: z.number({ error: "Selecciona una cuenta" }).int().positive({ error: "Selecciona una cuenta" }),
  categoryId: z.number({ error: "Selecciona una categoría" }).int().positive({ error: "Selecciona una categoría" }),
  transactionType: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number({ error: "Ingresa un monto válido" }).positive({ error: "El monto debe ser mayor que cero" }),
  description: z.string().trim().min(1, { error: "Agrega una descripción" }).max(255, { error: "Máximo 255 caracteres" }),
  date: z.string().min(1, { error: "Selecciona una fecha" }),
})
export const budgetCreateSchema = z.object({
  categoryId: z.number({ error: "Selecciona una categoría" }).int().positive({ error: "Selecciona una categoría" }),
  month: z.string().regex(/^\d{4}-\d{2}$/, { error: "Selecciona un mes válido" }),
  amount: z.number({ error: "Ingresa un monto válido" })
    .positive({ error: "El monto debe ser mayor que cero" })
    .multipleOf(0.01, { error: "Máximo 2 decimales" }),
  alertThreshold: z.number().int().min(1, { error: "Mínimo 1%" }).max(100, { error: "Máximo 100%" }).optional(),
  notes: z.string().trim().max(100, { error: "Máximo 100 caracteres" })
    .refine((value) => value.length === 0 || value.length >= 4, { error: "Mínimo 4 caracteres" })
    .optional(),
})

export const budgetUpdateSchema = z.object({
  amount: z.number({ error: "Ingresa un monto válido" })
    .positive({ error: "El monto debe ser mayor que cero" })
    .multipleOf(0.01, { error: "Máximo 2 decimales" }),
  alertThreshold: z.number().int().min(1, { error: "Mínimo 1%" }).max(100, { error: "Máximo 100%" }).optional(),
  notes: z.string().trim().max(100, { error: "Máximo 100 caracteres" }).optional(),
})

export function extractErrors(
  result: {
    error: z.ZodError
  },
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !(key in errors)) {
      errors[key] = issue.message
    }
  }
  return errors
}
