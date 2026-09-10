import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PageParams } from '@/lib/types'
import {  transactionService} from '@/lib/services/transaction-service'


const KEY = "budgets"

export function useTransactions(params: PageParams) {
    return useQuery({
        queryKey: [KEY, params.page ?? 0, params.size ?? 10],
        queryFn: () => transactionService.list(params),
        placeholderData: keepPreviousData,
    })
}