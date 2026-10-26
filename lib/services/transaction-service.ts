import { api } from '@/lib/api-client'
import { FlowTypeApi, Page, PageParams, TransactionCreatePayload, TransactionResponse } from '@/lib/types'


export const transactionService = {
    async list(params: PageParams = {}, categoryId?: number, type?: FlowTypeApi, accountId?: number, start?: string, end?: string): Promise<Page<TransactionResponse>> {

        const { data } = await api.get<Page<TransactionResponse>>("/transactions", {
            params: {
                page: params.page ?? 0, size: params.size ?? 10,
                ...(categoryId && { categoryId }),
                ...(type && { type }),
                ...(accountId && { accountId }),
                ...(start && { start }),
                ...(end && { end }),
            },
        })
        return data
    },
    async single(id: number): Promise<TransactionResponse> {
        const { data } = await api.get<TransactionResponse>(`/transactions/${id}`)
        return data
    },
    async create(payload: TransactionCreatePayload): Promise<TransactionResponse> {
        const { data } = await api.post<TransactionResponse>("/transactions", payload)
        return data
      },
    
}