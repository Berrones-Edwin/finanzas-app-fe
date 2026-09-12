import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PageParams } from '@/lib/types'
import { budgetService } from '@/lib/services/budget-service'


const KEY = "budgets"

export function 
useBudgets(params: PageParams, categoryId: number, month?: number, year?: number) {
    return useQuery({
        queryKey: [KEY, params.page ?? 0, params.size ?? 10, categoryId,month,year],
        queryFn: () => budgetService.list(params, categoryId,month,year),
        placeholderData: keepPreviousData,
    })
}