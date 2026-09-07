import { ArrowLeftRight } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"


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
