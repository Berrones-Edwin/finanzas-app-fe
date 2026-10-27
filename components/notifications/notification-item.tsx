"use client"

import { Bell, Check, PiggyBank, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/types"

const TYPE_META = {
  BUDGET_THRESHOLD_REACHED: {
    label: "Presupuesto",
    icon: PiggyBank,
    iconClass: "bg-amber-500/10 text-amber-600",
  },
} as const

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: number) => void
  onDelete?: (id: number) => void
  showActions?: boolean
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true,
}: NotificationItemProps) {
  const isUnread = !notification.readAt
  const meta = TYPE_META[notification.type] ?? {
    label: "Notificación",
    icon: Bell,
    iconClass: "bg-primary/10 text-primary",
  }
  const Icon = meta.icon

  const timeLabel = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: es,
      })
    : null

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-border p-4 transition-colors",
        isUnread && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          meta.iconClass,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium leading-tight">
              {meta.label}
              {isUnread && (
                <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" />
              )}
            </p>
            <p className="mt-1 text-sm text-foreground">{notification.message}</p>
            {timeLabel && (
              <p className="mt-1 text-xs text-muted-foreground">{timeLabel}</p>
            )}
          </div>
          {showActions && (
            <div className="flex items-center gap-1">
              {isUnread && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onMarkAsRead(notification.id)}
                  aria-label="Marcar como leída"
                >
                  <Check className="size-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(notification.id)}
                  aria-label="Eliminar notificación"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
