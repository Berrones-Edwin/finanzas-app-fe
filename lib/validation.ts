

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
