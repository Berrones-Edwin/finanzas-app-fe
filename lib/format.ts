// ============================================================================
// Currency / number formatting helpers.
// ============================================================================

export function formatCurrency(amount: number, currency = "MXN"): string {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    // Fallback if the currency code is unsupported by the runtime.
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatDate(value?: string): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}
