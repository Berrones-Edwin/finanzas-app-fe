"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { setOnAuthFailure } from "@/lib/api-client"
import { tokenStorage } from "@/lib/token-storage"
import { authService } from "@/lib/services/auth-service"
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/lib/types"

// ============================================================================
// AuthContext — global session state.
//
//  - Holds the authenticated user (loaded from /api/users/me).
//  - Exposes login / register / logout.
//  - "status" drives route guarding: loading -> authenticated | unauthenticated
// ============================================================================

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  const loadUser = useCallback(async () => {
    try {
      const profile = await authService.me()
      setUser(profile)
      setStatus("authenticated")
    } catch {
      tokenStorage.clear()
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  // On mount: if we have a token, hydrate the user; otherwise mark logged out.
  useEffect(() => {
    if (tokenStorage.getAccess()) {
      void loadUser()
    } else {
      setStatus("unauthenticated")
    }
  }, [loadUser])

  // When a refresh ultimately fails, the api client tells us to log out.
  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null)
      setStatus("unauthenticated")
    })
    return () => setOnAuthFailure(null)
  }, [])

  const persistAndLoad = useCallback(
    async (tokens: AuthTokens) => {
      tokenStorage.set(tokens)
      setStatus("loading")
      await loadUser()
    },
    [loadUser],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authService.login(payload)
      await persistAndLoad(tokens)
    },
    [persistAndLoad],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authService.register(payload)
      await persistAndLoad(tokens)
    },
    [persistAndLoad],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Even if the server call fails we clear the local session.
    } finally {
      tokenStorage.clear()
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refreshUser: loadUser }),
    [user, status, login, register, logout, loadUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
