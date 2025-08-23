import { apiClient } from './apiClient';
// import { useGameStore } from '../state/store';
import type { 
  MultiplayerSession, 
  GameMove, 
  ApiResponse 
} from '../types';
import { ApiError } from '../types';

class MultiplayerService {
  private webSocketProvider: any = null;
  private currentSessionId: string | null = null;

  setWebSocketProvider(provider: any) {
    this.webSocketProvider = provider;
  }

  async createSession(payload: {
    playerId: string;
    playerName: string;
    gameMode: 'classic' | 'timed' | 'challenge';
    maxPlayers: number;
  }): Promise<ApiResponse<MultiplayerSession>> {
    try {
      // Try REST API first
      const response = await apiClient.post<MultiplayerSession>('/api/multiplayer-session', payload);
      
      if (response.success && response.data) {
        this.currentSessionId = response.data.id;
        this.subscribeToSession(response.data.id);
        
        // Update store with session data
        // TODO: Implement these store methods
        // useGameStore.getState().setMultiplayerSession(response.data);
        
        return response;
      }

      throw new Error(response.error?.message || 'Failed to create session');
    } catch (error) {
      // Fallback to WebSocket if REST fails
      if (this.webSocketProvider && this.webSocketProvider.isConnected()) {
        const sessionId = this.generateSessionId();
        this.currentSessionId = sessionId;
        
        this.webSocketProvider.sendMessage({
          type: 'create_session',
          sessionId,
          payload
        });

        const mockSession: MultiplayerSession = {
          id: sessionId,
          roomCode: this.generateSessionCode(),
          host: {
            id: payload.playerId,
            name: payload.playerName,
            score: 0,
            moves: 0,
            matchedPairs: 0,
            isActive: true,
            isReady: false
          },
          players: [{
            id: payload.playerId,
            name: payload.playerName,
            isReady: false,
            score: 0,
            moves: 0,
            matchedPairs: 0,
            isActive: true
          }],
          maxPlayers: payload.maxPlayers || 4,
          gameState: 'waiting',
          deck: [],
          settings: {
            soundEnabled: true,
            animationsEnabled: true,
            showTimer: true,
            showMoves: true,
            difficulty: 'medium'
          }
        };

        // TODO: Implement these store methods
        // useGameStore.getState().setMultiplayerSession(mockSession);
        this.subscribeToSession(sessionId);

        return {
          success: true,
          data: mockSession
        };
      }

      return {
        success: false,
        error: new ApiError(error instanceof Error ? error.message : 'Failed to create session', 500)
      };
    }
  }

  async joinSession(sessionCode: string, player: { id: string; name: string }): Promise<ApiResponse<MultiplayerSession>> {
    try {
      // Try REST API first
      const response = await apiClient.post<MultiplayerSession>(`/api/multiplayer-session/${sessionCode}/join`, player);
      
      if (response.success && response.data) {
        this.currentSessionId = response.data.id;
        this.subscribeToSession(response.data.id);
        
        // Update store with session data
        // TODO: Implement these store methods
        // useGameStore.getState().setMultiplayerSession(response.data);
        
        return response;
      }

      throw new Error(response.error?.message || 'Failed to join session');
    } catch (error) {
      // Fallback to WebSocket if REST fails
      if (this.webSocketProvider && this.webSocketProvider.isConnected()) {
        this.webSocketProvider.sendMessage({
          type: 'join_session',
          sessionCode,
          player
        });

        // Return pending response, actual session data will come via WebSocket
        return {
          success: true,
          data: null as any // Will be updated via WebSocket message
        };
      }

      return {
        success: false,
        error: new ApiError(error instanceof Error ? error.message : 'Failed to join session', 500)
      };
    }
  }

  sendMove(sessionId: string, move: GameMove): void {
    if (!this.webSocketProvider) {
      console.error('WebSocket provider not available');
      return;
    }

    const moveData = {
      type: 'game_move',
      sessionId,
      move: {
        playerId: move.playerId,
        cardIds: move.cardIds,
        isMatch: move.isMatch,
        timestamp: move.timestamp || Date.now(),
        moveNumber: move.moveNumber
      }
    };

    this.webSocketProvider.sendMessage(moveData);
  }

  sendPlayerReady(sessionId: string, playerId: string, isReady: boolean): void {
    if (!this.webSocketProvider) {
      console.error('WebSocket provider not available');
      return;
    }

    this.webSocketProvider.sendMessage({
      type: 'player_ready',
      sessionId,
      playerId,
      isReady
    });
  }

  leaveSession(sessionId: string, playerId: string): void {
    if (!this.webSocketProvider) {
      console.error('WebSocket provider not available');
      return;
    }

    this.webSocketProvider.sendMessage({
      type: 'leave_session',
      sessionId,
      playerId
    });

    this.currentSessionId = null;
    // useGameStore.getState().clearMultiplayerSession();
  }

  private subscribeToSession(sessionId: string): void {
    if (!this.webSocketProvider) {
      console.error('WebSocket provider not available for subscription');
      return;
    }

    // Subscribe to session-specific messages
    this.webSocketProvider.subscribe(`session_${sessionId}`, (message: any) => {
      this.handleSessionMessage(message);
    });

    // Subscribe to general multiplayer messages
    this.webSocketProvider.subscribe('multiplayer', (message: any) => {
      this.handleMultiplayerMessage(message);
    });
  }

  private handleSessionMessage(message: any): void {
    // const store = useGameStore.getState();

    switch (message.type) {
      case 'session_updated':
        if (message.session) {
          // store.setMultiplayerSession(message.session);
        }
        break;

      case 'player_joined':
        if (message.player && message.sessionId === this.currentSessionId) {
          // store.addPlayerToSession(message.player);
        }
        break;

      case 'player_left':
        if (message.playerId && message.sessionId === this.currentSessionId) {
          // store.removePlayerFromSession(message.playerId);
        }
        break;

      case 'game_started':
        if (message.sessionId === this.currentSessionId && message.gameState) {
          // store.startMultiplayerGame(message.gameState);
        }
        break;

      case 'move_received':
        if (message.sessionId === this.currentSessionId && message.move) {
          // store.applyMultiplayerMove(message.move);
        }
        break;

      case 'player_ready_updated':
        if (message.sessionId === this.currentSessionId) {
          // store.updatePlayerReady(message.playerId, message.isReady);
        }
        break;

      case 'game_ended':
        if (message.sessionId === this.currentSessionId && message.results) {
          // store.endMultiplayerGame(message.results);
        }
        break;

      default:
        console.log('Unhandled session message:', message);
    }
  }

  private handleMultiplayerMessage(message: any): void {
    switch (message.type) {
      case 'session_created':
        if (message.session) {
          // TODO: Implement these store methods
        // useGameStore.getState().setMultiplayerSession(message.session);
        }
        break;

      case 'join_session_response':
        if (message.success && message.session) {
          this.currentSessionId = message.session.id;
          // TODO: Implement these store methods
        // useGameStore.getState().setMultiplayerSession(message.session);
        } else if (message.error) {
          console.error('Failed to join session:', message.error);
        }
        break;

      case 'connection_error':
        console.error('Multiplayer connection error:', message.error);
        break;

      default:
        console.log('Unhandled multiplayer message:', message);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  isInSession(): boolean {
    return this.currentSessionId !== null;
  }

  disconnect(): void {
    if (this.currentSessionId) {
      this.leaveSession(this.currentSessionId, 'unknown'); // TODO: Get current player ID
    }
  }
}

export const multiplayerService = new MultiplayerService();
