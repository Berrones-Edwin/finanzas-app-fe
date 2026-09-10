import { api } from '@/lib/api-client'
import { Page, PageParams, TransactionResponse } from '@/lib/types'


export const transactionService = {
    async list(params: PageParams = {}): Promise<Page<TransactionResponse>> {
        const { data } = await api.get<Page<TransactionResponse>>("/transactions", {
            params: { page: params.page ?? 0, size: params.size ?? 10 },
        })
        return data
    },
}