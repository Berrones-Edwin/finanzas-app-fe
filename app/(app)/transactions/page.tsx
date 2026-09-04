import { Receipt } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function TransactionsPage() {
  return (
    <ComingSoon
      title="Transacciones"
      description="Registra tus ingresos y gastos."
      icon={Receipt}
      note="El formulario de transacciones (cuenta, categoría, tipo y monto) se conecta a /api/transactions y se construirá en el módulo de flujos financieros."
    />
  )
}
