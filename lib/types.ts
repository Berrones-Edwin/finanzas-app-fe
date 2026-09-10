// ============================================================================
// Domain types — mirror the Spring Boot API contracts.
// ============================================================================

export type AccountType = "CASH" | "BANK" | "CREDIT" | "SAVINGS"
export type FlowTypeApi = "INCOME" | "EXPENSE"

// ---------------------------------------------------------------------------
// Auth & User
// ---------------------------------------------------------------------------

export interface AuthTokens {
  token: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  preferredCurrency?: string
}

export interface LogoutPayload {
  token: string
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
// ============================================
// Budget
// ============================================

export interface BudgetCreateRequest {
  categoryId: number;
  month: string;
  amount: number;
  alertThreshold?: number;
  notes?: string;
}

export interface BudgetUpdateRequest {
  amount: number;
  alertThreshold?: number;
  notes?: string;
}

export interface BudgetResponse {
  id: number;
  category: BudgetCategoryResponse;
  month: string;
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isAlertSent: boolean;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface Account {
  id: number
  name: string
  accountType: AccountType
  currency: string
  balance?: number
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
  accountType: AccountType
  currency: string
  color: string
  balance:number
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
export interface BudgetCategoryResponse {
  name: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------


export interface TransactionCreatePayload {
  accountId: number;
  categoryId: number;
  transactionType: FlowTypeApi;
  amount: number;
  description: string;
  date: string;
}

export interface TransactionAccountResponse {
  id: number;
  name: string;
  accountType: AccountType;
  currency: string;
  color: string;
  balance: number;
}

export interface TransactionCategoryResponse {
  id: number;
  name: string;
  color: string;
  categoryType: FlowTypeApi;
}

export interface TransactionResponse {
  id: number;
  category: TransactionCategoryResponse;
  account: TransactionAccountResponse;
  transactionType: FlowTypeApi;
  amount: number;
  description: string;
  date: string;
}
// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------
export interface TransferCreatePayload {
  fromAccount: number;
  toAccount: number;
  amount: number;
  description?: string;
  date: string;
}

export interface TransferAccountResponse {
  id: number;
  name: string;
  color: string;
  type: AccountType;
}

export interface TransferResponse {
  id: number;
  amount: number;
  description: string;
  date: string;
  fromAccount: TransferAccountResponse;
  toAccount: TransferAccountResponse;
}

// ============================================
// Dashboard
// ============================================

export interface DashboardSummaryResponse {
  income: number;
  expensess: number;
  balance: number;
  savingsRate: number;
}

export interface DashboardTrendsResponse {
  yearmonth: string;
  month: string;
  income: number;
  expense: number;
}

export interface DashboardByCategoryResponse {
  categoryId: number;
  categoryName: string;
  amount: number;
}

export interface DashboardByAccountResponse {
  accountId: number;
  accountName: string;
  amount: number;
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
