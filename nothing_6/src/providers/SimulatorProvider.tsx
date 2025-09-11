// filepath: src/providers/SimulatorProvider.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for provider)

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'

/* src/providers/SimulatorProvider.tsx

   Context provider for the interactive void simulator. Manages simulation state,
   presets, and provides controls for the void simulation components.

   Usage:
     <SimulatorProvider>
       <InteractiveVoidSimulator />
     </SimulatorProvider>
     
     const { state, play, pause, reset, setPreset } = useSimulator()
*/

export type SimulationPreset = 
  | 'classic_void'
  | 'particle_storm'
  | 'quantum_void'
  | 'digital_decay'
  | 'matrix_rain'
  | 'cosmic_drift'
  | 'glitch_void'
  | 'minimal_zen'

export type SimulationStatus = 'idle' | 'playing' | 'paused' | 'loading' | 'error'

export interface SimulationSettings {
  speed: number // 0.1 - 3.0
  density: number // 0.1 - 1.0
  complexity: number // 1 - 10
  colorScheme: 'mono' | 'neon' | 'pastel' | 'dark' | 'void'
  effects: {
    particles: boolean
    trails: boolean
    glow: boolean
    distortion: boolean
    audio: boolean
  }
}

export interface PresetConfig {
  id: SimulationPreset
  name: string
  description: string
  settings: SimulationSettings
  thumbnail?: string
}

export interface SimulatorState {
  status: SimulationStatus
  currentPreset: SimulationPreset
  customSettings: Partial<SimulationSettings>
  isFullscreen: boolean
  performance: {
    fps: number
    renderTime: number
    quality: 'low' | 'medium' | 'high' | 'auto'
  }
  analytics: {
    sessionStartTime?: number
    totalInteractions: number
    favoritedPresets: SimulationPreset[]
  }
}

type SimulatorAction =
  | { type: 'SET_STATUS'; payload: SimulationStatus }
  | { type: 'SET_PRESET'; payload: SimulationPreset }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SimulationSettings> }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'UPDATE_PERFORMANCE'; payload: Partial<SimulatorState['performance']> }
  | { type: 'TRACK_INTERACTION'; payload?: { preset?: SimulationPreset } }
  | { type: 'RESET_ANALYTICS' }
  | { type: 'RESET_TO_PRESET'; payload: SimulationPreset }

const DEFAULT_PRESETS: Record<SimulationPreset, PresetConfig> = {
  classic_void: {
    id: 'classic_void',
    name: 'Classic Void',
    description: 'The original nothing experience',
    settings: {
      speed: 1.0,
      density: 0.3,
      complexity: 3,
      colorScheme: 'void',
      effects: {
        particles: false,
        trails: false,
        glow: false,
        distortion: false,
        audio: false
      }
    }
  },
  particle_storm: {
    id: 'particle_storm',
    name: 'Particle Storm',
    description: 'Chaotic particles swirling in void',
    settings: {
      speed: 2.5,
      density: 0.8,
      complexity: 8,
      colorScheme: 'neon',
      effects: {
        particles: true,
        trails: true,
        glow: true,
        distortion: false,
        audio: false
      }
    }
  },
  quantum_void: {
    id: 'quantum_void',
    name: 'Quantum Void',
    description: 'Quantum entanglement visualization',
    settings: {
      speed: 0.7,
      density: 0.4,
      complexity: 9,
      colorScheme: 'pastel',
      effects: {
        particles: true,
        trails: false,
        glow: true,
        distortion: true,
        audio: false
      }
    }
  },
  digital_decay: {
    id: 'digital_decay',
    name: 'Digital Decay',
    description: 'Glitching digital artifacts',
    settings: {
      speed: 1.8,
      density: 0.6,
      complexity: 7,
      colorScheme: 'mono',
      effects: {
        particles: false,
        trails: true,
        glow: false,
        distortion: true,
        audio: false
      }
    }
  },
  matrix_rain: {
    id: 'matrix_rain',
    name: 'Matrix Rain',
    description: 'Cascading void characters',
    settings: {
      speed: 1.5,
      density: 0.9,
      complexity: 6,
      colorScheme: 'neon',
      effects: {
        particles: false,
        trails: true,
        glow: true,
        distortion: false,
        audio: false
      }
    }
  },
  cosmic_drift: {
    id: 'cosmic_drift',
    name: 'Cosmic Drift',
    description: 'Slow-moving cosmic nothing',
    settings: {
      speed: 0.3,
      density: 0.2,
      complexity: 4,
      colorScheme: 'dark',
      effects: {
        particles: true,
        trails: false,
        glow: true,
        distortion: false,
        audio: config.isDevelopment
      }
    }
  },
  glitch_void: {
    id: 'glitch_void',
    name: 'Glitch Void',
    description: 'Reality-breaking glitch effects',
    settings: {
      speed: 2.2,
      density: 0.7,
      complexity: 10,
      colorScheme: 'mono',
      effects: {
        particles: true,
        trails: true,
        glow: false,
        distortion: true,
        audio: false
      }
    }
  },
  minimal_zen: {
    id: 'minimal_zen',
    name: 'Minimal Zen',
    description: 'Pure minimalist void',
    settings: {
      speed: 0.5,
      density: 0.1,
      complexity: 1,
      colorScheme: 'void',
      effects: {
        particles: false,
        trails: false,
        glow: false,
        distortion: false,
        audio: false
      }
    }
  }
}

const initialState: SimulatorState = {
  status: 'idle',
  currentPreset: 'classic_void',
  customSettings: {},
  isFullscreen: false,
  performance: {
    fps: 60,
    renderTime: 16,
    quality: 'auto'
  },
  analytics: {
    totalInteractions: 0,
    favoritedPresets: []
  }
}

function simulatorReducer(state: SimulatorState, action: SimulatorAction): SimulatorState {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
        analytics: action.payload === 'playing' && !state.analytics.sessionStartTime 
          ? { ...state.analytics, sessionStartTime: Date.now() }
          : state.analytics
      }
      
    case 'SET_PRESET':
      return {
        ...state,
        currentPreset: action.payload,
        customSettings: {},
        status: state.status === 'playing' ? 'loading' : state.status
      }
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        customSettings: { ...state.customSettings, ...action.payload }
      }
      
    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        isFullscreen: !state.isFullscreen
      }
      
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performance: { ...state.performance, ...action.payload }
      }
      
    case 'TRACK_INTERACTION':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          totalInteractions: state.analytics.totalInteractions + 1,
          favoritedPresets: action.payload?.preset && !state.analytics.favoritedPresets.includes(action.payload.preset)
            ? [...state.analytics.favoritedPresets, action.payload.preset]
            : state.analytics.favoritedPresets
        }
      }
      
    case 'RESET_ANALYTICS':
      return {
        ...state,
        analytics: {
          totalInteractions: 0,
          favoritedPresets: []
        }
      }
      
    case 'RESET_TO_PRESET':
      return {
        ...state,
        currentPreset: action.payload,
        customSettings: {},
        status: 'idle'
      }
      
    default:
      return state
  }
}

export interface SimulatorContextValue {
  state: SimulatorState
  presets: Record<SimulationPreset, PresetConfig>
  
  // Control methods
  play: () => void
  pause: () => void
  stop: () => void
  reset: () => void
  
  // Preset management
  setPreset: (preset: SimulationPreset) => void
  updateSettings: (settings: Partial<SimulationSettings>) => void
  getCurrentSettings: () => SimulationSettings
  
  // UI controls
  toggleFullscreen: () => void
  
  // Performance monitoring
  updatePerformance: (perf: Partial<SimulatorState['performance']>) => void
  
  // Analytics
  trackInteraction: (preset?: SimulationPreset) => void
  getAnalytics: () => SimulatorState['analytics']
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null)

export interface SimulatorProviderProps {
  children: React.ReactNode
  initialPreset?: SimulationPreset
  autoPlay?: boolean
}

export const SimulatorProvider: React.FC<SimulatorProviderProps> = ({
  children,
  initialPreset = 'classic_void',
  autoPlay = false
}) => {
  const [state, dispatch] = useReducer(simulatorReducer, {
    ...initialState,
    currentPreset: initialPreset
  })
  
  const animationFrameRef = useRef<number>()
  const performanceMonitorRef = useRef<{
    lastFrameTime: number
    frameCount: number
    lastFpsUpdate: number
  }>({ lastFrameTime: 0, frameCount: 0, lastFpsUpdate: 0 })

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    const now = performance.now()
    const monitor = performanceMonitorRef.current
    
    monitor.frameCount++
    const deltaTime = now - monitor.lastFrameTime
    monitor.lastFrameTime = now
    
    // Update FPS every second
    if (now - monitor.lastFpsUpdate >= 1000) {
      const fps = Math.round(monitor.frameCount * 1000 / (now - monitor.lastFpsUpdate))
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: { fps, renderTime: deltaTime } })
      
      monitor.frameCount = 0
      monitor.lastFpsUpdate = now
    }
    
    if (state.status === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updatePerformanceMetrics)
    }
  }, [state.status])

  // Control methods
  const play = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'playing' })
    eventBus.emit('simulator:play', { preset: state.currentPreset })
  }, [state.currentPreset])

  const pause = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'paused' })
    eventBus.emit('simulator:pause', { preset: state.currentPreset })
  }, [state.currentPreset])

  const stop = useCallback(() => {
    dispatch({ type: 'SET_STATUS', payload: 'idle' })
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    eventBus.emit('simulator:stop', { preset: state.currentPreset })
  }, [state.currentPreset])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_TO_PRESET', payload: state.currentPreset })
    eventBus.emit('simulator:reset', { preset: state.currentPreset })
  }, [state.currentPreset])

  const setPreset = useCallback((preset: SimulationPreset) => {
    dispatch({ type: 'SET_PRESET', payload: preset })
    dispatch({ type: 'TRACK_INTERACTION' })
    eventBus.emit('simulator:preset_change', { preset })
  }, [])

  const updateSettings = useCallback((settings: Partial<SimulationSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
    dispatch({ type: 'TRACK_INTERACTION' })
    eventBus.emit('simulator:settings_update', { settings })
  }, [])

  const getCurrentSettings = useCallback((): SimulationSettings => {
    const baseSettings = DEFAULT_PRESETS[state.currentPreset].settings
    return { ...baseSettings, ...state.customSettings }
  }, [state.currentPreset, state.customSettings])

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' })
    eventBus.emit('simulator:fullscreen_toggle', { isFullscreen: !state.isFullscreen })
  }, [state.isFullscreen])

  const updatePerformance = useCallback((perf: Partial<SimulatorState['performance']>) => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: perf })
  }, [])

  const trackInteraction = useCallback((preset?: SimulationPreset) => {
    dispatch({ type: 'TRACK_INTERACTION', payload: preset ? { preset } : undefined })
  }, [])

  const getAnalytics = useCallback(() => state.analytics, [state.analytics])

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => play(), 1000)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, play])

  // Start performance monitoring when playing
  useEffect(() => {
    if (state.status === 'playing') {
      updatePerformanceMetrics()
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.status, updatePerformanceMetrics])

  // Analytics event tracking
  useEffect(() => {
    if (config.isDevelopment) {
      eventBus.emit('analytics:event', {
        name: 'simulator:session_update',
        properties: {
          preset: state.currentPreset,
          status: state.status,
          interactions: state.analytics.totalInteractions
        }
      })
    }
  }, [state.currentPreset, state.status, state.analytics.totalInteractions])

  const contextValue: SimulatorContextValue = {
    state,
    presets: DEFAULT_PRESETS,
    play,
    pause,
    stop,
    reset,
    setPreset,
    updateSettings,
    getCurrentSettings,
    toggleFullscreen,
    updatePerformance,
    trackInteraction,
    getAnalytics
  }

  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  )
}

export const useSimulator = (): SimulatorContextValue => {
  const context = useContext(SimulatorContext)
  
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider')
  }
  
  return context
}

// Export preset configurations for external use
export { DEFAULT_PRESETS as simulatorPresets }

export default SimulatorProvider
