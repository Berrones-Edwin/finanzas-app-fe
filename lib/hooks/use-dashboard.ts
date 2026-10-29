import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/lib/services/dashboard-service"

const KEY = "dashboard"

export function useDashboardSummary(start?: string, end?: string) {
  return useQuery({
    queryKey: [KEY, "summary", start ?? null, end ?? null],
    queryFn: () => dashboardService.summary(start, end),
    placeholderData: keepPreviousData,
  })
}

export function useDashboardByCategory(start?: string, end?: string) {
  return useQuery({
    queryKey: [KEY, "by-category", start ?? null, end ?? null],
    queryFn: () => dashboardService.byCategory(start, end),
    placeholderData: keepPreviousData,
  })
}

export function useDashboardMonthlyTrends(start?: string, end?: string) {
  return useQuery({
    queryKey: [KEY, "monthly-trends", start ?? null, end ?? null],
    queryFn: () => dashboardService.monthlyTrends(start, end),
    placeholderData: keepPreviousData,
  })
}

export function useDashboardByAccount(start?: string, end?: string) {
  return useQuery({
    queryKey: [KEY, "by-account", start ?? null, end ?? null],
    queryFn: () => dashboardService.byAccount(start, end),
    placeholderData: keepPreviousData,
  })
}
