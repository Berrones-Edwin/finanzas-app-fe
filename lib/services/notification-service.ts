import { api } from "@/lib/api-client"
import type {
  Notification,
  NotificationFilterParams,
    Page,
  UnreadCountResponse,
} from "@/lib/types"

export const notificationService = {
  async list(params: NotificationFilterParams = {}): Promise<Page<Notification> | Notification[]> {
    const { data } = await api.get<Page<Notification> | Notification[]>(
      "/notifications",
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 10,
          ...(params.unread !== undefined && { unread: params.unread }),
          ...(params.type && { type: params.type }),
        },
      },
    )
    return data
  },

  async unreadCount(): Promise<UnreadCountResponse> {
    const { data } = await api.get<UnreadCountResponse>(
      "/notifications/unread-count",
    )
    return data
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all")
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}
