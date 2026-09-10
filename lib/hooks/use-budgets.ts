import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PageParams } from '@/lib/types'
import { budgetService } from '@/lib/services/budget-service'


const KEY = "budgets"

export function useBudgets(params: PageParams) {
    return useQuery({
        queryKey: [KEY, params.page ?? 0, params.size ?? 10],
        queryFn: () => budgetService.list(params),
        placeholderData: keepPreviousData,
    })
}