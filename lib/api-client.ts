import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"
import { tokenStorage } from "@/lib/token-storage"
import type { AuthTokens } from "@/lib/types"

// ============================================================================
// Axios instance for the external Spring Boot API.
//
//  - Attaches the Bearer access token to every request.
//  - On a 401, transparently attempts a single token refresh and replays the
//    original request. Concurrent 401s share the same refresh promise.
//  - All data flows through this client; we never use a local database.
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
})

// --- Request interceptor: inject the access token --------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }
  return config
})

// --- Response interceptor: refresh-on-401 ----------------------------------
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

/** Callback invoked when the session can no longer be recovered. */
let onAuthFailure: (() => void) | null = null
export function setOnAuthFailure(cb: (() => void) | null) {
  onAuthFailure = cb
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) throw new Error("No refresh token available")

  // Use a bare axios call so we don't recurse through the interceptors.
  const { data } = await axios.post<AuthTokens>(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  )
  tokenStorage.set(data)
  return data.token
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    const isRefreshCall = original?.url?.includes("/auth/refresh")

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const newToken = await refreshPromise
        refreshPromise = null
        original.headers.set("Authorization", `Bearer ${newToken}`)
        return api(original)
      } catch (refreshError) {
        refreshPromise = null
        tokenStorage.clear()
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// ---------------------------------------------------------------------------
// Error normalization: turn any thrown value into a user-friendly message.
// ---------------------------------------------------------------------------

interface ApiErrorBody {
  message?: string
  error?: string
  errors?: Array<{ defaultMessage?: string; field?: string }>
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado. Inténtalo de nuevo.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined

    if (data?.errors?.length) {
      return data.errors
        .map((e) => e.defaultMessage ?? e.field)
        .filter(Boolean)
        .join(", ")
    }
    if (data?.message) return data.message
    if (data?.error) return data.error

    if (error.code === "ERR_NETWORK") {
      return "No se pudo conectar con el servidor. Verifica tu conexión."
    }
    if (error.response?.status === 401) {
      return "Credenciales inválidas o sesión expirada."
    }
    if (error.response?.status === 403) {
      return "No tienes permiso para realizar esta acción."
    }
    return error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
