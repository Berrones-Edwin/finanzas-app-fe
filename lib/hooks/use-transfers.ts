"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { transferService } from "@/lib/services/transfer-service"
import type { TransferCreatePayload, TransferFilterParams } from "@/lib/types"

const KEY = "transfers"

export function useTransfers(params: TransferFilterParams = {}) {
  return useQuery({
    queryKey: [
      KEY,
      params.page ?? 0,
      params.size ?? 10,
      params.accountId ?? null,
      params.start ?? null,
      params.end ?? null,
    ],
    queryFn: () => transferService.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useTransfer(id: number) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => transferService.single(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TransferCreatePayload) => transferService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transferService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
