import { api } from '@/lib/api-client'
import type {
    BudgetCreateRequest,
    BudgetListParams,
    BudgetResponse,
    BudgetUpdateRequest,
    Page,
} from '@/lib/types'

export const budgetService = {
    async list(params: BudgetListParams = {}): Promise<Page<BudgetResponse>> {
        const { data } = await api.get<Page<BudgetResponse>>('/budgets', {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 10,
                ...(params.categoryId !== undefined && { categoryId: params.categoryId }),
                ...(params.month !== undefined && { month: params.month }),
                ...(params.year !== undefined && { year: params.year }),
            },
        })

        return data
    },

    async create(payload: BudgetCreateRequest): Promise<BudgetResponse> {
        const { data } = await api.post<BudgetResponse>('/budgets', payload)
        return data
    },

    async update(id: number, payload: BudgetUpdateRequest): Promise<BudgetResponse> {
        const { data } = await api.patch<BudgetResponse>(`/budgets/${id}`, payload)
        return data
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/budgets/${id}`)
    },
}