import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import type { 
  Payment, 
  PaymentRequest, 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams,
  ID 
} from '@/core/contracts'
import { apiClient } from '@/services/api/client'
import { defaultEventBus } from '@/core/events'
import { appConfig } from '@/app/config'

// Extended payee interface for payment management
export interface Payee {
  id: ID
  userId: ID
  name: string
  type: 'individual' | 'business' | 'utility' | 'government'
  accountNumber?: string
  routingNumber?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  isActive: boolean
  createdAt: string
  metadata?: Record<string, any>
}

export interface PayeeRequest {
  name: string
  type: 'individual' | 'business' | 'utility' | 'government'
  accountNumber?: string
  routingNumber?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface ScheduledPayment {
  id: ID
  payeeId: ID
  accountId: ID
  amount: number
  currency: string
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
  nextPaymentDate: string
  endDate?: string
  isActive: boolean
  memo?: string
  createdAt: string
}

export interface ScheduledPaymentRequest {
  payeeId: ID
  accountId: ID
  amount: number
  currency: string
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'
  startDate: string
  endDate?: string
  memo?: string
}

// Payment search and filter interface
export interface PaymentFilters {
  payeeId?: ID
  accountId?: ID
  status?: Payment['status']
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string
}

// Service functions
export const paymentsService = {
  // Payment operations
  async getPayments(params?: PaginationParams & PaymentFilters): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    try {
      const response = await apiClient.get('/payments', { params })
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async getPayment(id: ID): Promise<ApiResponse<Payment>> {
    try {
      const response = await apiClient.get(`/payments/${id}`)
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async submitPayment(payment: PaymentRequest): Promise<ApiResponse<Payment>> {
    try {
      const response = await apiClient.post('/payments', payment)
      
      // Emit payment created event
      defaultEventBus.emit('payment.created', {
        payment: response.data,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      defaultEventBus.emit('payment.failed', {
        paymentRequest: payment,
        error: error as any,
        timestamp: new Date().toISOString()
      })
      
      return { error: error as any }
    }
  },

  async cancelPayment(id: ID, reason?: string): Promise<ApiResponse<Payment>> {
    try {
      const response = await apiClient.patch(`/payments/${id}/cancel`, { reason })
      
      defaultEventBus.emit('payment.cancelled', {
        paymentId: id,
        payment: response.data,
        reason,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  // Payee operations
  async getPayees(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Payee>>> {
    try {
      const response = await apiClient.get('/payees', { params })
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async getPayee(id: ID): Promise<ApiResponse<Payee>> {
    try {
      const response = await apiClient.get(`/payees/${id}`)
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async createPayee(payee: PayeeRequest): Promise<ApiResponse<Payee>> {
    try {
      const response = await apiClient.post('/payees', payee)
      
      defaultEventBus.emit('payee.created', {
        payee: response.data,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async updatePayee(id: ID, updates: Partial<PayeeRequest>): Promise<ApiResponse<Payee>> {
    try {
      const response = await apiClient.patch(`/payees/${id}`, updates)
      
      defaultEventBus.emit('payee.updated', {
        payeeId: id,
        payee: response.data,
        updates,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async deletePayee(id: ID): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/payees/${id}`)
      
      defaultEventBus.emit('payee.deleted', {
        payeeId: id,
        timestamp: new Date().toISOString()
      })

      return { data: undefined }
    } catch (error) {
      return { error: error as any }
    }
  },

  // Scheduled payment operations
  async getScheduledPayments(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ScheduledPayment>>> {
    try {
      const response = await apiClient.get('/payments/scheduled', { params })
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async getScheduledPayment(id: ID): Promise<ApiResponse<ScheduledPayment>> {
    try {
      const response = await apiClient.get(`/payments/scheduled/${id}`)
      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async createScheduledPayment(scheduledPayment: ScheduledPaymentRequest): Promise<ApiResponse<ScheduledPayment>> {
    try {
      const response = await apiClient.post('/payments/scheduled', scheduledPayment)
      
      defaultEventBus.emit('scheduledPayment.created', {
        scheduledPayment: response.data,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async updateScheduledPayment(id: ID, updates: Partial<ScheduledPaymentRequest>): Promise<ApiResponse<ScheduledPayment>> {
    try {
      const response = await apiClient.patch(`/payments/scheduled/${id}`, updates)
      
      defaultEventBus.emit('scheduledPayment.updated', {
        scheduledPaymentId: id,
        scheduledPayment: response.data,
        updates,
        timestamp: new Date().toISOString()
      })

      return { data: response.data }
    } catch (error) {
      return { error: error as any }
    }
  },

  async cancelScheduledPayment(id: ID): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/payments/scheduled/${id}`)
      
      defaultEventBus.emit('scheduledPayment.cancelled', {
        scheduledPaymentId: id,
        timestamp: new Date().toISOString()
      })

      return { data: undefined }
    } catch (error) {
      return { error: error as any }
    }
  }
}

// React hooks for payments
export const usePayments = (params?: PaginationParams & PaymentFilters) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsService.getPayments(params),
    select: (response) => response.data,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePayment = (id: ID) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsService.getPayment(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  })
}

export const useSubmitPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payment: PaymentRequest) => paymentsService.submitPayment(payment),
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate and refetch payments list
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        
        // Update individual payment cache
        queryClient.setQueryData(['payments', response.data.id], response)
        
        // Invalidate related account data
        queryClient.invalidateQueries({ queryKey: ['accounts', response.data.accountId] })
      }
    },
    onError: (error) => {
      console.error('Payment submission failed:', error)
    }
  })
}

export const useCancelPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: ID; reason?: string }) => 
      paymentsService.cancelPayment(id, reason),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Update payments list
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        
        // Update individual payment cache
        queryClient.setQueryData(['payments', variables.id], response)
      }
    }
  })
}

// Payee hooks
export const usePayees = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['payees', params],
    queryFn: () => paymentsService.getPayees(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes (payees don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const usePayee = (id: ID) => {
  return useQuery({
    queryKey: ['payees', id],
    queryFn: () => paymentsService.getPayee(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreatePayee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payee: PayeeRequest) => paymentsService.createPayee(payee),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['payees'] })
        queryClient.setQueryData(['payees', response.data.id], response)
      }
    }
  })
}

export const useUpdatePayee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: ID; updates: Partial<PayeeRequest> }) =>
      paymentsService.updatePayee(id, updates),
    onSuccess: (response, variables) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['payees'] })
        queryClient.setQueryData(['payees', variables.id], response)
      }
    }
  })
}

export const useDeletePayee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: ID) => paymentsService.deletePayee(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payees'] })
      queryClient.removeQueries({ queryKey: ['payees', id] })
    }
  })
}

// Scheduled payments hooks
export const useScheduledPayments = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['scheduledPayments', params],
    queryFn: () => paymentsService.getScheduledPayments(params),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  })
}

export const useScheduledPayment = (id: ID) => {
  return useQuery({
    queryKey: ['scheduledPayments', id],
    queryFn: () => paymentsService.getScheduledPayment(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateScheduledPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduledPayment: ScheduledPaymentRequest) =>
      paymentsService.createScheduledPayment(scheduledPayment),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['scheduledPayments'] })
        queryClient.setQueryData(['scheduledPayments', response.data.id], response)
      }
    }
  })
}

export const useUpdateScheduledPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: ID; updates: Partial<ScheduledPaymentRequest> }) =>
      paymentsService.updateScheduledPayment(id, updates),
    onSuccess: (response, variables) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['scheduledPayments'] })
        queryClient.setQueryData(['scheduledPayments', variables.id], response)
      }
    }
  })
}

export const useCancelScheduledPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: ID) => paymentsService.cancelScheduledPayment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPayments'] })
      queryClient.removeQueries({ queryKey: ['scheduledPayments', id] })
    }
  })
}

// Utility hook for payment-related data
export const usePaymentData = () => {
  const payeesQuery = usePayees()
  const paymentsQuery = usePayments()
  const scheduledPaymentsQuery = useScheduledPayments()

  const paymentUtils = useMemo(() => ({
    getPayeeById: (id: ID) => payeesQuery.data?.items.find(p => p.id === id),
    getPaymentsByStatus: (status: Payment['status']) => 
      paymentsQuery.data?.items.filter(p => p.status === status) || [],
    getUpcomingPayments: () => {
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      return scheduledPaymentsQuery.data?.items.filter(sp => {
        const nextPayment = new Date(sp.nextPaymentDate)
        return sp.isActive && nextPayment <= nextWeek
      }) || []
    }
  }), [payeesQuery.data, paymentsQuery.data, scheduledPaymentsQuery.data])

  return {
    payees: payeesQuery,
    payments: paymentsQuery,
    scheduledPayments: scheduledPaymentsQuery,
    utils: paymentUtils,
    isLoading: payeesQuery.isLoading || paymentsQuery.isLoading || scheduledPaymentsQuery.isLoading,
    error: payeesQuery.error || paymentsQuery.error || scheduledPaymentsQuery.error
  }
}

// Export commonly used function as standalone
export const submitPayment = paymentsService.submitPayment
