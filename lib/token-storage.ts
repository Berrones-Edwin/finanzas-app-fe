import type { AuthTokens } from "@/lib/types"

// ============================================================================
// Token storage — single source of truth for JWT persistence.
// Kept isolated so the storage mechanism can be swapped without touching the
// rest of the app. We intentionally persist tokens for session continuity.
// ============================================================================

const ACCESS_KEY = "fin.accessToken"
const REFRESH_KEY = "fin.refreshToken"

const isBrowser = typeof window !== "undefined"

export const tokenStorage = {
  getAccess(): string | null {
    if (!isBrowser) return null
    return window.localStorage.getItem(ACCESS_KEY)
  },
  getRefresh(): string | null {
    if (!isBrowser) return null
    return window.localStorage.getItem(REFRESH_KEY)
  },
  set(tokens: AuthTokens): void {
    if (!isBrowser) return
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken)
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  },
  clear(): void {
    if (!isBrowser) return
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
  },
}
