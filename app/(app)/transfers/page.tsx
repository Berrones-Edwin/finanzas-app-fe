import { ArrowLeftRight } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function TransfersPage() {
  return (
    <ComingSoon
      title="Transferencias"
      description="Mueve dinero entre tus cuentas."
      icon={ArrowLeftRight}
      note="El formulario de transferencias (cuenta origen y destino distintas) se conecta a /api/transfers y se construirá en el módulo de flujos financieros."
    />
  )
}
