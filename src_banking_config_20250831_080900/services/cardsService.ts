import type { Card, CardUpdate, ApiResponse, TravelNotification, CardStatement } from '@/core/contracts'
import { apiClient } from '@/services/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { defaultEventBus } from '@/core/events'
import { shouldUseMockData } from '@/app/config'

// Query keys for React Query
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...cardKeys.lists(), { filters }] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
  statements: (id: string) => [...cardKeys.detail(id), 'statements'] as const,
  travelNotifications: (id: string) => [...cardKeys.detail(id), 'travel-notifications'] as const,
}

// Service functions
export const cardsService = {
  // Get all user cards
  async getCards(): Promise<ApiResponse<Card[]>> {
    return apiClient.get<Card[]>('/cards')
  },

  // Get specific card details
  async getCard(cardId: string): Promise<ApiResponse<Card>> {
    return apiClient.get<Card>(`/cards/${cardId}`)
  },

  // Update card settings (lock/unlock, spending limits, etc.)
  async updateCard(cardId: string, updates: CardUpdate): Promise<ApiResponse<Card>> {
    const response = await apiClient.patch<Card>(`/cards/${cardId}`, updates)
    
    if (!response.error) {
      defaultEventBus.emit('cards.updated', {
        cardId,
        updates,
        card: response.data,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Lock card (emergency action)
  async lockCard(cardId: string, reason?: string): Promise<ApiResponse<Card>> {
    const response = await apiClient.post<Card>(`/cards/${cardId}/lock`, { reason })
    
    if (!response.error) {
      defaultEventBus.emit('cards.locked', {
        cardId,
        reason,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Unlock card
  async unlockCard(cardId: string): Promise<ApiResponse<Card>> {
    const response = await apiClient.post<Card>(`/cards/${cardId}/unlock`)
    
    if (!response.error) {
      defaultEventBus.emit('cards.unlocked', {
        cardId,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Set travel notification for card
  async setTravelNotification(
    cardId: string, 
    notification: Omit<TravelNotification, 'id' | 'cardId' | 'createdAt'>
  ): Promise<ApiResponse<TravelNotification>> {
    const response = await apiClient.post<TravelNotification>(
      `/cards/${cardId}/travel-notifications`, 
      notification
    )
    
    if (!response.error) {
      defaultEventBus.emit('cards.travelNotificationSet', {
        cardId,
        notification: response.data,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Remove travel notification
  async removeTravelNotification(
    cardId: string, 
    notificationId: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(
      `/cards/${cardId}/travel-notifications/${notificationId}`
    )
    
    if (!response.error) {
      defaultEventBus.emit('cards.travelNotificationRemoved', {
        cardId,
        notificationId,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Get travel notifications for card
  async getTravelNotifications(cardId: string): Promise<ApiResponse<TravelNotification[]>> {
    return apiClient.get<TravelNotification[]>(`/cards/${cardId}/travel-notifications`)
  },

  // Get card statements
  async getCardStatements(
    cardId: string, 
    params?: { 
      year?: number
      month?: number
      limit?: number 
    }
  ): Promise<ApiResponse<CardStatement[]>> {
    const searchParams = new URLSearchParams()
    
    if (params?.year) searchParams.append('year', params.year.toString())
    if (params?.month) searchParams.append('month', params.month.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    const url = `/cards/${cardId}/statements${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<CardStatement[]>(url)
  },

  // Download statement PDF
  async downloadStatement(cardId: string, statementId: string): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(`/cards/${cardId}/statements/${statementId}/download`, {
      headers: { 'Accept': 'application/pdf' }
    })
  },

  // Report card as lost or stolen
  async reportCard(
    cardId: string, 
    reportType: 'lost' | 'stolen',
    details?: string
  ): Promise<ApiResponse<Card>> {
    const response = await apiClient.post<Card>(`/cards/${cardId}/report`, {
      type: reportType,
      details
    })
    
    if (!response.error) {
      defaultEventBus.emit('cards.reported', {
        cardId,
        reportType,
        details,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  },

  // Request replacement card
  async requestReplacement(
    cardId: string, 
    reason: 'damaged' | 'lost' | 'stolen' | 'expired',
    expedite: boolean = false
  ): Promise<ApiResponse<Card>> {
    const response = await apiClient.post<Card>(`/cards/${cardId}/replacement`, {
      reason,
      expedite
    })
    
    if (!response.error) {
      defaultEventBus.emit('cards.replacementRequested', {
        cardId,
        reason,
        expedite,
        timestamp: new Date().toISOString()
      })
    }
    
    return response
  }
}

// Hook: Get all user cards
export function useCards() {
  return useQuery({
    queryKey: cardKeys.lists(),
    queryFn: () => cardsService.getCards(),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if ((error as any)?.status === 401) return false
      return failureCount < 2
    }
  })
}

// Hook: Get specific card
export function useCard(cardId: string) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => cardsService.getCard(cardId),
    select: (response) => response.data,
    enabled: !!cardId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook: Get card statements
export function useCardStatements(
  cardId: string, 
  params?: { year?: number; month?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...cardKeys.statements(cardId), params],
    queryFn: () => cardsService.getCardStatements(cardId, params),
    select: (response) => response.data || [],
    enabled: !!cardId,
    staleTime: 10 * 60 * 1000, // 10 minutes (statements don't change often)
  })
}

// Hook: Get travel notifications
export function useTravelNotifications(cardId: string) {
  return useQuery({
    queryKey: cardKeys.travelNotifications(cardId),
    queryFn: () => cardsService.getTravelNotifications(cardId),
    select: (response) => response.data || [],
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation hook: Update card
export function useUpdateCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ cardId, updates }: { cardId: string; updates: CardUpdate }) =>
      cardsService.updateCard(cardId, updates),
    onSuccess: (response, { cardId }) => {
      if (response.data) {
        // Update card in cache
        queryClient.setQueryData(cardKeys.detail(cardId), response)
        
        // Update card in lists cache
        queryClient.setQueryData(cardKeys.lists(), (old: ApiResponse<Card[]> | undefined) => {
          if (!old?.data) return old
          
          return {
            ...old,
            data: old.data.map(card => 
              card.id === cardId ? response.data! : card
            )
          }
        })
      }
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) })
    }
  })
}

// Mutation hook: Lock card
export function useLockCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ cardId, reason }: { cardId: string; reason?: string }) =>
      cardsService.lockCard(cardId, reason),
    onSuccess: (response, { cardId }) => {
      if (response.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), response)
      }
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    }
  })
}

// Mutation hook: Unlock card
export function useUnlockCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (cardId: string) => cardsService.unlockCard(cardId),
    onSuccess: (response, cardId) => {
      if (response.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), response)
      }
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    }
  })
}

// Mutation hook: Set travel notification
export function useSetTravelNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      cardId, 
      notification 
    }: { 
      cardId: string
      notification: Omit<TravelNotification, 'id' | 'cardId' | 'createdAt'>
    }) => cardsService.setTravelNotification(cardId, notification),
    onSuccess: (response, { cardId }) => {
      if (response.data) {
        // Add to travel notifications cache
        queryClient.setQueryData(
          cardKeys.travelNotifications(cardId), 
          (old: ApiResponse<TravelNotification[]> | undefined) => {
            if (!old?.data) return { data: [response.data!], error: null }
            
            return {
              ...old,
              data: [...old.data, response.data!]
            }
          }
        )
      }
    }
  })
}

// Mutation hook: Remove travel notification
export function useRemoveTravelNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ cardId, notificationId }: { cardId: string; notificationId: string }) =>
      cardsService.removeTravelNotification(cardId, notificationId),
    onSuccess: (response, { cardId, notificationId }) => {
      if (!response.error) {
        // Remove from travel notifications cache
        queryClient.setQueryData(
          cardKeys.travelNotifications(cardId), 
          (old: ApiResponse<TravelNotification[]> | undefined) => {
            if (!old?.data) return old
            
            return {
              ...old,
              data: old.data.filter(notification => notification.id !== notificationId)
            }
          }
        )
      }
    }
  })
}

// Mutation hook: Report card
export function useReportCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      cardId, 
      reportType, 
      details 
    }: { 
      cardId: string
      reportType: 'lost' | 'stolen'
      details?: string
    }) => cardsService.reportCard(cardId, reportType, details),
    onSuccess: (response, { cardId }) => {
      if (response.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), response)
      }
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    }
  })
}

// Mutation hook: Request replacement
export function useRequestReplacement() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      cardId, 
      reason, 
      expedite 
    }: { 
      cardId: string
      reason: 'damaged' | 'lost' | 'stolen' | 'expired'
      expedite?: boolean
    }) => cardsService.requestReplacement(cardId, reason, expedite),
    onSuccess: (response, { cardId }) => {
      if (response.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), response)
      }
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    }
  })
}

// Mutation hook: Download statement
export function useDownloadStatement() {
  return useMutation({
    mutationFn: ({ cardId, statementId }: { cardId: string; statementId: string }) =>
      cardsService.downloadStatement(cardId, statementId),
    onSuccess: (response, { cardId, statementId }) => {
      if (response.data) {
        // Create download link
        const url = URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `statement-${cardId}-${statementId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        defaultEventBus.emit('cards.statementDownloaded', {
          cardId,
          statementId,
          timestamp: new Date().toISOString()
        })
      }
    }
  })
}

// Named export for updateCard function (legacy compatibility)
export const updateCard = cardsService.updateCard
