// filepath: src/features/sounds/SilencePlayer.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import silenceAudio from '@/assets/sounds/silence.mp3'

interface SilencePlayerProps {
  /** Show visual controls for mute/unmute */
  showControls?: boolean
  /** Auto-play on mount */
  autoPlay?: boolean
  /** Volume level (0-1) */
  volume?: number
  /** CSS class name */
  className?: string
  /** Callback when silence starts playing */
  onPlay?: () => void
  /** Callback when silence stops */
  onStop?: () => void
}

interface SilenceState {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  duration: number
  currentTime: number
  error: string | null
}

// Global silence player functions
let globalAudioRef: HTMLAudioElement | null = null
let globalPlaySilenceRef: (() => Promise<void>) | null = null
let globalStopSilenceRef: (() => void) | null = null

// Create a shared audio instance for the silence
function createSilenceAudio(): HTMLAudioElement {
  if (globalAudioRef) return globalAudioRef

  const audio = new Audio(silenceAudio)
  audio.preload = 'auto'
  audio.loop = false
  audio.crossOrigin = 'anonymous'
  
  // Set initial properties
  audio.volume = 0.8
  
  // Handle audio events
  audio.addEventListener('loadedmetadata', () => {
    eventBus.emit('analytics:event', { 
      name: 'silence_audio_loaded', 
      properties: { duration: audio.duration }
    })
  })
  
  audio.addEventListener('error', (e) => {
    console.warn('[SilencePlayer] Audio loading error:', e)
    eventBus.emit('analytics:event', { 
      name: 'silence_audio_error', 
      properties: { error: e.type }
    })
  })
  
  globalAudioRef = audio
  return audio
}

// Global play function
export const playSilence = async (): Promise<void> => {
  if (globalPlaySilenceRef) {
    return globalPlaySilenceRef()
  }
  
  // Fallback direct play
  try {
    const audio = createSilenceAudio()
    audio.currentTime = 0
    await audio.play()
    eventBus.emit('analytics:event', { name: 'silence_played_global' })
  } catch (error) {
    console.warn('[SilencePlayer] Global play failed:', error)
  }
}

// Global stop function
export const stopSilence = (): void => {
  if (globalStopSilenceRef) {
    globalStopSilenceRef()
  } else if (globalAudioRef) {
    globalAudioRef.pause()
    globalAudioRef.currentTime = 0
  }
}

export const SilencePlayer: React.FC<SilencePlayerProps> = ({
  showControls = false,
  autoPlay = false,
  volume = 0.8,
  className = '',
  onPlay,
  onStop,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useLocalStorage('silence-player-muted', false)
  const [savedVolume, setSavedVolume] = useLocalStorage('silence-player-volume', volume)
  
  const [state, setState] = useState<SilenceState>({
    isPlaying: false,
    isMuted: false,
    volume: savedVolume,
    duration: 0,
    currentTime: 0,
    error: null,
  })

  // Initialize audio element
  useEffect(() => {
    const audio = createSilenceAudio()
    audioRef.current = audio
    
    // Update state with audio properties
    setState(prev => ({
      ...prev,
      volume: savedVolume,
      isMuted,
    }))
    
    // Set initial volume
    audio.volume = isMuted ? 0 : savedVolume
    
    return () => {
      if (audio && !audio.paused) {
        audio.pause()
      }
    }
  }, [savedVolume, isMuted])

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }))
    }

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true, error: null }))
      onPlay?.()
      eventBus.emit('analytics:event', { name: 'silence_started' })
    }

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
      onStop?.()
      eventBus.emit('analytics:event', { name: 'silence_ended' })
    }

    const handleError = (e: Event) => {
      const error = 'Failed to load silence audio'
      setState(prev => ({ ...prev, error, isPlaying: false }))
      console.warn('[SilencePlayer] Audio error:', e)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [onPlay, onStop])

  // Play silence function
  const playCurrentSilence = useCallback(async (): Promise<void> => {
    const audio = audioRef.current
    if (!audio || state.isMuted) return

    try {
      audio.currentTime = 0
      await audio.play()
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Playback failed' }))
      console.warn('[SilencePlayer] Play failed:', error)
    }
  }, [state.isMuted])

  // Stop silence function
  const stopCurrentSilence = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
  }, [])

  // Set global function references
  useEffect(() => {
    globalPlaySilenceRef = playCurrentSilence
    globalStopSilenceRef = stopCurrentSilence

    return () => {
      if (globalPlaySilenceRef === playCurrentSilence) {
        globalPlaySilenceRef = null
      }
      if (globalStopSilenceRef === stopCurrentSilence) {
        globalStopSilenceRef = null
      }
    }
  }, [playCurrentSilence, stopCurrentSilence])

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !state.isMuted) {
      playCurrentSilence()
    }
  }, [autoPlay, playCurrentSilence, state.isMuted])

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume: number) => {
    const audio = audioRef.current
    if (!audio) return

    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    audio.volume = state.isMuted ? 0 : clampedVolume
    
    setState(prev => ({ ...prev, volume: clampedVolume }))
    setSavedVolume(clampedVolume)
  }, [state.isMuted, setSavedVolume])

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const newMuted = !state.isMuted
    audio.volume = newMuted ? 0 : state.volume
    
    setState(prev => ({ ...prev, isMuted: newMuted }))
    setIsMuted(newMuted)
    
    eventBus.emit('analytics:event', { 
      name: 'silence_mute_toggled', 
      properties: { muted: newMuted }
    })
  }, [state.isMuted, state.volume, setIsMuted])

  // Handle keyboard controls
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault()
        if (state.isPlaying) {
          stopCurrentSilence()
        } else {
          playCurrentSilence()
        }
        break
      case 'm':
      case 'M':
        e.preventDefault()
        handleMuteToggle()
        break
      default:
        break
    }
  }, [state.isPlaying, playCurrentSilence, stopCurrentSilence, handleMuteToggle])

  if (!showControls) {
    return null // Silent operation when no controls needed
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Silence Player"
      aria-description="Play absolutely nothing with perfect clarity"
    >
      {/* Play/Pause Button */}
      <button
        onClick={state.isPlaying ? stopCurrentSilence : playCurrentSilence}
        disabled={!!state.error}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={state.isPlaying ? 'Stop silence' : 'Play silence'}
      >
        {state.isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="9.5,3 22,12 9.5,21" />
          </svg>
        )}
      </button>

      {/* Mute Button */}
      <button
        onClick={handleMuteToggle}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-black/10 transition-colors"
        aria-label={state.isMuted ? 'Unmute silence' : 'Mute silence'}
      >
        {state.isMuted ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.63 3.63a0.996 0.996 0 0 0-1.41 1.41L6.21 9.04C5.46 9.59 5 10.54 5 11.5c0 1.38 1.12 2.5 2.5 2.5h2L12 16.5v-2.79l4.21 4.21c-0.84 0.65-1.8 1.16-2.85 1.49v2.18c2.02-0.43 3.87-1.35 5.41-2.65l2.27 2.27a0.996 0.996 0 0 0 1.41-1.41L3.63 3.63zM19 12c0 0.94-0.2 1.82-0.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89 0.86 5 3.54 5 6.71zm-7-8L9.91 6.09 12 8.18V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-0.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        )}
      </button>

      {/* Volume Slider */}
      <div className="flex items-center gap-1">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={state.volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-1 bg-black/20 rounded-lg appearance-none cursor-pointer"
          aria-label="Volume"
        />
        <span className="text-xs text-gray-500 w-8">
          {Math.round(state.volume * 100)}%
        </span>
      </div>

      {/* Status Indicator */}
      {state.isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">Playing silence</span>
        </div>
      )}

      {/* Error State */}
      {state.error && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-xs text-red-600">{state.error}</span>
        </div>
      )}

      {config.isDevelopment && (
        <div className="text-xs text-gray-400">
          Debug: {state.currentTime.toFixed(1)}s / {state.duration.toFixed(1)}s
        </div>
      )}
    </motion.div>
  )
}

export default SilencePlayer
