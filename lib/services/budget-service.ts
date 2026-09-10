import { api } from '@/lib/api-client';
import { BudgetResponse, Page, PageParams } from '@/lib/types';

export const budgetService = {
    async list(params: PageParams = {}): Promise<Page<BudgetResponse>> {
        const { data } = await api.get<Page<BudgetResponse>>("/budgets", {
            params: { page: params.page ?? 0, size: params.size ?? 10 }
        })

        return data
    }
}