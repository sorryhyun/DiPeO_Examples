// filepath: src/features/simulator/InteractiveVoidSimulator.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { useSimulator } from '@/providers/SimulatorProvider'
import { ThreeDShowcase } from '@/features/showcase/ThreeDShowcase'
import Button from '@/shared/components/Button'

export interface SimulatorPreset {
  id: string
  name: string
  description: string
  parameters: {
    void_intensity: number
    nothing_density: number
    emptiness_factor: number
    absence_level: number
    null_coefficient: number
  }
  animation_duration: number
  color_scheme: 'void' | 'abyss' | 'darkness' | 'shadow'
}

const VOID_PRESETS: SimulatorPreset[] = [
  {
    id: 'basic-void',
    name: 'Basic Void',
    description: 'Experience pure nothingness in its most fundamental form',
    parameters: {
      void_intensity: 0.3,
      nothing_density: 0.1,
      emptiness_factor: 0.5,
      absence_level: 0.2,
      null_coefficient: 0.0,
    },
    animation_duration: 3000,
    color_scheme: 'void',
  },
  {
    id: 'premium-void',
    name: 'Premium Void',
    description: 'Enhanced nothingness with advanced void algorithms',
    parameters: {
      void_intensity: 0.7,
      nothing_density: 0.4,
      emptiness_factor: 0.8,
      absence_level: 0.6,
      null_coefficient: 0.2,
    },
    animation_duration: 5000,
    color_scheme: 'abyss',
  },
  {
    id: 'enterprise-void',
    name: 'Enterprise Void',
    description: 'Industrial-grade nothingness for professional applications',
    parameters: {
      void_intensity: 1.0,
      nothing_density: 0.8,
      emptiness_factor: 1.0,
      absence_level: 0.9,
      null_coefficient: 0.5,
    },
    animation_duration: 8000,
    color_scheme: 'darkness',
  },
  {
    id: 'quantum-void',
    name: 'Quantum Void',
    description: 'Schrödinger\'s nothingness - simultaneously exists and doesn\'t',
    parameters: {
      void_intensity: 0.5,
      nothing_density: 0.0,
      emptiness_factor: 1.0,
      absence_level: 0.5,
      null_coefficient: 1.0,
    },
    animation_duration: 10000,
    color_scheme: 'shadow',
  },
]

const PARAMETER_LABELS = {
  void_intensity: 'Void Intensity',
  nothing_density: 'Nothing Density',
  emptiness_factor: 'Emptiness Factor',
  absence_level: 'Absence Level',
  null_coefficient: 'Null Coefficient',
}

export function InteractiveVoidSimulator() {
  const {
    isActive,
    currentPreset,
    parameters,
    startSimulation,
    stopSimulation,
    updateParameters,
    resetToDefault,
  } = useSimulator()

  const [selectedPresetId, setSelectedPresetId] = useState<string>('basic-void')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const simulatorRef = useRef<HTMLDivElement>(null)

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = VOID_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    setSelectedPresetId(presetId)
    setIsCustomMode(false)
    updateParameters(preset.parameters)
    
    // Emit analytics event
    eventBus.emit('analytics:event', {
      name: 'simulator_preset_selected',
      properties: {
        preset_id: presetId,
        preset_name: preset.name,
      }
    })

    // Trigger re-render of 3D showcase
    setAnimationKey(prev => prev + 1)
  }, [updateParameters])

  const handleCustomParameterChange = useCallback((paramKey: keyof SimulatorPreset['parameters'], value: number) => {
    setIsCustomMode(true)
    updateParameters({
      ...parameters,
      [paramKey]: value,
    })
    
    eventBus.emit('analytics:event', {
      name: 'simulator_parameter_changed',
      properties: {
        parameter: paramKey,
        value,
        is_custom: true,
      }
    })
  }, [parameters, updateParameters])

  const handleStartSimulation = useCallback(() => {
    const preset = VOID_PRESETS.find(p => p.id === selectedPresetId) || VOID_PRESETS[0]
    startSimulation(preset)
    
    eventBus.emit('analytics:event', {
      name: 'void_simulation_started',
      properties: {
        preset_id: selectedPresetId,
        is_custom: isCustomMode,
        parameters,
      }
    })
  }, [selectedPresetId, isCustomMode, parameters, startSimulation])

  const handleStopSimulation = useCallback(() => {
    stopSimulation()
    eventBus.emit('analytics:event', {
      name: 'void_simulation_stopped',
      properties: {
        duration_ms: Date.now() - (currentPreset?.animation_duration || 0),
      }
    })
  }, [stopSimulation, currentPreset])

  const handleReset = useCallback(() => {
    resetToDefault()
    setSelectedPresetId('basic-void')
    setIsCustomMode(false)
    setAnimationKey(prev => prev + 1)
    
    eventBus.emit('analytics:event', {
      name: 'simulator_reset',
      properties: {}
    })
  }, [resetToDefault])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault()
        if (isActive) {
          handleStopSimulation()
        } else {
          handleStartSimulation()
        }
        break
      case 'Escape':
        if (isActive) {
          handleStopSimulation()
        }
        break
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          handleReset()
        }
        break
    }
  }, [isActive, handleStartSimulation, handleStopSimulation, handleReset])

  return (
    <div 
      ref={simulatorRef}
      className="relative w-full bg-black text-white rounded-2xl overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Interactive void simulator"
      aria-live="polite"
    >
      {/* Background visualization */}
      <div className="absolute inset-0 z-0">
        <ThreeDShowcase 
          key={`showcase-${animationKey}`}
          preset={currentPreset}
          isActive={isActive}
          className="w-full h-full"
        />
      </div>

      {/* Control overlay */}
      <div className="relative z-10 p-6 bg-gradient-to-b from-black/80 via-transparent to-black/60">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Interactive Void Simulator
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience different intensities of nothingness. Adjust parameters to customize your void experience.
            </p>
          </motion.div>

          {/* Preset Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Choose Your Void Preset</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VOID_PRESETS.map((preset, index) => (
                <motion.button
                  key={preset.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`
                    p-4 rounded-lg text-left transition-all duration-300
                    border-2 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20
                    ${selectedPresetId === preset.id
                      ? 'border-white bg-white/10 shadow-lg shadow-white/20'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                    }
                  `}
                  aria-pressed={selectedPresetId === preset.id}
                >
                  <div className="font-medium text-white mb-1">{preset.name}</div>
                  <div className="text-sm text-gray-400 leading-snug">
                    {preset.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Parameter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Fine-tune Parameters</h3>
              {isCustomMode && (
                <span className="text-sm text-yellow-400 font-medium">
                  Custom Mode Active
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(parameters).map(([key, value]) => {
                const paramKey = key as keyof SimulatorPreset['parameters']
                return (
                  <div key={key} className="space-y-2">
                    <label 
                      htmlFor={`param-${key}`}
                      className="block text-sm font-medium text-gray-300"
                    >
                      {PARAMETER_LABELS[paramKey] || key}
                    </label>
                    <div className="relative">
                      <input
                        id={`param-${key}`}
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={value}
                        onChange={(e) => handleCustomParameterChange(paramKey, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        aria-label={`${PARAMETER_LABELS[paramKey]} control`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.00</span>
                        <span className="text-white font-mono">
                          {value.toFixed(2)}
                        </span>
                        <span>1.00</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Control Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              variant={isActive ? 'secondary' : 'primary'}
              size="lg"
              onClick={isActive ? handleStopSimulation : handleStartSimulation}
              disabled={false}
              className={
                isActive 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              }
              aria-label={isActive ? 'Stop void simulation' : 'Start void simulation'}
            >
              {isActive ? '■ Stop Simulation' : '▶ Start Simulation'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              disabled={isActive}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500"
              aria-label="Reset simulator to default state"
            >
              ↻ Reset
            </Button>
          </motion.div>

          {/* Status Display */}
          <AnimatePresence>
            {isActive && currentPreset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 text-sm font-medium">
                    Simulating {currentPreset.name}...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Development Info */}
{config.isDevelopment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
            >
              <details className="text-sm text-gray-400">
                <summary className="cursor-pointer hover:text-white transition-colors">
                  Debug Info
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify({
                    isActive,
                    selectedPresetId,
                    isCustomMode,
                    parameters,
                    currentPreset: currentPreset?.id,
                  }, null, 2)}
                </pre>
              </details>
            </motion.div>
          )}

          {/* Keyboard Shortcuts Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="text-xs text-gray-500 space-x-4">
              <span><kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Space</kbd> Toggle</span>
              <span><kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Esc</kbd> Stop</span>
              <span><kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400">Ctrl+R</kbd> Reset</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveVoidSimulator
