import { api } from "@/lib/api-client"
import type {
  Category,
  CategoryPayload,
  Page,
  PageParams,
} from "@/lib/types"

// ============================================================================
// Category service — /api/categories. Lists are paginated.
// ============================================================================

export const categoryService = {
  async list(params: PageParams = {}): Promise<Page<Category>> {
    const { data } = await api.get<Page<Category>>("/categories", {
      params: { page: params.page ?? 0, size: params.size ?? 10 },
    })
    return data
  },
  async single(id: number): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`)
    return data
  },

  async create(payload: CategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>("/categories", payload)
    return data
  },

  async update(
    id: number,
    payload: Partial<CategoryPayload>,
  ): Promise<Category> {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
