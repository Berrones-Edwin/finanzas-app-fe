"use client"

import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { accountService } from "@/lib/services/account-service"
import type { AccountPayload, PageParams } from "@/lib/types"

// ============================================================================
// React Query hooks for the Accounts domain, including balances.
// ============================================================================

const KEY = "accounts"
const BALANCE_KEY = "account-balance"

export function useAccounts(params: PageParams) {
  return useQuery({
    queryKey:  [KEY, params.page ?? 0, params.size ?? 10],
    queryFn: () => accountService.list(params),
    placeholderData:keepPreviousData
  })
}

/** Fetches balances for many accounts in parallel and maps them by id. */
export function useAccountBalances(ids: number[]) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: [BALANCE_KEY, id],
      queryFn: () => accountService.balance(id),
      staleTime: 15_000,
    })),
  })

  const byId = new Map<number, number>()
  results.forEach((r, i) => {
    if (r.data) byId.set(ids[i], r.data.balance)
  })

  return { byId, isLoading: results.some((r) => r.isLoading) }
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccountPayload) => accountService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<AccountPayload>
    }) => accountService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeactivateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => accountService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
