"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// ============================================================================
// Pagination control driven by the backend Page<T> response shape.
// `page` is zero-based to match the API.
// ============================================================================

export function Pagination({
  page,
  totalPages,
  total,
  isFirst,
  isLast,
  onChange,
}: {
  page: number
  totalPages: number
  total: number
  isFirst: boolean
  isLast: boolean
  onChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "registro" : "registros"} · Página{" "}
        {totalPages === 0 ? 0 : page + 1} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={isFirst}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={isLast}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
