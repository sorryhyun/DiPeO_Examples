export interface Card {
  id: string;
  content: string;
  value: string;
  isFlipped?: boolean;
  isMatched?: boolean;
  image?: string;
  pairId?: string;
}

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameMode = 'single' | 'multiplayer' | 'daily';
export type Difficulty = GameDifficulty;

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  preview: string;
  cards: string[];
  backgroundColor?: string;
  cardColor?: string;
  type?: 'emoji' | 'image' | 'text';
}

export interface ThemeAsset {
  id: string;
  url: string;
  type: 'image' | 'emoji' | 'text';
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalGamesWon: number;
  totalMoves: number;
  totalTimeSpent: number;
  bestTimes: Record<GameDifficulty, number | null>;
  bestMoves: Record<GameDifficulty, number | null>;
  winRate: number;
  averageMoves: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  favoriteTheme?: string;
  dailyChallengesCompleted: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled?: boolean;
  animationsEnabled: boolean;
  showTimer: boolean;
  showMoves: boolean;
  difficulty: GameDifficulty;
  theme?: string;
  playerName?: string;
  darkMode?: boolean;
  autoFlip?: boolean;
  flipDelay?: number;
  colorblindMode?: boolean;
  hapticFeedback?: boolean;
  persistenceEnabled?: boolean;
}

export interface GameState {
  deck: Card[];
  flippedCards: string[];
  matchedCards: string[];
  moves: number;
  timeElapsed: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  isGameWon: boolean;
  currentDifficulty: GameDifficulty;
  currentTheme: string | Theme;
  timerInterval: NodeJS.Timeout | null;
  playerStats: PlayerStats;
  settings: GameSettings;
  bestScores: ScoreEntry[];
  lastGameScore: ScoreEntry | null;
}

export interface ScoreEntry {
  id: string;
  playerName?: string;
  score: number;
  moves: number;
  time?: number;
  difficulty: GameDifficulty;
  theme: string;
  date: string;
  completed?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  moves: number;
  time: number;
  difficulty: GameDifficulty;
  theme: string;
  date: string;
  avatar?: string;
  country?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  difficulty: GameDifficulty;
  theme: string;
  seed: string;
  targetMoves: number;
  targetTime: number;
  completed: boolean;
  participants: number;
  rewards: DailyChallengeReward[];
  leaderboard?: LeaderboardEntry[];
  userScore?: ScoreEntry;
}

export interface DailyChallengeReward {
  type: 'points' | 'achievement' | 'theme' | 'badge';
  value: string | number;
  description: string;
  icon?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'collection' | 'social' | 'special';
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  moves: number;
  matchedPairs: number;
  isActive: boolean;
  isReady: boolean;
  isCurrentUser?: boolean;
  color?: string;
}

export interface GameMove {
  playerId: string;
  cardIds: string[];
  isMatch: boolean;
  timestamp: number;
  moveNumber: number;
}

export interface MultiplayerSession {
  id: string;
  roomCode: string;
  host: Player;
  players: Player[];
  maxPlayers: number;
  gameState: 'waiting' | 'ready' | 'playing' | 'finished';
  currentTurn?: string;
  deck: Card[];
  settings: GameSettings;
  startedAt?: string;
  endedAt?: string;
  winner?: Player;
}

export interface GameResult {
  won: boolean;
  score: number;
  moves: number;
  time: number;
  difficulty: GameDifficulty;
  theme: string;
  perfectGame: boolean;
  newBestTime: boolean;
  newBestMoves: boolean;
  achievementsUnlocked: Achievement[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp?: string;
  status?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = status.toString();
    this.status = status;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  from?: string;
}

export interface GameInvite {
  id: string;
  from: Player;
  to: string;
  roomCode: string;
  message?: string;
  expiresAt: string;
}