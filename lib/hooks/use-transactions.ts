import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { FlowTypeApi, PageParams } from '@/lib/types'
import { transactionService } from '@/lib/services/transaction-service'


const KEY = "budgets"

export function useTransactions(params: PageParams, categoryId: number, type?: FlowTypeApi, accountId?: number, start?: string, end?: string) {
    return useQuery({
        queryKey: [KEY, params.page ?? 0, params.size ?? 10, categoryId, type, accountId, start, end],
        queryFn: () => transactionService.list(params, categoryId, type, accountId, start, end),
        placeholderData: keepPreviousData,
    })
}