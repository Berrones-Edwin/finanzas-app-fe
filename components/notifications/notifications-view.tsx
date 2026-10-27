"use client"

import { useState } from "react"
import { CheckCheck, FilterX } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NotificationList } from "@/components/notifications/notification-list"
import { Pagination } from "@/components/shared/pagination"
import {
  useDeleteNotification,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/hooks/use-notifications"
import { getApiErrorMessage } from "@/lib/api-client"
import { toast } from "sonner"
import type { NotificationType } from "@/lib/types"

const PAGE_SIZE = 10

const TYPE_OPTIONS: Array<{ value: NotificationType; label: string }> = [
  { value: "BUDGET_THRESHOLD_REACHED", label: "Alerta de presupuesto" },
]

export function NotificationsView() {
  const [page, setPage] = useState(0)
  const [unreadFilter, setUnreadFilter] = useState<"all" | "unread">("all")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all")

  const { data, isLoading, isError, error } = useNotifications({
    page,
    size: PAGE_SIZE,
    ...(unreadFilter === "unread" ? { unread: true } : {}),
    ...(typeFilter !== "all" ? { type: typeFilter } : {}),
  })
  const { data: unread } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = Array.isArray(data) ? data : data?.content ?? []
  const isFirst = Array.isArray(data) ? true : data?.first ?? true
  const isLast = Array.isArray(data) ? true : data?.last ?? notifications.length < PAGE_SIZE
  const totalPages = Array.isArray(data) ? 1 : data?.totalPages ?? 1
  const total = Array.isArray(data) ? notifications.length : data?.total ?? notifications.length

  const unreadCount = unread?.count ?? 0

  function resetFilters() {
    setUnreadFilter("all")
    setTypeFilter("all")
    setPage(0)
  }

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
    <>
      <PageHeader
        title="Notificaciones"
        description="Revisa tus alertas y actualizaciones."
        action={
          <Button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
          >
            <CheckCheck className="size-4" />
            Marcar todas como leídas
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Select
          value={unreadFilter}
          onValueChange={(value) => {
            if (value === null) return
            setUnreadFilter(value as "all" | "unread")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">No leídas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(value) => {
            if (value === null) return
            setTypeFilter(value as NotificationType | "all")
            setPage(0)
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tipo de notificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(unreadFilter !== "all" || typeFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <FilterX className="size-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        isError={isError}
        errorMessage={getApiErrorMessage(error)}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {!Array.isArray(data) && notifications.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          isFirst={isFirst}
          isLast={isLast}
          onChange={setPage}
        />
      )}
    </>
  )
}
