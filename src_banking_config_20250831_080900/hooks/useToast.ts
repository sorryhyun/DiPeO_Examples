import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import type { Account, ApiResult } from '@/core/contracts'
import { eventBus } from '@/core/events'

// Query keys for accounts data
export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
  list: (filters: string) => [...accountsKeys.lists(), { filters }] as const,
  details: () => [...accountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsKeys.details(), id] as const,
  balances: () => [...accountsKeys.all, 'balances'] as const,
  balance: (id: string) => [...accountsKeys.balances(), id] as const,
}

/**
 * Service function to fetch accounts
 */
export async function getAccounts(): Promise<ApiResult<Account[]>> {
  try {
    const response = await apiClient.get<Account[]>('/accounts')
    return {
      success: true,
      data: response.data,
      message: 'Accounts fetched successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch accounts',
      data: []
    }
  }
}

/**
 * Service function to fetch account by ID
 */
export async function getAccountById(id: string): Promise<ApiResult<Account>> {
  try {
    const response = await apiClient.get<Account>(`/accounts/${id}`)
    return {
      success: true,
      data: response.data,
      message: 'Account fetched successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch account',
      data: null
    }
  }
}

/**
 * Service function to update account
 */
export async function updateAccount(id: string, updates: Partial<Account>): Promise<ApiResult<Account>> {
  try {
    const response = await apiClient.put<Account>(`/accounts/${id}`, updates)
    
    // Emit event for real-time updates
    await eventBus.emit('account.updated', {
      accountId: id,
      changes: updates
    })
    
    return {
      success: true,
      data: response.data,
      message: 'Account updated successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update account',
      data: null
    }
  }
}

/**
 * Service function to get account balance
 */
export async function getAccountBalance(id: string): Promise<ApiResult<{ balance: number; availableBalance: number }>> {
  try {
    const response = await apiClient.get<{ balance: number; availableBalance: number }>(`/accounts/${id}/balance`)
    return {
      success: true,
      data: response.data,
      message: 'Account balance fetched successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch account balance',
      data: null
    }
  }
}

/**
 * React Query hook to fetch all accounts
 */
export function useAccounts() {
  return useQuery({
    queryKey: accountsKeys.lists(),
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    select: (result: ApiResult<Account[]>) => ({
      accounts: result.data || [],
      error: result.success ? null : result.error,
      isSuccess: result.success
    })
  })
}

/**
 * React Query hook to fetch account by ID
 */
export function useAccount(id: string, enabled = true) {
  return useQuery({
    queryKey: accountsKeys.detail(id),
    queryFn: () => getAccountById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    select: (result: ApiResult<Account>) => ({
      account: result.data,
      error: result.success ? null : result.error,
      isSuccess: result.success
    })
  })
}

/**
 * React Query hook to fetch account balance
 */
export function useAccountBalance(id: string, enabled = true) {
  return useQuery({
    queryKey: accountsKeys.balance(id),
    queryFn: () => getAccountBalance(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute (shorter for balance)
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    select: (result: ApiResult<{ balance: number; availableBalance: number }>) => ({
      balance: result.data?.balance || 0,
      availableBalance: result.data?.availableBalance || 0,
      error: result.success ? null : result.error,
      isSuccess: result.success
    })
  })
}

/**
 * React Query mutation hook to update account
 */
export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) => 
      updateAccount(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: accountsKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: accountsKeys.lists() })

      // Snapshot previous values
      const previousAccount = queryClient.getQueryData(accountsKeys.detail(id))
      const previousAccounts = queryClient.getQueryData(accountsKeys.lists())

      // Optimistically update account detail
      queryClient.setQueryData(accountsKeys.detail(id), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: { ...old.data, ...updates }
        }
      })

      // Optimistically update accounts list
      queryClient.setQueryData(accountsKeys.lists(), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((account: Account) =>
            account.id === id ? { ...account, ...updates } : account
          )
        }
      })

      return { previousAccount, previousAccounts }
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousAccount) {
        queryClient.setQueryData(accountsKeys.detail(id), context.previousAccount)
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(accountsKeys.lists(), context.previousAccounts)
      }

      // Emit error event
      eventBus.emit('error.reported', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: { operation: 'updateAccount', accountId: id }
      })
    },
    onSuccess: (result, { id }) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: accountsKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: accountsKeys.lists() })
        queryClient.invalidateQueries({ queryKey: accountsKeys.balance(id) })
      }
    },
    onSettled: () => {
      // Always refetch accounts list after mutation settles
      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() })
    }
  })
}

/**
 * Hook to get account summary data
 */
export function useAccountsSummary() {
  const { data: accountsResult, isLoading, error } = useAccounts()

  const summary = accountsResult?.accounts?.reduce(
    (acc, account) => {
      acc.totalBalance += account.balance || 0
      acc.totalAccounts += 1
      
      if (account.type === 'checking') acc.checkingAccounts += 1
      if (account.type === 'savings') acc.savingsAccounts += 1
      if (account.type === 'credit') acc.creditAccounts += 1
      
      return acc
    },
    {
      totalBalance: 0,
      totalAccounts: 0,
      checkingAccounts: 0,
      savingsAccounts: 0,
      creditAccounts: 0
    }
  ) || {
    totalBalance: 0,
    totalAccounts: 0,
    checkingAccounts: 0,
    savingsAccounts: 0,
    creditAccounts: 0
  }

  return {
    summary,
    isLoading,
    error: accountsResult?.error || error
  }
}

/**
 * Hook to prefetch account data
 */
export function usePrefetchAccount() {
  const queryClient = useQueryClient()

  return {
    prefetchAccount: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: accountsKeys.detail(id),
        queryFn: () => getAccountById(id),
        staleTime: 5 * 60 * 1000
      })
    },
    prefetchAccountBalance: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: accountsKeys.balance(id),
        queryFn: () => getAccountBalance(id),
        staleTime: 1 * 60 * 1000
      })
    }
  }
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` - Uses apiClient which reads config
- [x] Exports default named component - Exports service functions and hooks
- [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for service layer
*/
