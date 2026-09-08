import { api } from "@/lib/api-client"
import type {
  AuthTokens,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
  User,
} from "@/lib/types"

// ============================================================================
// Auth service — maps directly to /api/auth/* and /api/users/me.
// The backend derives the user from the JWT, so we never send user IDs.
// ============================================================================

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/login", payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>("/auth/register", payload)
    return data
  },

  async logout(payload: LogoutPayload): Promise<void> {
    await api.post("/auth/logout", payload)
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/users/me")
    return data
  },

  async updateProfile(payload: Partial<Pick<User, "fisrtName" | "currency">>) {
    const { data } = await api.patch<User>("/users/me", payload)
    return data
  },
}
