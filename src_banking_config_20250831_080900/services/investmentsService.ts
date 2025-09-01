import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import type { 
  ApiResponse,
  Account,
  PaginatedResponse,
  PaginationParams
} from '@/core/contracts'
import { appConfig } from '@/app/config'
import { defaultEventBus } from '@/core/events'

// Query Keys
const QUERY_KEYS = {
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  balances: ['accounts', 'balances'] as const,
} as const

// Account Service Functions
export async function getAccounts(): Promise<ApiResponse<Account[]>> {
  const response = await apiClient.get<Account[]>('/api/accounts')
  
  if (response.data) {
    defaultEventBus.emit('accounts.fetched', {
      accounts: response.data,
      timestamp: new Date().toISOString()
    })
  }
  
  return response
}

export async function getAccount(id: string): Promise<ApiResponse<Account>> {
  return apiClient.get<Account>(`/api/accounts/${id}`)
}

export async function getAccountBalances(): Promise<ApiResponse<Record<string, number>>> {
  return apiClient.get<Record<string, number>>('/api/accounts/balances')
}

export async function updateAccount(
  id: string, 
  updates: Partial<Pick<Account, 'name' | 'status'>>
): Promise<ApiResponse<Account>> {
  const response = await apiClient.put<Account>(`/api/accounts/${id}`, updates)
  
  if (response.data) {
    defaultEventBus.emit('accounts.updated', {
      account: response.data,
      timestamp: new Date().toISOString()
    })
  }
  
  return response
}

// React Query Hooks
export function useAccounts(refetchInterval?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      const response = await getAccounts()
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data!
    },
    refetchInterval: refetchInterval || (appConfig.features.realTimeUpdates ? 30000 : undefined),
    staleTime: 30000, // Consider data stale after 30 seconds
  })
}

export function useAccount(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.account(id),
    queryFn: async () => {
      const response = await getAccount(id)
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data!
    },
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  })
}

export function useAccountBalances(refetchInterval?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.balances,
    queryFn: async () => {
      const response = await getAccountBalances()
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data!
    },
    refetchInterval: refetchInterval || (appConfig.features.realTimeUpdates ? 15000 : undefined),
    staleTime: 15000, // Balances change frequently
  })
}

// Mutation Hooks
export function useUpdateAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string
      updates: Partial<Pick<Account, 'name' | 'status'>>
    }) => updateAccount(id, updates),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update the specific account in cache
        queryClient.setQueryData(
          QUERY_KEYS.account(variables.id),
          response.data
        )
        
        // Invalidate accounts list to reflect changes
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balances })
      }
    },
    onError: (error) => {
      defaultEventBus.emit('accounts.updateError', {
        error,
        timestamp: new Date().toISOString()
      })
    },
  })
}

// Utility functions
export function getTotalBalance(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    // Don't include credit accounts in total balance calculation
    if (account.type === 'credit') return total
    return total + account.balance
  }, 0)
}

export function getAccountsByType(accounts: Account[], type: Account['type']): Account[] {
  return accounts.filter(account => account.type === type)
}

export function getActiveAccounts(accounts: Account[]): Account[] {
  return accounts.filter(account => account.status === 'active')
}

export function formatAccountNumber(numberMasked: string): string {
  // Format masked account number for display
  if (numberMasked.length <= 4) return numberMasked
  return `****${numberMasked.slice(-4)}`
}

// Combined hook for dashboard overview
export function useAccountsOverview() {
  const accounts = useAccounts()
  const balances = useAccountBalances()
  
  const data = accounts.data ? {
    accounts: accounts.data,
    totalBalance: getTotalBalance(accounts.data),
    checkingAccounts: getAccountsByType(accounts.data, 'checking'),
    savingsAccounts: getAccountsByType(accounts.data, 'savings'),
    creditAccounts: getAccountsByType(accounts.data, 'credit'),
    investmentAccounts: getAccountsByType(accounts.data, 'investment'),
    balances: balances.data || {}
  } : undefined
  
  return {
    data,
    isLoading: accounts.isLoading || balances.isLoading,
    isError: accounts.isError || balances.isError,
    error: accounts.error || balances.error,
    refetch: () => {
      accounts.refetch()
      balances.refetch()
    }
  }
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses React Query and event bus
- [x] Reads config from `@/app/config`
-[x] Exports default named component - N/A (service module)
- [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A (service module)
*/
