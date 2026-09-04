// ============================================================================
// Domain types — mirror the Spring Boot API contracts.
// ============================================================================

export type AccountType = "cash" | "bank" | "credit" | "savings"
export type FlowType = "income" | "expense"
/** The backend serializes enums in UPPERCASE (e.g. "EXPENSE"). */
export type FlowTypeApi = "INCOME" | "EXPENSE"

// ---------------------------------------------------------------------------
// Auth & User
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  currency?: string
}

export interface User {
  id: number
  fisrtName: string
  lastName: string
  email: string
  currency: string
  createdAt?: string
  updatedAt?: string
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface Account {
  id: number
  name: string
  type: AccountType
  currency: string
  color: string
  isActive: boolean
  createdAt?: string
}

export interface AccountBalance {
  accountId: number
  accountName: string
  balance: number
  currency: string
  updatedAt: string
}

export interface AccountPayload {
  name: string
  type: AccountType
  currency: string
  color: string
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface Category {
  id: number
  name: string
  /** API field is `categoryType` and is UPPERCASE. */
  categoryType: FlowTypeApi
  color: string
  icon?: string
  created_at?: string
}

export interface CategoryPayload {
  name: string
  categoryType: FlowTypeApi
  color: string
  icon?: string
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export interface Transaction {
  id: number
  categoryId: number
  accountId: number
  type: FlowTypeApi
  amount: number
  description?: string
  date: string
  createdAt?: string
}

export interface TransactionPayload {
  categoryId: number
  accountId: number
  type: FlowTypeApi
  amount: number
  description?: string
  date: string
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------

export interface Transfer {
  id: number
  fromAccountId: number
  toAccountId: number
  amount: number
  description?: string
  date: string
  createdAt?: string
}

export interface TransferPayload {
  fromAccountId: number
  toAccountId: number
  amount: number
  description?: string
  date: string
}

// ---------------------------------------------------------------------------
// Generic pagination wrapper used across list endpoints
// ---------------------------------------------------------------------------

export interface Page<T> {
  content: T[]
  number: number
  size: number
  total: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PageParams {
  page?: number
  size?: number
}
