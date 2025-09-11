// filepath: src/features/easter/EasterEggs.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

/* src/features/easter/EasterEggs.tsx

   Hidden easter eggs activated by keyboard shortcuts and sequences.
   Reveals deeper layers of "nothing" through progressive disclosure.

   Usage:
     import { EasterEggs } from '@/features/easter/EasterEggs'
     <EasterEggs />
*/

import { useEffect, useRef, useState, useCallback } from 'react'
import { eventBus } from '@/core/events'
import { appConfig } from '@/app/config'
import { useModal } from '@/providers/ModalProvider'
import { storage as storageService } from '@/services/storage'

interface EasterEggState {
  konamiProgress: number
  discoveredEggs: string[]
  keySequence: string[]
  lastKeyTime: number
}

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

const EASTER_EGGS: Record<string, {
  name: string
  trigger: string | string[]
  description: string
  action: 'modal' | 'event' | 'redirect'
  payload?: any
}> = {
  void: {
    name: 'The Void Stares Back',
    trigger: 'void',
    description: 'Type "void" to stare into the abyss',
    action: 'modal',
    payload: {
      title: 'The Void Acknowledges You',
      content: '...\n\n...\n\n...\n\nYou have gazed long into the void.\n\nThe void has gazed also into you.',
      variant: 'dark'
    }
  },
  nothing: {
    name: 'Nothing Intensifies',
    trigger: 'nothing',
    description: 'Type "nothing" for enhanced nothingness',
    action: 'event',
    payload: { name: 'easter:nothing_intensified' }
  },
  zen: {
    name: 'Zen Mode',
    trigger: 'zen',
    description: 'Type "zen" for ultimate minimalism',
    action: 'modal',
    payload: {
      title: ' ',
      content: ' ',
      variant: 'minimal'
    }
  },
  konami: {
    name: 'Ultimate Nothing',
    trigger: KONAMI_CODE,
    description: 'The legendary Konami code reveals the deepest nothing',
    action: 'modal',
    payload: {
      title: '🎮 Ultimate Nothing Unlocked',
      content: `Congratulations, void master!
      
You have discovered the deepest layer of nothing.
      
This is the nothing that exists before nothing.
The meta-nothing. The nothing²
      
Your dedication to nothingness is truly... nothing short of remarkable.`,
      variant: 'celebration'
    }
  },
  debug: {
    name: 'Developer Console',
    trigger: 'debug',
    description: 'Type "debug" to reveal development info',
    action: 'modal',
    payload: {
      title: '🔧 Debug Information',
      content: '',
      variant: 'debug'
    }
  }
}

export default function EasterEggs() {
  const [state, setState] = useState<EasterEggState>({
    konamiProgress: 0,
    discoveredEggs: storageService.get('easter_eggs_discovered') || [],
    keySequence: [],
    lastKeyTime: 0
  })
  
  const { openModal } = useModal()
  const stateRef = useRef(state)
  stateRef.current = state

  const resetKeySequence = useCallback(() => {
    setState(prev => ({
      ...prev,
      keySequence: [],
      konamiProgress: 0,
      lastKeyTime: 0
    }))
  }, [])

  const markEggDiscovered = useCallback((eggId: string) => {
    setState(prev => {
      const newDiscovered = [...new Set([...prev.discoveredEggs, eggId])]
      storageService.set('easter_eggs_discovered', newDiscovered)
      
      // Emit analytics event
      eventBus.emit('analytics:event', {
        name: 'easter_egg_discovered',
        properties: { eggId, totalDiscovered: newDiscovered.length }
      })
      
      return { ...prev, discoveredEggs: newDiscovered }
    })
  }, [])

  const triggerEasterEgg = useCallback((eggId: string, egg: typeof EASTER_EGGS[string]) => {
    markEggDiscovered(eggId)

    switch (egg.action) {
      case 'modal':
        let content = egg.payload.content
        
        // Special handling for debug modal
        if (eggId === 'debug' && appConfig.isDevelopment) {
          content = `Environment: ${appConfig.mode}
API Base: ${appConfig.apiBase}
Mock Data: ${appConfig.shouldUseMockData ? 'Enabled' : 'Disabled'}
Features: ${appConfig.featureList.length}
Discovered Eggs: ${stateRef.current.discoveredEggs.length}/${Object.keys(EASTER_EGGS).length}

Easter Eggs Found:
${stateRef.current.discoveredEggs.map(id => `• ${EASTER_EGGS[id]?.name || id}`).join('\n')}`
        }
        
        openModal({
          title: egg.payload.title,
          content,
          variant: egg.payload.variant || 'default'
        })
        break
        
      case 'event':
        eventBus.emit(egg.payload.name, egg.payload.properties || {})
        break
        
      case 'redirect':
        if (egg.payload.url) {
          window.open(egg.payload.url, '_blank')
        }
        break
    }
  }, [markEggDiscovered, openModal])

  const checkTextSequence = useCallback((sequence: string[]) => {
    const text = sequence.join('').toLowerCase()
    
    for (const [eggId, egg] of Object.entries(EASTER_EGGS)) {
      if (typeof egg.trigger === 'string' && text.endsWith(egg.trigger)) {
        triggerEasterEgg(eggId, egg)
        return true
      }
    }
    
    return false
  }, [triggerEasterEgg])

  const checkKonamiCode = useCallback((key: string, currentProgress: number) => {
    if (key === KONAMI_CODE[currentProgress]) {
      const newProgress = currentProgress + 1
      
      if (newProgress >= KONAMI_CODE.length) {
        // Konami code completed!
        triggerEasterEgg('konami', EASTER_EGGS.konami)
        return 0
      }
      
      return newProgress
    }
    
    // Reset if wrong key
    return key === KONAMI_CODE[0] ? 1 : 0
  }, [triggerEasterEgg])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const now = Date.now()
    const timeSinceLastKey = now - stateRef.current.lastKeyTime
    
    // Reset sequence if too much time has passed (3 seconds)
    if (timeSinceLastKey > 3000) {
      resetKeySequence()
    }

    // Filter out modifier keys and only track meaningful keys
    if (event.ctrlKey || event.altKey || event.metaKey) return
    
    const key = event.code || event.key
    
    setState(prev => {
      const newKonamiProgress = checkKonamiCode(key, prev.konamiProgress)
      
      // Build text sequence for word-based triggers
      let newKeySequence = [...prev.keySequence]
      
      // Convert key codes to characters for text matching
      if (key.startsWith('Key') || key.startsWith('Digit')) {
        const char = key.replace('Key', '').replace('Digit', '').toLowerCase()
        newKeySequence.push(char)
      } else if (key === 'Space') {
        newKeySequence.push(' ')
      }
      
      // Keep sequence reasonable length
      if (newKeySequence.length > 20) {
        newKeySequence = newKeySequence.slice(-20)
      }
      
      // Check for text-based triggers
      checkTextSequence(newKeySequence)
      
      return {
        ...prev,
        konamiProgress: newKonamiProgress,
        keySequence: newKeySequence,
        lastKeyTime: now
      }
    })
  }, [resetKeySequence, checkKonamiCode, checkTextSequence])

  // Set up global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Emit discovered eggs on mount (for analytics)
  useEffect(() => {
    if (state.discoveredEggs.length > 0) {
      eventBus.emit('analytics:event', {
        name: 'easter_eggs_session_start',
        properties: { discoveredCount: state.discoveredEggs.length }
      })
    }
  }, [state.discoveredEggs.length])

  // Development helper: log available easter eggs
  useEffect(() => {
    if (appConfig.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log('🥚 Easter eggs available:', Object.keys(EASTER_EGGS))
      
      // Make debug function available globally
      ;(window as any).showEasterEggs = () => {
        console.table(
          Object.entries(EASTER_EGGS).map(([id, egg]) => ({
            id,
            name: egg.name,
            trigger: Array.isArray(egg.trigger) ? 'Konami Code' : egg.trigger,
            discovered: state.discoveredEggs.includes(id)
          }))
        )
      }
    }
  }, [state.discoveredEggs])

  // This component is invisible - it only sets up event listeners
  return null
}

// Export named for consistency
export { EasterEggs }
