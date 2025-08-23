import { ApiResponse, ApiError } from '../types';
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
      name: 'Player One',
      avatar: '🎮',
      score: 1800,
      moves: 16,
      matchedPairs: 8,
      isActive: true,
      isReady: true,
      color: '#ff6b6b'
    },
    {
      id: '2',
      name: 'Player Two',
      avatar: '🎯',
      score: 1200,
      moves: 20,
      matchedPairs: 6,
      isActive: false,
      isReady: false,
      color: '#4ecdc4'
    },
    {
      id: '3',
      name: 'Champion',
      avatar: '👑',
      score: 2400,
      moves: 12,
      matchedPairs: 12,
      isActive: true,
      isReady: true,
      color: '#45b7d1'
    }
  ] as Player[],
  
  leaderboard: [
    { id: '1', rank: 1, playerName: 'Champion', score: 2400, moves: 12, time: 45, difficulty: 'expert', theme: 'animals', date: new Date('2024-01-15').toISOString(), avatar: '👑' },
    { id: '2', rank: 2, playerName: 'Player One', score: 1800, moves: 16, time: 62, difficulty: 'hard', theme: 'emojis', date: new Date('2024-01-14').toISOString(), avatar: '🎮' },
    { id: '3', rank: 3, playerName: 'Player Two', score: 1200, moves: 20, time: 89, difficulty: 'medium', theme: 'colors', date: new Date('2024-01-13').toISOString(), avatar: '🎯' },
    { id: '4', rank: 4, playerName: 'Champion', score: 2100, moves: 14, time: 52, difficulty: 'hard', theme: 'shapes', date: new Date('2024-01-12').toISOString(), avatar: '👑' },
    { id: '5', rank: 5, playerName: 'Player One', score: 1500, moves: 18, time: 75, difficulty: 'hard', theme: 'animals', date: new Date('2024-01-11').toISOString(), avatar: '🎮' }
  ] as LeaderboardEntry[],

  achievements: [
    { id: 'first_win', name: 'First Victory', description: 'Win your first game', icon: '🏆', category: 'gameplay', points: 10, unlocked: true, unlockedAt: new Date('2024-01-10').toISOString(), rarity: 'common' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a game in under 30 seconds', icon: '⚡', category: 'gameplay', points: 25, unlocked: true, unlockedAt: new Date('2024-01-12').toISOString(), rarity: 'rare' },
    { id: 'memory_master', name: 'Memory Master', description: 'Complete expert grid with less than 20 moves', icon: '🧠', category: 'gameplay', points: 50, unlocked: true, unlockedAt: new Date('2024-01-15').toISOString(), rarity: 'epic' },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete a game without any wrong matches', icon: '💎', category: 'gameplay', points: 100, unlocked: false, rarity: 'legendary', progress: 0, maxProgress: 1 },
    { id: 'daily_champion', name: 'Daily Champion', description: 'Win a daily challenge', icon: '🌟', category: 'special', points: 30, unlocked: true, unlockedAt: new Date('2024-01-14').toISOString(), rarity: 'rare' }
  ] as Achievement[],

  dailyChallenge: {
    id: 'daily_2024_01_15',
    date: '2024-01-15',
    difficulty: 'hard',
    theme: 'space',
    seed: 'daily_seed_20240115',
    targetMoves: 25,
    targetTime: 180,
    completed: false,
    participants: 1247,
    rewards: [
      { type: 'points', value: 100, description: 'Daily challenge points', icon: '⭐' },
      { type: 'badge', value: 'space_explorer', description: 'Space Explorer badge', icon: '🚀' }
    ],
    leaderboard: [
      { id: '1', rank: 1, playerName: 'Champion', score: 2400, moves: 18, time: 95, difficulty: 'hard', theme: 'space', date: '2024-01-15', avatar: '👑' }
    ]
  } as DailyChallenge,

  playerStats: {
    '1': { 
      totalGamesPlayed: 15,
      totalGamesWon: 12,
      totalMoves: 240,
      totalTimeSpent: 1620,
      bestTimes: { easy: 25, medium: 35, hard: 45, expert: null },
      bestMoves: { easy: 8, medium: 12, hard: 16, expert: null },
      winRate: 0.8,
      averageMoves: 16,
      averageTime: 67,
      currentStreak: 3,
      longestStreak: 5,
      achievements: ['first_win', 'speed_demon'],
      favoriteTheme: 'animals',
      dailyChallengesCompleted: 5
    },
    '2': { 
      totalGamesPlayed: 8,
      totalGamesWon: 6,
      totalMoves: 160,
      totalTimeSpent: 856,
      bestTimes: { easy: 30, medium: 52, hard: null, expert: null },
      bestMoves: { easy: 10, medium: 18, hard: null, expert: null },
      winRate: 0.75,
      averageMoves: 20,
      averageTime: 82,
      currentStreak: 1,
      longestStreak: 3,
      achievements: ['first_win', 'daily_champion'],
      favoriteTheme: 'emojis',
      dailyChallengesCompleted: 2
    },
    '3': { 
      totalGamesPlayed: 25,
      totalGamesWon: 23,
      totalMoves: 300,
      totalTimeSpent: 2050,
      bestTimes: { easy: 15, medium: 22, hard: 28, expert: 35 },
      bestMoves: { easy: 6, medium: 8, hard: 12, expert: 18 },
      winRate: 0.92,
      averageMoves: 12,
      averageTime: 41,
      currentStreak: 12,
      longestStreak: 15,
      achievements: ['first_win', 'speed_demon', 'memory_master'],
      favoriteTheme: 'shapes',
      dailyChallengesCompleted: 10
    }
  } as Record<string, PlayerStats>,

  themes: [
    { 
      id: 'animals', 
      name: 'Animals', 
      displayName: 'Cute Animals',
      description: 'Cute animal friends', 
      preview: '🐱🐶🐰🦊', 
      cards: ['🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵', '🐷', '🐮', '🐭', '🐹', '🐻', '🐺', '🦒', '🦘', '🦫', '🦝'],
      backgroundColor: '#f0f8ff',
      cardColor: '#ffffff',
      type: 'emoji'
    },
    { 
      id: 'emojis', 
      name: 'Emojis', 
      displayName: 'Fun Emojis',
      description: 'Fun emoji expressions', 
      preview: '😀😍🤔😎', 
      cards: ['😀', '😍', '🤔', '😎', '🥳', '🤯', '🥰', '😴', '😂', '🤩', '😇', '🤗', '🤫', '🤭', '😋', '😜', '🙃', '😊', '😉', '🤓'],
      backgroundColor: '#fffacd',
      cardColor: '#ffffff',
      type: 'emoji'
    },
    { 
      id: 'colors', 
      name: 'Colors', 
      displayName: 'Bright Colors',
      description: 'Vibrant color palette', 
      preview: '🔴🟢🔵🟡', 
      cards: ['🔴', '🟢', '🔵', '🟡', '🟠', '🟣', '🔺', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '🔶'],
      backgroundColor: '#f5f5f5',
      cardColor: '#ffffff',
      type: 'emoji'
    },
    { 
      id: 'shapes', 
      name: 'Shapes', 
      displayName: 'Geometric Shapes',
      description: 'Geometric patterns', 
      preview: '⭐🔷🔸🔶', 
      cards: ['⭐', '🔷', '🔸', '🔶', '🔹', '🔺', '⬜', '⬛', '💠', '🔻', '🔲', '🔳', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🔘', '🔯'],
      backgroundColor: '#e6e6fa',
      cardColor: '#ffffff',
      type: 'emoji'
    },
    { 
      id: 'space', 
      name: 'Space', 
      displayName: 'Cosmic Adventure',
      description: 'Cosmic adventure', 
      preview: '🚀🌌⭐🪐', 
      cards: ['🚀', '🌌', '⭐', '🪐', '👽', '🛸', '🌟', '☄️', '🌙', '☀️', '🌍', '🌎', '🌏', '🔭', '🛰️', '💫', '✨', '🌠', '🌃', '🌑'],
      backgroundColor: '#191970',
      cardColor: '#ffffff',
      type: 'emoji'
    },
    { 
      id: 'ocean', 
      name: 'Ocean', 
      displayName: 'Deep Sea',
      description: 'Deep sea creatures', 
      preview: '🐙🐠🦈🐟', 
      cards: ['🐙', '🐠', '🦈', '🐟', '🐚', '🦀', '🐡', '🦞', '🐬', '🐳', '🐋', '🦑', '🦐', '🦪', '🌊', '🏝️', '⚓', '🪸', '🐢', '🦭'],
      backgroundColor: '#0066cc',
      cardColor: '#ffffff',
      type: 'emoji'
    }
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
    // Handle paths with parameters
    if (path.startsWith('/api/themes/') && path.includes('/assets')) {
      // Handle /api/themes/{id}/assets
      const themeId = path.split('/')[3];
      const theme = mockData.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }
      // Return theme cards as assets
      const assets = theme.cards.map((card, index) => ({
        id: `${themeId}-${index}`,
        content: card,
        type: theme.type || 'emoji'
      }));
      return { success: true, data: assets as T };
    }
    
    if (path.startsWith('/api/themes/') && !path.includes('/assets')) {
      // Handle /api/themes/{id}
      const themeId = path.split('/')[3];
      const theme = mockData.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme ${themeId} not found`);
      }
      return { success: true, data: theme as T };
    }
    
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
            rank: mockData.leaderboard.length + 1,
            playerName: payload.playerName,
            score: payload.score,
            moves: payload.moves,
            time: payload.time,
            difficulty: payload.difficulty,
            theme: payload.theme,
            date: new Date().toISOString(),
            avatar: payload.avatar
          };
          mockData.leaderboard.push(newEntry);
          return { success: true, data: newEntry as T };
        }
        break;

      case '/api/achievements':
        if (method === 'GET') {
          // For now, return all achievements since Achievement doesn't have playerId property
          // You might want to implement a different mechanism for player-specific achievements
          return { success: true, data: mockData.achievements as T };
        }
        if (method === 'POST') {
          const achievement = mockData.achievements.find(a => a.id === payload.achievementId);
          if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = new Date().toISOString();
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
          if (payload.userScore) {
            mockData.dailyChallenge.userScore = payload.userScore;
          }
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
            // Themes don't have unlocked property in the interface, so we can't set it
            // This might need to be handled differently based on your requirements
          }
          return { success: true, data: theme as T };
        }
        break;

      case '/api/multiplayer-session':
        if (method === 'POST') {
          const hostPlayer = mockData.players.find(p => p.id === payload.hostId);
          if (!hostPlayer) {
            throw new Error('Host player not found');
          }
          
          const session: MultiplayerSession = {
            id: generateId(),
            roomCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
            host: hostPlayer,
            players: [hostPlayer],
            maxPlayers: payload.maxPlayers || 4,
            gameState: 'waiting',
            deck: [],
            settings: payload.settings,
            startedAt: new Date().toISOString()
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: new ApiError(errorMessage, 500),
      data: null as T
    };
  }
};

// Mock WebSocket implementation
export const createMockWebSocket = (_url: string) => {
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
