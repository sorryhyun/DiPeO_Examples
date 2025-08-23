import { ApiResponse } from '../types';
import type {
  Player,
  Achievement,
  DailyChallenge,
  PlayerStats,
  Theme,
  MultiplayerSession,
  LeaderboardEntry
} from '../types';

// Mock data store
let mockData = {
  players: [
    {
      id: '1',
      email: 'player1@game.com',
      name: 'Player One',
      role: 'player',
      avatar: '🎮',
      createdAt: new Date('2024-01-01').toISOString()
    },
    {
      id: '2',
      email: 'player2@game.com',
      name: 'Player Two', 
      role: 'player',
      avatar: '🎯',
      createdAt: new Date('2024-01-02').toISOString()
    },
    {
      id: '3',
      email: 'champion@game.com',
      name: 'Champion',
      role: 'premium_player',
      avatar: '👑',
      createdAt: new Date('2024-01-03').toISOString()
    }
  ] as Player[],
  
  leaderboard: [
    { id: '1', playerId: '3', playerName: 'Champion', score: 2400, moves: 12, time: 45, difficulty: '8x8', theme: 'animals', createdAt: new Date('2024-01-15').toISOString() },
    { id: '2', playerId: '1', playerName: 'Player One', score: 1800, moves: 16, time: 62, difficulty: '6x6', theme: 'emojis', createdAt: new Date('2024-01-14').toISOString() },
    { id: '3', playerId: '2', playerName: 'Player Two', score: 1200, moves: 20, time: 89, difficulty: '4x4', theme: 'colors', createdAt: new Date('2024-01-13').toISOString() },
    { id: '4', playerId: '3', playerName: 'Champion', score: 2100, moves: 14, time: 52, difficulty: '6x6', theme: 'shapes', createdAt: new Date('2024-01-12').toISOString() },
    { id: '5', playerId: '1', playerName: 'Player One', score: 1500, moves: 18, time: 75, difficulty: '6x6', theme: 'animals', createdAt: new Date('2024-01-11').toISOString() }
  ] as LeaderboardEntry[],

  achievements: [
    { id: 'first_win', name: 'First Victory', description: 'Win your first game', icon: '🏆', unlockedAt: new Date('2024-01-10').toISOString(), playerId: '1' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a game in under 30 seconds', icon: '⚡', unlockedAt: new Date('2024-01-12').toISOString(), playerId: '3' },
    { id: 'memory_master', name: 'Memory Master', description: 'Complete 8x8 grid with less than 20 moves', icon: '🧠', unlockedAt: new Date('2024-01-15').toISOString(), playerId: '3' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a game without any wrong matches', icon: '💎', unlockedAt: null, playerId: '1' },
    { id: 'daily_champion', name: 'Daily Champion', description: 'Win a daily challenge', icon: '🌟', unlockedAt: new Date('2024-01-14').toISOString(), playerId: '2' }
  ] as Achievement[],

  dailyChallenge: {
    id: 'daily_2024_01_15',
    date: '2024-01-15',
    difficulty: '6x6',
    theme: 'space',
    timeLimit: 180,
    maxMoves: 25,
    reward: { type: 'badge', value: 'space_explorer' },
    completed: false,
    attempts: 0,
    bestScore: null
  } as DailyChallenge,

  playerStats: {
    '1': { 
      playerId: '1', 
      gamesPlayed: 15, 
      gamesWon: 12, 
      totalScore: 18500, 
      bestTime: 45, 
      averageTime: 67, 
      perfectGames: 2, 
      currentStreak: 3, 
      longestStreak: 5,
      achievementsUnlocked: 2,
      favoriteTheme: 'animals',
      totalPlayTime: 1620
    },
    '2': { 
      playerId: '2', 
      gamesPlayed: 8, 
      gamesWon: 6, 
      totalScore: 9600, 
      bestTime: 52, 
      averageTime: 82, 
      perfectGames: 1, 
      currentStreak: 1, 
      longestStreak: 3,
      achievementsUnlocked: 1,
      favoriteTheme: 'emojis',
      totalPlayTime: 856
    },
    '3': { 
      playerId: '3', 
      gamesPlayed: 25, 
      gamesWon: 23, 
      totalScore: 52100, 
      bestTime: 28, 
      averageTime: 41, 
      perfectGames: 8, 
      currentStreak: 12, 
      longestStreak: 15,
      achievementsUnlocked: 3,
      favoriteTheme: 'shapes',
      totalPlayTime: 2050
    }
  } as Record<string, PlayerStats>,

  themes: [
    { id: 'animals', name: 'Animals', description: 'Cute animal friends', preview: '🐱🐶🐰🦊', isPremium: false, unlocked: true },
    { id: 'emojis', name: 'Emojis', description: 'Fun emoji expressions', preview: '😀😍🤔😎', isPremium: false, unlocked: true },
    { id: 'colors', name: 'Colors', description: 'Vibrant color palette', preview: '🔴🟢🔵🟡', isPremium: false, unlocked: true },
    { id: 'shapes', name: 'Shapes', description: 'Geometric patterns', preview: '⭐🔷🔸🔶', isPremium: false, unlocked: true },
    { id: 'space', name: 'Space', description: 'Cosmic adventure', preview: '🚀🌌⭐🪐', isPremium: true, unlocked: true },
    { id: 'ocean', name: 'Ocean', description: 'Deep sea creatures', preview: '🐙🐠🦈🐟', isPremium: true, unlocked: false }
  ] as Theme[],

  multiplayerSessions: [] as MultiplayerSession[]
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock request handler
export const request = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload?: any
): Promise<ApiResponse<T>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));

  try {
    switch (path) {
      case '/api/leaderboard':
        if (method === 'GET') {
          const sortedLeaderboard = [...mockData.leaderboard]
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
          return { success: true, data: sortedLeaderboard as T };
        }
        if (method === 'POST') {
          const newEntry: LeaderboardEntry = {
            id: generateId(),
            ...payload,
            createdAt: new Date().toISOString()
          };
          mockData.leaderboard.push(newEntry);
          return { success: true, data: newEntry as T };
        }
        break;

      case '/api/achievements':
        if (method === 'GET') {
          const playerId = new URL(`http://localhost${path}`).searchParams.get('playerId');
          const playerAchievements = mockData.achievements.filter(
            a => a.playerId === playerId
          );
          return { success: true, data: playerAchievements as T };
        }
        if (method === 'POST') {
          const achievement = mockData.achievements.find(a => a.id === payload.achievementId);
          if (achievement && !achievement.unlockedAt) {
            achievement.unlockedAt = new Date().toISOString();
            achievement.playerId = payload.playerId;
          }
          return { success: true, data: achievement as T };
        }
        break;

      case '/api/daily-challenge':
        if (method === 'GET') {
          return { success: true, data: mockData.dailyChallenge as T };
        }
        if (method === 'POST') {
          mockData.dailyChallenge.completed = payload.completed;
          mockData.dailyChallenge.attempts = payload.attempts;
          mockData.dailyChallenge.bestScore = payload.score;
          return { success: true, data: mockData.dailyChallenge as T };
        }
        break;

      case '/api/player-stats':
        if (method === 'GET') {
          const playerId = new URL(`http://localhost${path}`).searchParams.get('playerId');
          const stats = mockData.playerStats[playerId || '1'];
          return { success: true, data: stats as T };
        }
        if (method === 'PUT') {
          const { playerId, ...updates } = payload;
          if (mockData.playerStats[playerId]) {
            mockData.playerStats[playerId] = { ...mockData.playerStats[playerId], ...updates };
          }
          return { success: true, data: mockData.playerStats[playerId] as T };
        }
        break;

      case '/api/themes':
        if (method === 'GET') {
          return { success: true, data: mockData.themes as T };
        }
        if (method === 'PUT') {
          const theme = mockData.themes.find(t => t.id === payload.themeId);
          if (theme) {
            theme.unlocked = payload.unlocked;
          }
          return { success: true, data: theme as T };
        }
        break;

      case '/api/multiplayer-session':
        if (method === 'POST') {
          const session: MultiplayerSession = {
            id: generateId(),
            hostId: payload.hostId,
            players: [payload.hostId],
            status: 'waiting',
            settings: payload.settings,
            currentTurn: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockData.multiplayerSessions.push(session);
          return { success: true, data: session as T };
        }
        if (method === 'PUT') {
          const sessionId = payload.sessionId;
          const session = mockData.multiplayerSessions.find(s => s.id === sessionId);
          if (session) {
            Object.assign(session, payload.updates, { updatedAt: new Date().toISOString() });
          }
          return { success: true, data: session as T };
        }
        break;

      default:
        throw new Error(`Mock endpoint ${path} not implemented`);
    }

    throw new Error(`Method ${method} not supported for ${path}`);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null as T
    };
  }
};

// Mock WebSocket implementation
export const createMockWebSocket = (url: string) => {
  const listeners: { [event: string]: ((data: any) => void)[] } = {};
  let isConnected = false;

  const mockSocket = {
    readyState: 0, // CONNECTING
    
    send: (data: string) => {
      if (!isConnected) return;
      
      const message = JSON.parse(data);
      
      // Simulate server responses
      setTimeout(() => {
        switch (message.type) {
          case 'join_session':
            emit('session_joined', { 
              sessionId: message.sessionId, 
              players: mockData.players.slice(0, 2) 
            });
            break;
            
          case 'make_move':
            emit('move_made', { 
              playerId: message.playerId, 
              cardId: message.cardId,
              timestamp: Date.now()
            });
            break;
            
          case 'game_state_update':
            emit('game_updated', { 
              sessionId: message.sessionId, 
              gameState: message.gameState 
            });
            break;
        }
      }, 50 + Math.random() * 100);
    },
    
    addEventListener: (event: string, callback: (data: any) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    
    removeEventListener: (event: string, callback: (data: any) => void) => {
      if (listeners[event]) {
        const index = listeners[event].indexOf(callback);
        if (index > -1) listeners[event].splice(index, 1);
      }
    },
    
    close: () => {
      isConnected = false;
      mockSocket.readyState = 3; // CLOSED
      emit('close', {});
    }
  };

  const emit = (event: string, data: any) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback({ data: JSON.stringify(data) }));
    }
  };

  // Simulate connection
  setTimeout(() => {
    isConnected = true;
    mockSocket.readyState = 1; // OPEN
    emit('open', {});
  }, 100);

  return mockSocket;
};

// Export flag for other services to check mock mode
export const ENABLE_MOCK = true;

export default {
  request,
  createMockWebSocket,
  ENABLE_MOCK
};
