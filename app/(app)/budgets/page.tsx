import { PiggyBank } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"


export default function BudgetsPage() {
  return (
    <ComingSoon
      title="Presupuestos"
      description="Define límites de gasto por categoría."
      icon={PiggyBank}
      note="Los presupuestos (con cálculo de gastado y restante) se conectan a /api/budgets y se construirán en un módulo posterior."
    />
  )
}
