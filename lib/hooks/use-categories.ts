"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { categoryService } from "@/lib/services/category-service"
import type { CategoryPayload, PageParams } from "@/lib/types"

// ============================================================================
// React Query hooks for the Categories domain.
// ============================================================================

const KEY = "categories"

export function useCategories(params: PageParams) {
  return useQuery({
    queryKey: [KEY, params.page ?? 0, params.size ?? 10],
    queryFn: () => categoryService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCategory(id: number) {

  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => categoryService.single(id),
    enabled: !!id
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<CategoryPayload>
    }) => categoryService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
