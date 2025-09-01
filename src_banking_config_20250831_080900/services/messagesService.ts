Looking at the generated output, it contains valid TypeScript code but appears to be for `messagesService.ts` instead of the requested `accountsService.ts`. Let me generate the correct implementation for the accounts service:

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '@/services/api/client'
import { defaultEventBus } from '@/core/events'
import type { 
  Account, 
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams 
} from '@/core/contracts'

export interface AccountsService {
  getAccounts(): Promise<ApiResponse<Account[]>>
  getAccount(accountId: string): Promise<ApiResponse<Account>>
  getAccountBalance(accountId: string): Promise<ApiResponse<{ balance: number; availableBalance?: number }>>
  refreshAccountBalances(): Promise<ApiResponse<void>>
}

class AccountsServiceImpl implements AccountsService {
  async getAccounts(): Promise<ApiResponse<Account[]>> {
    try {
      const response = await apiClient.get<Account[]>('/accounts')
      
      if (response.data) {
        // Emit event for successful account fetch
        defaultEventBus.emit('account.fetched', {
          count: response.data.length,
          timestamp: new Date().toISOString()
        })
      }
      
      return response
    } catch (error) {
      const apiError = error as ApiError
      
      // Emit error event
      defaultEventBus.emit('error.reported', {
        error: apiError,
        context: { 
          service: 'accounts',
          operation: 'getAccounts'
        }
      })
      
      return { data: undefined, error: apiError }
    }
  }

  async getAccount(accountId: string): Promise<ApiResponse<Account>> {
    if (!accountId?.trim()) {
      const error: ApiError = {
        message: 'Account ID is required',
        status: 400,
        code: 'INVALID_INPUT'
      }
      return { data: undefined, error }
    }

    try {
      const response = await apiClient.get<Account>(`/accounts/${accountId}`)
      
      if (response.data) {
        // Emit event for successful single account fetch
        defaultEventBus.emit('account.fetched', {
          accountId,
          account: response.data,
          timestamp: new Date().toISOString()
        })
      }
      
      return response
    } catch (error) {
      const apiError = error as ApiError
      
      defaultEventBus.emit('error.reported', {
        error: apiError,
        context: { 
          service: 'accounts',
          operation: 'getAccount',
          accountId
        }
      })
      
      return { data: undefined, error: apiError }
    }
  }

  async getAccountBalance(accountId: string): Promise<ApiResponse<{ balance: number; availableBalance?: number }>> {
    if (!accountId?.trim()) {
      const error: ApiError = {
        message: 'Account ID is required',
        status: 400,
        code: 'INVALID_INPUT'
      }
      return { data: undefined, error }
    }

    try {
      const response = await apiClient.get<{ balance: number; availableBalance?: number }>(`/accounts/${accountId}/balance`)
      
      if (response.data) {
        // Emit balance fetched event
        defaultEventBus.emit('account.balance.fetched', {
          accountId,
          balance: response.data.balance,
          availableBalance: response.data.availableBalance,
          timestamp: new Date().toISOString()
        })
      }
      
      return response
    } catch (error) {
      const apiError = error as ApiError
      
      defaultEventBus.emit('error.reported', {
        error: apiError,
        context: { 
          service: 'accounts',
          operation: 'getAccountBalance',
          accountId
        }
      })
      
      return { data: undefined, error: apiError }
    }
  }

  async refreshAccountBalances(): Promise<ApiResponse<void>> {
    try {
      // Emit refresh started event
      defaultEventBus.emit('account.balance.refreshing', {
        timestamp: new Date().toISOString()
      })

      const response = await apiClient.post<void>('/accounts/refresh-balances', {})
      
      if (response.error === null) {
        // Emit successful refresh event
        defaultEventBus.emit('account.balance.refreshed', {
          timestamp: new Date().toISOString()
        })
      }
      
      return response
    } catch (error) {
      const apiError = error as ApiError
      
      // Emit refresh failed event
      defaultEventBus.emit('account.balance.refreshFailed', {
        error: apiError,
        timestamp: new Date().toISOString()
      })
      
      defaultEventBus.emit('error.reported', {
        error: apiError,
        context: { 
          service: 'accounts',
          operation: 'refreshAccountBalances'
        }
      })
      
      return { data: undefined, error: apiError }
    }
  }
}

// Create singleton instance
export const accountsService: AccountsService = new AccountsServiceImpl()

// Hook options interface
export interface UseAccountsOptions {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

export interface UseAccountOptions extends UseAccountsOptions {
  accountId: string
}

// React Query hook for all accounts
export function useAccounts(options: UseAccountsOptions = {}) {
  const { enabled = true, refetchInterval, staleTime = 60000 } = options
  
  return useQuery({
    queryKey: ['accounts'] as const,
    queryFn: async () => {
      const response = await accountsService.getAccounts()
      if (response.error) {
        throw response.error
      }
      return response.data || []
    },
    enabled,
    refetchInterval,
    staleTime, // 1 minute default
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 3
    }
  })
}

// React Query hook for single account
export function useAccount(options: UseAccountOptions) {
  const { accountId, enabled = true, refetchInterval, staleTime = 60000 } = options
  
  return useQuery({
    queryKey: ['accounts', accountId] as const,
    queryFn: async () => {
      const response = await accountsService.getAccount(accountId)
      if (response.error) {
        throw response.error
      }
      return response.data
    },
    enabled: enabled && !!accountId,
    refetchInterval,
    staleTime, // 1 minute default
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors or 404s
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        return false
      }
      return failureCount < 3
    }
  })
}

// React Query hook for account balance
export function useAccountBalance(options: UseAccountOptions) {
  const { accountId, enabled = true, refetchInterval = 30000, staleTime = 15000 } = options
  
  return useQuery({
    queryKey: ['accounts', accountId, 'balance'] as const,
    queryFn: async () => {
      const response = await accountsService.getAccountBalance(accountId)
      if (response.error) {
        throw response.error
      }
      return response.data
    },
    enabled: enabled && !!accountId,
    refetchInterval, // 30 seconds default for balance updates
    staleTime, // 15 seconds for more frequent balance updates
    cacheTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors or 404s
      if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Service function for direct access (non-hook usage)
export async function getAccounts(): Promise<Account[]> {
  const response = await accountsService.getAccounts()
  if (response.error) {
    throw response.error
  }
  return response.data || []
}

// Service function for getting single account
export async function getAccount(accountId: string): Promise<Account | null> {
  const response = await accountsService.getAccount(accountId)
  if (response.error) {
    throw response.error
  }
  return response.data || null
}

// Service function for getting account balance
export async function getAccountBalance(accountId: string): Promise<{ balance: number; availableBalance?: number } | null> {
  const response = await accountsService.getAccountBalance(accountId)
  if (response.error) {
    throw response.error
  }
  return response.data || null
}

// Service function for refreshing balances
export async function refreshAccountBalances(): Promise<void> {
  const response = await accountsService.refreshAccountBalances()
  if (response.error) {
    throw response.error
  }
}

// WebSocket event handlers for real-time account updates
export function setupAccountWebSocketHandlers() {
  // Listen for account balance updates from WebSocket
  defaultEventBus.on('websocket.messageReceived', (data: any) => {
    if (data.type === 'account_balance_updated') {
      // Emit local event to trigger UI updates
      defaultEventBus.emit('account.updated', {
        accountId: data.accountId,
        changes: {
          balance: data.balance,
          availableBalance: data.availableBalance
        }
      })
    }
  })

  // Listen for account status changes from WebSocket
  defaultEventBus.on('websocket.messageReceived', (data: any) => {
    if (data.type === 'account_status_changed') {
      defaultEventBus.emit('account.updated', {
        accountId: data.accountId,
        changes: {
          status: data.status
        }
      })
    }
  })

  // Listen for new account creation from WebSocket
  defaultEventBus.on('websocket.messageReceived', (data: any) => {
    if (data.type === 'account_created') {
      defaultEventBus.emit('account.created', {
        account: data.account,
        timestamp: new Date().toISOString()
      })
    }
  })
}

// Initialize WebSocket handlers when module is imported
setupAccountWebSocketHandlers()

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses event bus and API client service
- [x] Reads config from `@/app/config` - indirectly through API client
- [x] Exports default named component - N/A (service module)  
- [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A (service module)
*/
