import { Reaction, ApiResult } from '@/core/contracts';
import { apiClient } from './apiClient';
import { emit } from '@/core/events';
import { debugLog } from '@/core/utils';
import { shouldUseMockData } from '@/app/config';
import { 
  generateMockReaction, 
  addMockReaction, 
  removeMockReaction, 
  getMockReactionsByMessage 
} from '@/mock/mockData';

interface AddReactionRequest {
  messageId: string;
  emoji: string;
}

interface RemoveReactionRequest {
  messageId: string;
  emoji: string;
  userId?: string; // Optional - defaults to current user
}

interface GetReactionsResponse {
  reactions: Reaction[];
}

class ReactionsService {
  /**
   * Add a reaction to a message
   */
  async addReaction(request: AddReactionRequest): Promise<ApiResult<Reaction>> {
    try {
      debugLog('debug', 'Adding reaction', { messageId: request.messageId, emoji: request.emoji });

      if (shouldUseMockData) {
        return await this.mockAddReaction(request);
      }

      const response = await apiClient.post<Reaction>(`/messages/${request.messageId}/reactions`, {
        emoji: request.emoji,
      });

      if (response.ok && response.data) {
        // Emit reaction added event for real-time updates
        await emit('reactionAdded', { reaction: response.data });
        
        debugLog('info', 'Reaction added successfully', { reactionId: response.data.id });
      }

      return response;
    } catch (error) {
      debugLog('error', 'Failed to add reaction', error);
      return {
        ok: false,
        error: {
          code: 'ADD_REACTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add reaction',
          details: error,
        },
      };
    }
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(request: RemoveReactionRequest): Promise<ApiResult<void>> {
    try {
      debugLog('debug', 'Removing reaction', { 
        messageId: request.messageId, 
        emoji: request.emoji, 
        userId: request.userId 
      });

      if (shouldUseMockData) {
        return await this.mockRemoveReaction(request);
      }

      const endpoint = request.userId 
        ? `/messages/${request.messageId}/reactions/${request.emoji}/users/${request.userId}`
        : `/messages/${request.messageId}/reactions/${request.emoji}`;

      const response = await apiClient.delete<void>(endpoint);

      if (response.ok) {
        // Emit reaction removed event for real-time updates
        await emit('reactionRemoved', { 
          messageId: request.messageId,
          emoji: request.emoji,
          userId: request.userId,
        });
        
        debugLog('info', 'Reaction removed successfully');
      }

      return response;
    } catch (error) {
      debugLog('error', 'Failed to remove reaction', error);
      return {
        ok: false,
        error: {
          code: 'REMOVE_REACTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to remove reaction',
          details: error,
        },
      };
    }
  }

  /**
   * Get all reactions for a message
   */
  async getReactionsByMessage(messageId: string): Promise<ApiResult<Reaction[]>> {
    try {
      debugLog('debug', 'Getting reactions for message', { messageId });

      if (shouldUseMockData) {
        return await this.mockGetReactionsByMessage(messageId);
      }

      const response = await apiClient.get<GetReactionsResponse>(`/messages/${messageId}/reactions`);

      if (response.ok && response.data) {
        return {
          ok: true,
          data: response.data.reactions,
        };
      }

      return response as ApiResult<Reaction[]>;
    } catch (error) {
      debugLog('error', 'Failed to get reactions', error);
      return {
        ok: false,
        error: {
          code: 'GET_REACTIONS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get reactions',
          details: error,
        },
      };
    }
  }

  /**
   * Toggle a reaction (add if not present, remove if present)
   */
  async toggleReaction(messageId: string, emoji: string): Promise<ApiResult<{ added: boolean; reaction?: Reaction }>> {
    try {
      // First get existing reactions to check if user already reacted
      const existingReactions = await this.getReactionsByMessage(messageId);
      
      if (!existingReactions.ok) {
        return {
          ok: false,
          error: existingReactions.error,
        };
      }

      // Check if current user already has this reaction (this would need user context)
      // For now, assume we always add - in real implementation would check current user
      const addResult = await this.addReaction({ messageId, emoji });
      
      if (addResult.ok && addResult.data) {
        return {
          ok: true,
          data: {
            added: true,
            reaction: addResult.data,
          },
        };
      }

      return {
        ok: false,
        error: addResult.error,
      };
    } catch (error) {
      debugLog('error', 'Failed to toggle reaction', error);
      return {
        ok: false,
        error: {
          code: 'TOGGLE_REACTION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to toggle reaction',
          details: error,
        },
      };
    }
  }

  // Mock implementations
  private async mockAddReaction(request: AddReactionRequest): Promise<ApiResult<Reaction>> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    try {
      const reaction = generateMockReaction({
        messageId: request.messageId,
        emoji: request.emoji,
        userId: 'current-user-id', // In real app, this would come from auth context
      });

      addMockReaction(reaction);

      // Emit event for real-time updates
      await emit('reactionAdded', { reaction });

      debugLog('info', 'Mock reaction added', { reactionId: reaction.id });

      return {
        ok: true,
        data: reaction,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_ADD_REACTION_ERROR',
          message: 'Failed to add mock reaction',
          details: error,
        },
      };
    }
  }

  private async mockRemoveReaction(request: RemoveReactionRequest): Promise<ApiResult<void>> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    try {
      removeMockReaction(request.messageId, request.emoji, request.userId || 'current-user-id');

      // Emit event for real-time updates
      await emit('reactionRemoved', {
        messageId: request.messageId,
        emoji: request.emoji,
        userId: request.userId || 'current-user-id',
      });

      debugLog('info', 'Mock reaction removed');

      return {
        ok: true,
        data: undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_REMOVE_REACTION_ERROR',
          message: 'Failed to remove mock reaction',
          details: error,
        },
      };
    }
  }

  private async mockGetReactionsByMessage(messageId: string): Promise<ApiResult<Reaction[]>> {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

    try {
      const reactions = getMockReactionsByMessage(messageId);

      return {
        ok: true,
        data: reactions,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'MOCK_GET_REACTIONS_ERROR',
          message: 'Failed to get mock reactions',
          details: error,
        },
      };
    }
  }
}

// Create singleton instance
export const reactionsService = new ReactionsService();

// Export individual methods for convenience
export const addReaction = reactionsService.addReaction.bind(reactionsService);
export const removeReaction = reactionsService.removeReaction.bind(reactionsService);
export const getReactionsByMessage = reactionsService.getReactionsByMessage.bind(reactionsService);
export const toggleReaction = reactionsService.toggleReaction.bind(reactionsService);
