import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import { Account, ApiResponse, ID, PaginationParams, PaginatedResponse } from '@/core/contracts'

// Query keys for consistent caching
export const ACCOUNTS_QUERY_KEYS = {
  all: ['accounts'] as const,
  lists: () => [...ACCOUNTS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams) => [...ACCOUNTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...ACCOUNTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: ID) => [...ACCOUNTS_QUERY_KEYS.details(), id] as const,
  balances: () => [...ACCOUNTS_QUERY_KEYS.all, 'balances'] as const,
}

// Service functions (can be used independently or by hooks)
export async function getAccounts(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Account>>> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.perPage) queryParams.set('perPage', params.perPage.toString())
    if (params?.sort) queryParams.set('sort', params.sort)
    if (params?.direction) queryParams.set('direction', params.direction)
    
    const url = `/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.request<PaginatedResponse<Account>>('GET', url)
    return { data: response, error: null }
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch accounts',
        code: 'FETCH_ACCOUNTS_ERROR'
      }
    }
  }
}

export async function getAccount(accountId: ID): Promise<ApiResponse<Account>> {
  try {
    const response = await apiClient.request<Account>('GET', `/accounts/${accountId}`)
    return { data: response, error: null }
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch account',
        code: 'FETCH_ACCOUNT_ERROR'
      }
    }
  }
}

export async function getAccountBalances(accountIds?: ID[]): Promise<ApiResponse<Record<ID, { balance: number; availableBalance?: number }>>> {
  try {
    const queryParams = new URLSearchParams()
    if (accountIds?.length) {
      accountIds.forEach(id => queryParams.append('accountId', id))
    }
    
    const url = `/accounts/balances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.request<Record<ID, { balance: number; availableBalance?: number }>>('GET', url)
    return { data: response, error: null }
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch account balances',
        code: 'FETCH_BALANCES_ERROR'
      }
    }
  }
}

// React Query hooks
export function useAccounts(params?: PaginationParams) {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.list(params),
    queryFn: () => getAccounts(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

export function useAccount(accountId: ID, enabled = true) {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.detail(accountId),
    queryFn: () => getAccount(accountId),
    select: (response) => response.data,
    enabled: !!accountId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useAccountBalances(accountIds?: ID[]) {
  return useQuery({
    queryKey: [...ACCOUNTS_QUERY_KEYS.balances(), accountIds],
    queryFn: () => getAccountBalances(accountIds),
    select: (response) => response.data,
    enabled: !!accountIds && accountIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (balances change more frequently)
    retry: 3,
  })
}

// Mutation hooks for account updates (if needed)
export function useUpdateAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: ID; updates: Partial<Account> }) => {
      const response = await apiClient.request<Account>('PUT', `/accounts/${accountId}`, updates)
      return response
    },
    onSuccess: (updatedAccount) => {
      // Invalidate and update caches
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEYS.all })
      queryClient.setQueryData(
        ACCOUNTS_QUERY_KEYS.detail(updatedAccount.id),
        { data: updatedAccount, error: null }
      )
    },
    onError: (error) => {
      console.error('Failed to update account:', error)
    }
  })
}

// Helper hook to refresh all account-related data
export function useRefreshAccounts() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEYS.all })
  }
}

// Hook to get aggregated account data (total balances, etc.)
export function useAccountsSummary() {
  const { data: accounts, ...query } = useAccounts()
  
  const summary = accounts?.items ? {
    totalBalance: accounts.items.reduce((sum, account) => sum + account.balance, 0),
    totalAvailableBalance: accounts.items.reduce((sum, account) => sum + (account.availableBalance || account.balance), 0),
    accountsByType: accounts.items.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    totalAccounts: accounts.items.length,
  } : null
  
  return {
    ...query,
    data: accounts,
    summary
  }
}
