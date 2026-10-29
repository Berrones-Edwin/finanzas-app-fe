import { api } from "@/lib/api-client"
import type {
  Page,
  TransferCreatePayload,
  TransferFilterParams,
  TransferResponse,
} from "@/lib/types"

export const transferService = {
  async list(params: TransferFilterParams = {}): Promise<Page<TransferResponse>> {
    const { data } = await api.get<Page<TransferResponse>>("/transfers", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        ...(params.accountId !== undefined && { accountId: params.accountId }),
        ...(params.start && { start: params.start }),
        ...(params.end && { end: params.end }),
      },
    })
    return data
  },

  async single(id: number): Promise<TransferResponse> {
    const { data } = await api.get<TransferResponse>(`/transfers/${id}`)
    return data
  },

  async create(payload: TransferCreatePayload): Promise<TransferResponse> {
    const { data } = await api.post<TransferResponse>("/transfers", payload)
    return data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/transfers/${id}`)
  },
}
