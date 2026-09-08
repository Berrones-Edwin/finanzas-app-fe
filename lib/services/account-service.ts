import { api } from "@/lib/api-client"
import type { Account, AccountBalance, AccountPayload, Page, PageParams } from "@/lib/types"

// ============================================================================
// Account service — /api/accounts.
// DELETE performs a soft delete (deactivation) on the backend.
// ============================================================================

export const accountService = {
  async list(params: PageParams = {}): Promise<Page<Account>> {
    const { data } = await api.get<Page<Account>>("/accounts",{
      params: { page: params.page ?? 0, size: params.size ?? 10 },
    })
    return data
  },

  async balance(id: number): Promise<AccountBalance> {
    const { data } = await api.get<AccountBalance>(`/accounts/${id}/balance`)
    return data
  },

  async create(payload: AccountPayload): Promise<Account> {
    const { data } = await api.post<Account>("/accounts", payload)
    return data
  },

  async update(id: number, payload: Partial<AccountPayload>): Promise<Account> {
    const { data } = await api.patch<Account>(`/accounts/${id}`, payload)
    return data
  },

  /** Soft delete — deactivates the account on the server. */
  async deactivate(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`)
  },
}
