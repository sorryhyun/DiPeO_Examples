import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  GameState, 
  Card, 
  GameDifficulty, 
  PlayerStats, 
  GameSettings,
  ScoreEntry 
} from '../types/index'
import { themesService } from '../services/themesService'
import { shuffle } from '../utils/shuffle'

interface GameStore extends GameState {
  // Extended state properties for compatibility
  challengeProgress?: any
  multiplayerSession?: any
  gameBoard?: any
  currentPlayer?: any
  cardDeck?: Card[]
  timer?: number
  victory?: boolean
  gameStarted?: boolean
  difficulty?: GameDifficulty
  playerName?: string | undefined
  gridSize?: number
  moveCount?: number
  
  // Actions
  startGame: (difficulty: GameDifficulty, theme: string) => Promise<void>
  flipCard: (cardId: string) => void
  endGame: (completed: boolean) => void
  resetGame: () => void
  startTimer: () => void
  stopTimer: () => void
  updateSettings: (settings: Partial<GameSettings>) => void
  updatePlayerStats: (stats: Partial<PlayerStats>) => void
  addScoreEntry: (entry: ScoreEntry) => void
  
  // Extended actions for compatibility
  startChallenge?: (config: any) => void
  setMultiplayerSession?: (session: any) => void
  clearMultiplayerSession?: () => void
  addPlayerToSession?: (player: any) => void
  removePlayerFromSession?: (playerId: string) => void
  startMultiplayerGame?: (gameState: any) => void
  applyMultiplayerMove?: (move: any) => void
  updatePlayerReady?: (playerId: string, isReady: boolean) => void
  endMultiplayerGame?: (results: any) => void
}

const initialState: GameState = {
  // Game state
  deck: [],
  flippedCards: [],
  matchedCards: [],
  moves: 0,
  timeElapsed: 0,
  isGameActive: false,
  isGameComplete: false,
  isGameWon: false,
  currentDifficulty: 'medium',
  currentTheme: 'animals',
  
  // Timer
  timerInterval: null,
  
  // Player data
  playerStats: {
    totalGamesPlayed: 0,
    totalGamesWon: 0,
    totalMoves: 0,
    totalTimeSpent: 0,
    bestTimes: {
      easy: null,
      medium: null,
      hard: null,
      expert: null
    },
    bestMoves: {
      easy: null,
      medium: null,
      hard: null,
      expert: null
    },
    winRate: 0,
    averageMoves: 0,
    averageTime: 0,
    achievements: [],
    currentStreak: 0,
    longestStreak: 0,
    dailyChallengesCompleted: 0
  },
  
  // Settings
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    darkMode: false,
    animationsEnabled: true,
    showTimer: true,
    showMoves: true,
    autoFlip: false,
    flipDelay: 1000,
    difficulty: 'medium',
    theme: 'animals',
    playerName: 'Player',
    colorblindMode: false,
    hapticFeedback: true,
    persistenceEnabled: true
  },
  
  // Scores
  bestScores: [],
  lastGameScore: null
}

// Persistence keys
const STORAGE_KEY = 'memorygame:v1:store'

// Additional state removed - using only GameState interface properties

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    startGame: async (difficulty: GameDifficulty, theme: string) => {
      try {
        const themeData = await themesService.getTheme(theme)
        if (!themeData) return
          
          const cardCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : difficulty === 'expert' ? 18 : 16
          const cards: Card[] = []
          
          // Create pairs of cards
          for (let i = 0; i < cardCount; i++) {
            const cardValue = themeData.cards[i % themeData.cards.length]
          cards.push(
            {
              id: `${i}-a`,
              content: cardValue,
              value: cardValue,
              image: cardValue,
              isFlipped: false,
              isMatched: false,
              pairId: i.toString()
            },
            {
              id: `${i}-b`,
              content: cardValue,
              value: cardValue,
              image: cardValue,
              isFlipped: false,
              isMatched: false,
              pairId: i.toString()
            }
          )
        }
        
        // Shuffle the deck
        const shuffledDeck = shuffle(cards)
        
        set({
          deck: shuffledDeck,
          flippedCards: [],
          matchedCards: [],
          moves: 0,
          timeElapsed: 0,
          isGameActive: true,
          isGameComplete: false,
          isGameWon: false,
          currentDifficulty: difficulty,
          currentTheme: theme,
          timerInterval: null,
        })
        
        // Start timer
        get().startTimer()
      } catch (error) {
        console.error('Failed to start game:', error)
      }
    },
    
    flipCard: (cardId: string) => {
      const state = get()
      if (!state.isGameActive || state.isGameComplete) return
      
      const card = state.deck.find(c => c.id === cardId)
      if (!card || card.isFlipped || card.isMatched) return
      
      const newFlippedCards = [...state.flippedCards, cardId]
      
      // Update deck with flipped card
      const newDeck = state.deck.map(c => 
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
      
      set({
        deck: newDeck,
        flippedCards: newFlippedCards,
        moves: state.moves + 1
      })
      
      // Check for match when 2 cards are flipped
      if (newFlippedCards.length === 2) {
        const [firstCardId, secondCardId] = newFlippedCards
        const firstCard = newDeck.find(c => c.id === firstCardId)
        const secondCard = newDeck.find(c => c.id === secondCardId)
        
        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found
          const newMatchedCards = [...state.matchedCards, firstCardId, secondCardId]
          const updatedDeck = newDeck.map(c => 
            newMatchedCards.includes(c.id) ? { ...c, isMatched: true } : c
          )
          
          set({
            deck: updatedDeck,
            matchedCards: newMatchedCards,
            flippedCards: []
          })
          
          // Check if game is complete
          if (newMatchedCards.length === newDeck.length) {
            get().endGame(true)
          }
        } else {
          // No match - flip cards back after delay
          setTimeout(() => {
            const currentState = get()
            if (currentState.flippedCards.length === 2) {
              set({
                deck: currentState.deck.map(c => 
                  newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
                ),
                flippedCards: []
              })
            }
          }, state.settings.flipDelay)
        }
      }
    },
    
    endGame: (completed: boolean) => {
      const state = get()
      
      state.stopTimer()
      
      const gameWon = completed && state.matchedCards.length === state.deck.length
      
      // Update player stats
      const newStats: PlayerStats = {
        ...state.playerStats,
        totalGamesPlayed: state.playerStats.totalGamesPlayed + 1,
        totalGamesWon: gameWon ? state.playerStats.totalGamesWon + 1 : state.playerStats.totalGamesWon,
        totalMoves: state.playerStats.totalMoves + state.moves,
        totalTimeSpent: state.playerStats.totalTimeSpent + state.timeElapsed
      }
      
      // Update best time and moves if won
      if (gameWon) {
        const currentBestTime = newStats.bestTimes[state.currentDifficulty]
        if (!currentBestTime || state.timeElapsed < currentBestTime) {
          newStats.bestTimes[state.currentDifficulty] = state.timeElapsed
        }
        
        const currentBestMoves = newStats.bestMoves[state.currentDifficulty]
        if (!currentBestMoves || state.moves < currentBestMoves) {
          newStats.bestMoves[state.currentDifficulty] = state.moves
        }
        
        newStats.currentStreak = state.playerStats.currentStreak + 1
        newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak)
      } else {
        newStats.currentStreak = 0
      }
      
      // Update calculated stats
      newStats.winRate = newStats.totalGamesPlayed > 0 ? (newStats.totalGamesWon / newStats.totalGamesPlayed) * 100 : 0
      newStats.averageMoves = newStats.totalGamesPlayed > 0 ? newStats.totalMoves / newStats.totalGamesPlayed : 0
      newStats.averageTime = newStats.totalGamesPlayed > 0 ? newStats.totalTimeSpent / newStats.totalGamesPlayed : 0
      
      // Create score entry
      const scoreEntry: ScoreEntry = {
        id: Date.now().toString(),
        score: state.timeElapsed,
        moves: state.moves,
        difficulty: state.currentDifficulty,
        theme: typeof state.currentTheme === 'string' ? state.currentTheme : state.currentTheme.id,
        completed: gameWon,
        date: new Date().toISOString()
      }
      
      set({
        isGameActive: false,
        isGameComplete: true,
        isGameWon: gameWon,
        playerStats: newStats,
        lastGameScore: scoreEntry
      })
      
      // Add to best scores if completed
      if (gameWon) {
        get().addScoreEntry(scoreEntry)
      }
    },
    
    resetGame: () => {
      const state = get()
      state.stopTimer()
      
      set({
        deck: [],
        flippedCards: [],
        matchedCards: [],
        moves: 0,
        timeElapsed: 0,
        isGameActive: false,
        isGameComplete: false,
        isGameWon: false,
        timerInterval: null,
        lastGameScore: null
      })
    },
    
    startTimer: () => {
      const state = get()
      if (state.timerInterval) return
      
      const interval = setInterval(() => {
        const currentState = get()
        if (currentState.isGameActive && !currentState.isGameComplete) {
          set({ timeElapsed: currentState.timeElapsed + 1 })
        }
      }, 1000)
      
      set({ timerInterval: interval })
    },
    
    stopTimer: () => {
      const state = get()
      if (state.timerInterval) {
        clearInterval(state.timerInterval)
        set({ timerInterval: null })
      }
    },
    
    updateSettings: (newSettings: Partial<GameSettings>) => {
      set({
        settings: {
          ...get().settings,
          ...newSettings
        }
      })
    },
    
    updatePlayerStats: (newStats: Partial<PlayerStats>) => {
      set({
        playerStats: {
          ...get().playerStats,
          ...newStats
        }
      })
    },
    
    addScoreEntry: (entry: ScoreEntry) => {
      const state = get()
      const newScores = [...state.bestScores, entry]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10) // Keep only top 10
      
      set({ bestScores: newScores })
    },
    
    // Daily Challenge methods
    startChallenge: (config: any) => {
      const gridSize = config.difficulty === 'easy' ? 4 : config.difficulty === 'medium' ? 6 : 8;
      set({
        deck: config.deck || [],
        currentDifficulty: config.difficulty,
        currentTheme: config.theme,
        isGameActive: true,
        isGameComplete: false,
        isGameWon: false,
        flippedCards: [],
        matchedCards: [],
        moves: 0,
        timeElapsed: 0,
        challengeProgress: {
          completed: false,
          inProgress: true
        },
        cardDeck: config.deck || [],
        timer: 0,
        victory: false,
        gameStarted: true,
        difficulty: config.difficulty,
        gridSize: gridSize,
        moveCount: 0
      });
      get().startTimer();
    },
    
    // Multiplayer methods (stub implementations)
    setMultiplayerSession: (session: any) => {
      set({ multiplayerSession: session });
    },
    
    clearMultiplayerSession: () => {
      set({ multiplayerSession: undefined });
    },
    
    addPlayerToSession: (player: any) => {
      const state = get();
      if (state.multiplayerSession) {
        set({
          multiplayerSession: {
            ...state.multiplayerSession,
            players: [...(state.multiplayerSession.players || []), player]
          }
        });
      }
    },
    
    removePlayerFromSession: (playerId: string) => {
      const state = get();
      if (state.multiplayerSession) {
        set({
          multiplayerSession: {
            ...state.multiplayerSession,
            players: (state.multiplayerSession.players || []).filter((p: any) => p.id !== playerId)
          }
        });
      }
    },
    
    startMultiplayerGame: (gameState: any) => {
      set({ 
        gameBoard: gameState.cards || [],
        isGameActive: true,
        gameStarted: true,
        multiplayerSession: {
          ...get().multiplayerSession,
          status: 'active'
        }
      });
    },
    
    applyMultiplayerMove: (move: any) => {
      // Stub implementation
      console.log('Applying multiplayer move:', move);
    },
    
    updatePlayerReady: (playerId: string, isReady: boolean) => {
      const state = get();
      if (state.multiplayerSession) {
        const updatedPlayers = (state.multiplayerSession.players || []).map((p: any) => 
          p.id === playerId ? { ...p, isReady } : p
        );
        set({
          multiplayerSession: {
            ...state.multiplayerSession,
            players: updatedPlayers
          }
        });
      }
    },
    
    endMultiplayerGame: (results: any) => {
      set({
        isGameActive: false,
        gameStarted: false,
        multiplayerSession: {
          ...get().multiplayerSession,
          status: 'finished',
          results
        }
      });
    }
  }))
)

// Persistence - save critical data to localStorage
if (typeof window !== 'undefined') {
  useGameStore.subscribe(
    (state) => ({
      playerStats: state.playerStats,
      settings: state.settings,
      bestScores: state.bestScores
    }),
    (persistedData) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData))
      } catch (error) {
        console.warn('Failed to persist game state:', error)
      }
    },
    { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
  )

  // Load persisted data on initialization
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const persistedData = JSON.parse(saved)
      useGameStore.setState({
        playerStats: persistedData.playerStats || initialState.playerStats,
        settings: persistedData.settings || initialState.settings,
        bestScores: persistedData.bestScores || initialState.bestScores
      })
    }
  } catch (error) {
    console.warn('Failed to load persisted game state:', error)
  }
}

// Export alias for backward compatibility
export const useStore = useGameStore;

// Export type for external use
export type { GameStore };
