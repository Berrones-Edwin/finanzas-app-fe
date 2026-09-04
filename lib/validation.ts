// ============================================================================
// Lightweight, dependency-free validation helpers shared across forms.
// Each returns an error string, or null when the value is valid.
// ============================================================================

export function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return "El correo es obligatorio."
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(v)) return "Ingresa un correo válido."
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return "La contraseña es obligatoria."
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres."
  return null
}

export function validateName(
  value: string,
  min = 4,
  label = "El nombre",
): string | null {
  const v = value.trim()
  if (!v) return `${label} es obligatorio.`
  if (v.length < min) return `${label} debe tener al menos ${min} caracteres.`
  return null
}

const HEX_RE = /^#([0-9a-fA-F]{6})$/
export function validateHexColor(value: string): string | null {
  if (!value) return "El color es obligatorio."
  if (!HEX_RE.test(value)) return "Usa un color hexadecimal válido (#RRGGBB)."
  return null
}

export function validateAmount(value: string): string | null {
  if (!value.trim()) return "El monto es obligatorio."
  const num = Number(value)
  if (Number.isNaN(num)) return "El monto debe ser un número."
  if (num <= 0) return "El monto debe ser mayor que cero."
  return null
}
