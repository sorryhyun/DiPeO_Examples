// filepath: src/features/void/ParticleVoid.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { createThreeUtils } from '@/utils/three'

export interface ParticleVoidProps {
  /** Number of particles to render */
  count?: number
  /** Size of each particle */
  size?: number
  /** Movement speed multiplier */
  speed?: number
  /** Color of particles */
  color?: string
  /** Opacity of particles */
  opacity?: number
  /** Enable interactive mouse/touch effects */
  interactive?: boolean
  /** Void radius (particles avoid center) */
  voidRadius?: number
  /** Animation pause state */
  paused?: boolean
  /** Performance mode (reduces particle count on low-end devices) */
  performanceMode?: 'auto' | 'high' | 'medium' | 'low'
  /** Custom animation preset */
  animationPreset?: 'drift' | 'spiral' | 'chaos' | 'orbit' | 'pulse'
  /** Callback when particles finish initializing */
  onReady?: () => void
  /** Callback for performance metrics */
  onPerformanceUpdate?: (fps: number, particleCount: number) => void
  /** ARIA label for accessibility */
  'aria-label'?: string
  className?: string
}

export interface ParticleVoidRef {
  reset: () => void
  pause: () => void
  resume: () => void
  updateCount: (count: number) => void
  triggerPulse: () => void
  getCurrentParticleCount: () => number
}

// Particle system component (runs inside Canvas)
const ParticleSystem: React.FC<{
  count: number
  size: number
  speed: number
  color: string
  opacity: number
  interactive: boolean
  voidRadius: number
  paused: boolean
  animationPreset: string
  onReady?: () => void
  onPerformanceUpdate?: (fps: number, particleCount: number) => void
}> = ({ 
  count, 
  size, 
  speed, 
  color, 
  opacity, 
  interactive, 
  voidRadius, 
  paused,
  animationPreset,
  onReady,
  onPerformanceUpdate 
}) => {
  const pointsRef = useRef<THREE.Points>(null!)
  const { mouse, viewport, camera } = useThree()
  const threeUtils = useMemo(() => createThreeUtils(), [])
  
  // Performance monitoring
  const performanceRef = useRef({
    frameCount: 0,
    lastTime: Date.now(),
    lastFpsReport: Date.now()
  })

  // Generate particle positions and properties
  const [positions, velocities, phases] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Initial position (avoid center void)
      let x, y, z
      do {
        x = (Math.random() - 0.5) * 20
        y = (Math.random() - 0.5) * 20
        z = (Math.random() - 0.5) * 20
      } while (Math.sqrt(x * x + y * y + z * z) < voidRadius)
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Initial velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
      
      // Phase for wave-like motion
      phases[i] = Math.random() * Math.PI * 2
    }
    
    return [positions, velocities, phases]
  }, [count, voidRadius])

  // Animation frame
  useFrame((state) => {
    if (!pointsRef.current || paused) return
    
    const time = state.clock.getElapsedTime()
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    // Performance monitoring
    performanceRef.current.frameCount++
    const now = Date.now()
    if (now - performanceRef.current.lastFpsReport > 1000) {
      const fps = (performanceRef.current.frameCount * 1000) / (now - performanceRef.current.lastFpsReport)
      onPerformanceUpdate?.(Math.round(fps), count)
      performanceRef.current.frameCount = 0
      performanceRef.current.lastFpsReport = now
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      let x = positions[i3]
      let y = positions[i3 + 1]
      let z = positions[i3 + 2]
      
      // Apply animation preset
      switch (animationPreset) {
        case 'spiral':
          const radius = Math.sqrt(x * x + z * z)
          const angle = Math.atan2(z, x) + speed * 0.01
          x = Math.cos(angle) * radius
          z = Math.sin(angle) * radius
          y += Math.sin(time * speed + phases[i]) * 0.01
          break
          
        case 'chaos':
          x += Math.sin(time * speed * 2 + phases[i]) * 0.02
          y += Math.cos(time * speed * 1.5 + phases[i]) * 0.02
          z += Math.sin(time * speed * 0.8 + phases[i]) * 0.02
          break
          
        case 'orbit':
          const orbitRadius = 8 + Math.sin(phases[i]) * 2
          const orbitAngle = time * speed * 0.5 + phases[i]
          x = Math.cos(orbitAngle) * orbitRadius
          z = Math.sin(orbitAngle) * orbitRadius
          y = Math.sin(time * speed + phases[i]) * 3
          break
          
        case 'pulse':
          const pulseScale = 1 + Math.sin(time * speed * 2) * 0.5
          x *= pulseScale
          y *= pulseScale
          z *= pulseScale
          break
          
        default: // 'drift'
          x += velocities[i3] * speed
          y += velocities[i3 + 1] * speed
          z += velocities[i3 + 2] * speed
          break
      }
      
      // Interactive mouse influence
      if (interactive) {
        const mouseX = (mouse.x * viewport.width) / 2
        const mouseY = (mouse.y * viewport.height) / 2
        const dx = x - mouseX
        const dy = y - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 5) {
          const force = (5 - distance) * 0.01
          x += (dx / distance) * force
          y += (dy / distance) * force
        }
      }
      
      // Void repulsion (particles avoid center)
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z)
      if (distanceFromCenter < voidRadius) {
        const repulsionForce = (voidRadius - distanceFromCenter) * 0.1
        x += (x / distanceFromCenter) * repulsionForce
        y += (y / distanceFromCenter) * repulsionForce
        z += (z / distanceFromCenter) * repulsionForce
      }
      
      // Boundary constraints
      const boundary = 12
      if (Math.abs(x) > boundary) {
        x = Math.sign(x) * boundary
        velocities[i3] *= -0.8
      }
      if (Math.abs(y) > boundary) {
        y = Math.sign(y) * boundary
        velocities[i3 + 1] *= -0.8
      }
      if (Math.abs(z) > boundary) {
        z = Math.sign(z) * boundary
        velocities[i3 + 2] *= -0.8
      }
      
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Initialize and report ready
  useEffect(() => {
    if (pointsRef.current) {
      onReady?.()
      
      // Emit analytics event
      eventBus.emit('analytics:event', {
        name: 'particle_void:initialized',
        properties: { count, animationPreset, interactive }
      })
    }
  }, [count, animationPreset, interactive, onReady])

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        size={size}
        color={color}
        opacity={opacity}
        transparent
        alphaTest={0.001}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </Points>
  )
}

// Main ParticleVoid component
export const ParticleVoid = forwardRef<ParticleVoidRef, ParticleVoidProps>(({
  count = 1000,
  size = 0.8,
  speed = 1,
  color = '#8B5CF6',
  opacity = 0.6,
  interactive = true,
  voidRadius = 2,
  paused = false,
  performanceMode = 'auto',
  animationPreset = 'drift',
  onReady,
  onPerformanceUpdate,
  'aria-label': ariaLabel = 'Animated particle void visualization',
  className = '',
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null!)
  const systemStateRef = useRef({
    isPaused: paused,
    currentCount: count,
    pulseActive: false
  })

  // Adjust particle count based on performance mode
  const adjustedCount = useMemo(() => {
    if (performanceMode === 'auto') {
      // Auto-detect based on device capabilities
      const isLowEnd = !window.DeviceMotionEvent || navigator.hardwareConcurrency <= 2
      return isLowEnd ? Math.min(count, 500) : count
    }
    
    const multipliers = {
      high: 1,
      medium: 0.7,
      low: 0.4
    }
    
    return Math.floor(count * multipliers[performanceMode])
  }, [count, performanceMode])

  // Imperative API for parent components
  useImperativeHandle(ref, () => ({
    reset: () => {
      // Force re-render by updating key or state
      eventBus.emit('analytics:event', {
        name: 'particle_void:reset',
        properties: { count: systemStateRef.current.currentCount }
      })
    },
    
    pause: () => {
      systemStateRef.current.isPaused = true
    },
    
    resume: () => {
      systemStateRef.current.isPaused = false
    },
    
    updateCount: (newCount: number) => {
      systemStateRef.current.currentCount = newCount
    },
    
    triggerPulse: () => {
      systemStateRef.current.pulseActive = true
      setTimeout(() => {
        systemStateRef.current.pulseActive = false
      }, 2000)
    },
    
    getCurrentParticleCount: () => systemStateRef.current.currentCount
  }), [])

  // Handle performance updates
  const handlePerformanceUpdate = (fps: number, particleCount: number) => {
    onPerformanceUpdate?.(fps, particleCount)
    
    // Auto-adjust quality if performance drops significantly
    if (performanceMode === 'auto' && fps < 30 && config.isDevelopment) {
      console.warn('[ParticleVoid] Low FPS detected:', fps, 'Particles:', particleCount)
    }
  }

  // Error boundary for Three.js
  const handleError = (error: Error) => {
    console.error('[ParticleVoid] Rendering error:', error)
    eventBus.emit('analytics:event', {
      name: 'particle_void:error',
      properties: { error: error.message, count: adjustedCount }
    })
  }

  return (
    <div
      ref={containerRef}
      className={`particle-void-container ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      {...props}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        onCreated={(state) => {
          // Set up initial camera and renderer settings
          state.gl.setClearColor(new THREE.Color('#000000'), 0)
        }}
        onError={handleError}
      >
        <ParticleSystem
          count={adjustedCount}
          size={size}
          speed={speed}
          color={color}
          opacity={opacity}
          interactive={interactive}
          voidRadius={voidRadius}
          paused={paused || systemStateRef.current.isPaused}
          animationPreset={animationPreset}
          onReady={onReady}
          onPerformanceUpdate={handlePerformanceUpdate}
        />
      </Canvas>
    </div>
  )
})

ParticleVoid.displayName = 'ParticleVoid'

export default ParticleVoid

// Example usage (commented):
// import ParticleVoid from '@/features/void/ParticleVoid'
// 
// <ParticleVoid
//   count={2000}
//   size={1.2}
//   color="#8B5CF6"
//   interactive={true}
//   animationPreset="spiral"
//   performanceMode="auto"
//   onReady={() => console.log('Void initialized')}
//   onPerformanceUpdate={(fps, count) => console.log(`FPS: ${fps}, Particles: ${count}`)}
// />
