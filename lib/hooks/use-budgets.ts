import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import type {
    BudgetCreateRequest,
    BudgetListParams,
    BudgetUpdateRequest,
} from '@/lib/types'
import { budgetService } from '@/lib/services/budget-service'

const KEY = 'budgets'

export function useBudgets(params: BudgetListParams = {}) {
    return useQuery({
        queryKey: [
            KEY,
            params.page ?? 0,
            params.size ?? 10,
            params.categoryId,
            params.month,
            params.year,
        ],
        queryFn: () => budgetService.list(params),
        placeholderData: keepPreviousData,
    })
}

export function useCreateBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: BudgetCreateRequest) => budgetService.create(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useUpdateBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: BudgetUpdateRequest }) =>
            budgetService.update(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
    })
}

export function useDeleteBudget() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => budgetService.remove(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
    })
}