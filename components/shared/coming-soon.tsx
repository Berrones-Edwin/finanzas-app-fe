import type { LucideIcon } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"

// ============================================================================
// Generic "coming soon" placeholder for modules not yet implemented.
// ============================================================================

export function ComingSoon({
  title,
  description,
  icon: Icon,
  note,
}: {
  title: string
  description: string
  icon: LucideIcon
  note: string
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <p className="max-w-md text-sm text-muted-foreground text-pretty">
            {note}
          </p>
        </CardContent>
      </Card>
    </>
  )
}
