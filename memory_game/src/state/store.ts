import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  GameState, 
  Card, 
  GameDifficulty, 
  Theme, 
  PlayerStats, 
  GameSettings,
  ScoreEntry 
} from '../types/index'
import { themesService } from '../services/themesService'
import { shuffle } from '../utils/shuffle'

interface GameStore extends GameState {
  // Actions
  startGame: (difficulty: GameDifficulty, theme: Theme) => void
  flipCard: (cardId: string) => void
  endGame: (completed: boolean) => void
  resetGame: () => void
  startTimer: () => void
  stopTimer: () => void
  updateSettings: (settings: Partial<GameSettings>) => void
  updatePlayerStats: (stats: Partial<PlayerStats>) => void
  addScoreEntry: (entry: ScoreEntry) => void
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
      hard: null
    },
    achievements: [],
    currentStreak: 0,
    longestStreak: 0
  },
  
  // Settings
  settings: {
    soundEnabled: true,
    darkMode: false,
    animationsEnabled: true,
    showTimer: true,
    showMoves: true,
    autoFlip: false,
    flipDelay: 1000,
    difficulty: 'medium'
  },
  
  // Scores
  bestScores: [],
  lastGameScore: null
}

// Persistence keys
const STORAGE_KEY = 'memorygame:v1:store'

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    startGame: (difficulty: GameDifficulty, theme: Theme) => {
      const themeData = themesService.getTheme(theme)
      if (!themeData) return
      
      const cardCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16
      const cards: Card[] = []
      
      // Create pairs of cards
      for (let i = 0; i < cardCount; i++) {
        const cardData = themeData.cards[i % themeData.cards.length]
        cards.push(
          {
            id: `${i}-a`,
            value: cardData.value,
            image: cardData.image,
            isFlipped: false,
            isMatched: false,
            pairId: i.toString()
          },
          {
            id: `${i}-b`,
            value: cardData.value,
            image: cardData.image,
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
        timerInterval: null
      })
      
      // Start timer
      get().startTimer()
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
      
      // Update best time if won
      if (gameWon) {
        const currentBestTime = newStats.bestTimes[state.currentDifficulty]
        if (!currentBestTime || state.timeElapsed < currentBestTime) {
          newStats.bestTimes[state.currentDifficulty] = state.timeElapsed
        }
        
        newStats.currentStreak = state.playerStats.currentStreak + 1
        newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak)
      } else {
        newStats.currentStreak = 0
      }
      
      // Create score entry
      const scoreEntry: ScoreEntry = {
        id: Date.now().toString(),
        score: state.timeElapsed,
        moves: state.moves,
        difficulty: state.currentDifficulty,
        theme: state.currentTheme,
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
