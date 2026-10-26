import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FlowTypeApi, PageParams, TransactionCreatePayload } from '@/lib/types'
import { transactionService } from '@/lib/services/transaction-service'

const KEY = "transactions"
const ACCOUNTS_KEY = "accounts"

export function useTransactions(
    params: PageParams,
    categoryId?: number,
    type?: FlowTypeApi,
    accountId?: number,
    start?: string,
    end?: string,
) {
    return useQuery({
        queryKey: [KEY, params.page ?? 0, params.size ?? 10, categoryId ?? null, type ?? null, accountId ?? null, start ?? null, end ?? null],
        queryFn: () => transactionService.list(params, categoryId, type, accountId, start, end),
        placeholderData: keepPreviousData,
    })
}

export function useTransaction(id: number) {

  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => transactionService.single(id),
    enabled: Number.isFinite(id) && id > 0
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TransactionCreatePayload) => transactionService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY] })
    },
  })
}
