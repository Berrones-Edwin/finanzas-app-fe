"use client"

import { Bell, CheckCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationItem } from "@/components/notifications/notification-item"
import {
  useDeleteNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/hooks/use-notifications"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api-client"
import type {
  Notification,
} from "@/lib/types"

export function NotificationsDropdown() {
  const { data: notificationsData } = useNotifications()
  const { data: unread } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : (notificationsData as any)?.content ?? []

  const unreadCount = unread?.count ?? 0
  const recent = notifications.slice(0, 5)

  async function handleMarkAsRead(id: number) {
    try {
      await markAsRead.mutateAsync(id)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0) return
    try {
      await markAllAsRead.mutateAsync()
      toast.success("Todas las notificaciones marcadas como leídas.")
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNotification.mutateAsync(id)
      toast.success("Notificación eliminada.")
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            <span className="sr-only">Notificaciones</span>
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-xs"
                variant="destructive"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="mr-1 size-3" />
                Marcar todas como leídas
              </Button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="max-h-[420px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {recent.map((notification:Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem  className="justify-center">
          <Link href="/notifications">Ver todas las notificaciones</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
