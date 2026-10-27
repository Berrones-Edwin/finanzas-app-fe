import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { notificationService } from "@/lib/services/notification-service"
import type { NotificationFilterParams } from "@/lib/types"

const KEY = "notifications"
const UNREAD_COUNT_KEY = ["notifications", "unread-count"]

export function useNotifications(params: NotificationFilterParams = {}) {
  return useQuery({
    queryKey: [
      KEY,
      params.page ?? 0,
      params.size ?? 10,
      params.unread ?? null,
      params.type ?? null,
    ],
    queryFn: () => notificationService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: () => notificationService.unreadCount(),
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: UNREAD_COUNT_KEY })
    },
  })
}
