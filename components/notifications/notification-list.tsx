"use client"

import { BellOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationItem } from "@/components/notifications/notification-item"
import type { Notification } from "@/lib/types"

interface NotificationListProps {
  notifications: Notification[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onMarkAsRead?: (id: number) => void
  onDelete?: (id: number) => void
  showActions?: boolean
}

export function NotificationList({
  notifications,
  isLoading,
  isError,
  errorMessage,
  onMarkAsRead,
  onDelete,
  showActions = true,
}: NotificationListProps) {
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          {errorMessage ?? "Ocurrió un error al cargar las notificaciones."}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex gap-3 p-4">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <BellOff className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">No tienes notificaciones</p>
          <p className="text-sm text-muted-foreground">
            Cuando recibas alertas, aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  )
}
