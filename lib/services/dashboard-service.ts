import { api } from "@/lib/api-client"
import type {
  DashboardByAccountResponse,
  DashboardByCategoryResponse,
  DashboardSummaryResponse,
  DashboardTrendsResponse,
} from "@/lib/types"

function dateParams(start?: string, end?: string) {
  return {
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
  }
}

export const dashboardService = {
  async summary(start?: string, end?: string): Promise<DashboardSummaryResponse> {
    const { data } = await api.get<DashboardSummaryResponse>("/dashboard/summary", {
      params: dateParams(start, end),
    })
    return data
  },

  async byCategory(start?: string, end?: string): Promise<DashboardByCategoryResponse[]> {
    const { data } = await api.get<DashboardByCategoryResponse[]>("/dashboard/by-category", {
      params: dateParams(start, end),
    })
    return data
  },

  async monthlyTrends(start?: string, end?: string): Promise<DashboardTrendsResponse[]> {
    const { data } = await api.get<DashboardTrendsResponse[]>("/dashboard/monthly-trends", {
      params: dateParams(start, end),
    })
    return data
  },

  async byAccount(start?: string, end?: string): Promise<DashboardByAccountResponse[]> {
    const { data } = await api.get<DashboardByAccountResponse[]>("/dashboard/by-account", {
      params: dateParams(start, end),
    })
    return data
  },
}
