import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import type { Account, ApiResponse, PaginatedResponse, PaginationParams } from '@/core/contracts'

// Query Keys
const ACCOUNTS_QUERY_KEYS = {
  all: ['accounts'] as const,
  lists: () => [...ACCOUNTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ACCOUNTS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ACCOUNTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ACCOUNTS_QUERY_KEYS.details(), id] as const,
  balances: () => [...ACCOUNTS_QUERY_KEYS.all, 'balances'] as const,
}

// Service Functions
export async function getAccounts(): Promise<ApiResponse<Account[]>> {
  try {
    const response = await apiClient.get<Account[]>('/accounts')
    return response
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch accounts',
        status: 500
      }
    }
  }
}

export async function getAccountById(id: string): Promise<ApiResponse<Account>> {
  try {
    const response = await apiClient.get<Account>(`/accounts/${id}`)
    return response
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch account',
        status: 500
      }
    }
  }
}

export async function getAccountsWithPagination(
  params: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<Account>>> {
  try {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.direction) queryParams.append('direction', params.direction)
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `/accounts?${queryParams.toString()}`
    const response = await apiClient.get<PaginatedResponse<Account>>(url)
    return response
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch accounts',
        status: 500
      }
    }
  }
}

export async function getAccountBalances(): Promise<ApiResponse<Record<string, number>>> {
  try {
    const response = await apiClient.get<Record<string, number>>('/accounts/balances')
    return response
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch account balances',
        status: 500
      }
    }
  }
}

// React Query Hooks
export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.lists(),
    queryFn: async () => {
      const result = await getAccounts()
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3 && error instanceof Error) {
        return !error.message.includes('401') && !error.message.includes('403')
      }
      return false
    }
  })
}

export function useAccount(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const result = await getAccountById(id)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAccountsWithPagination(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.list(params),
    queryFn: async () => {
      const result = await getAccountsWithPagination(params)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true, // Keep previous data while loading new page
  })
}

export function useAccountBalances() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.balances(),
    queryFn: async () => {
      const result = await getAccountBalances()
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data || {}
    },
    staleTime: 1 * 60 * 1000, // 1 minute (balances change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

// Utility functions for account data processing
export function getTotalBalance(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    // Only include checking and savings accounts in total balance
    if (account.type === 'checking' || account.type === 'savings') {
      return total + account.balance
    }
    // Subtract credit card balances (they represent debt)
    if (account.type === 'credit') {
      return total - Math.abs(account.balance)
    }
    return total
  }, 0)
}

export function getAccountsByType(accounts: Account[], type: Account['type']): Account[] {
  return accounts.filter(account => account.type === type)
}

export function getActiveAccounts(accounts: Account[]): Account[] {
  return accounts.filter(account => 
    !account.status || account.status === 'active'
  )
}

export function formatAccountNumber(numberMasked: string): string {
  // Format masked account number for display
  // e.g., "****1234" -> "**** 1234"
  if (numberMasked.includes('*')) {
    const stars = numberMasked.match(/\*+/)?.[0] || ''
    const digits = numberMasked.replace(/\*+/, '')
    return `${stars} ${digits}`.trim()
  }
  return numberMasked
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses React Query hooks
- [x] Reads config from `@/app/config` - Uses apiClient which reads config internally
- [x] Exports default named component - Not applicable, exports service functions and hooks
- [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for service layer
*/
