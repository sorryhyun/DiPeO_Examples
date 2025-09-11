// filepath: src/features/showcase/ThreeDShowcase.tsx

// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { motion } from 'framer-motion'

import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { utils } from '@/core/utils'
import { createThreeUtils } from '@/utils/three'

interface NothingModelProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  autoRotate?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
}

interface ThreeDShowcaseProps {
  className?: string
  height?: number
  autoRotate?: boolean
  interactive?: boolean
  modelPath?: string
  showControls?: boolean
  onModelLoad?: () => void
  onInteraction?: (type: string, data?: any) => void
}

// Nothing model component with error boundary
function NothingModel({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1,
  autoRotate = true,
  onLoad,
  onError 
}: NothingModelProps) {
  const meshRef = useRef<Group>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Load the GLB model with error handling
  const gltf = useLoader(GLTFLoader, '/assets/models/nothing.glb', undefined, (error) => {
    console.error('[ThreeDShowcase] Failed to load nothing.glb model:', error)
    onError?.(error as Error)
    eventBus.emit('analytics:event', { 
      name: '3d_model_load_error', 
      properties: { error: String(error) } 
    })
  })

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (!meshRef.current || !isLoaded) return
    
    if (autoRotate) {
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x += delta * 0.2
    }
    
    // Subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
  })

  useEffect(() => {
    if (gltf && !isLoaded) {
      setIsLoaded(true)
      onLoad?.()
      eventBus.emit('analytics:event', { 
        name: '3d_model_loaded', 
        properties: { modelPath: '/assets/models/nothing.glb' } 
      })
    }
  }, [gltf, isLoaded, onLoad])

  if (!gltf) return null

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={gltf.scene} />
    </group>
  )
}

// Loading fallback component
function ModelLoadingFallback() {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#6366f1" 
        transparent 
        opacity={0.5} 
        wireframe 
      />
    </mesh>
  )
}

// Main showcase component
export function ThreeDShowcase({
  className = '',
  height = 400,
  autoRotate = true,
  interactive = true,
  modelPath = '/assets/models/nothing.glb',
  showControls = true,
  onModelLoad,
  onInteraction
}: ThreeDShowcaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const threeUtils = createThreeUtils()

  const handleModelLoad = useCallback(() => {
    setIsLoading(false)
    setError(null)
    onModelLoad?.()
    
    eventBus.emit('analytics:event', { 
      name: '3d_showcase_loaded', 
      properties: { height, interactive, autoRotate } 
    })
  }, [onModelLoad, height, interactive, autoRotate])

  const handleModelError = useCallback((error: Error) => {
    setIsLoading(false)
    setError(error.message || 'Failed to load 3D model')
    
    eventBus.emit('analytics:event', { 
      name: '3d_showcase_error', 
      properties: { error: error.message } 
    })
  }, [])

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!interactive) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    onInteraction?.('click', { x, y, timestamp: Date.now() })
    
    eventBus.emit('analytics:event', { 
      name: '3d_showcase_interaction', 
      properties: { type: 'click', x, y } 
    })
  }, [interactive, onInteraction])

  const handleDragStart = useCallback(() => {
    if (!interactive) return
    setIsDragging(true)
    onInteraction?.('dragStart')
  }, [interactive, onInteraction])

  const handleDragEnd = useCallback(() => {
    if (!interactive) return
    setIsDragging(false)
    onInteraction?.('dragEnd')
  }, [interactive, onInteraction])

  // Keyboard controls for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!interactive) return
    
    const key = event.key.toLowerCase()
    const actions = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'enter', ' ']
    
    if (actions.includes(key)) {
      event.preventDefault()
      onInteraction?.('keyboard', { key })
      
      eventBus.emit('analytics:event', { 
        name: '3d_showcase_keyboard', 
        properties: { key } 
      })
    }
  }, [interactive, onInteraction])

  // Error state
  if (error) {
    return (
      <motion.div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ height }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        role="alert"
        aria-label="3D model failed to load"
      >
        <div className="text-center p-6">
          <div className="text-red-500 dark:text-red-400 text-lg mb-2">
            ⚠️ Failed to load 3D model
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {config.isDevelopment ? error : 'Please try refreshing the page'}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/20 to-blue-900/20 ${className}`}
      style={{ height }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      role="application"
      aria-label="Interactive 3D showcase of nothing"
      tabIndex={interactive ? 0 : -1}
      onKeyDown={handleKeyDown}
    >
      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-label="Loading 3D model"
        >
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Loading 3D model...</p>
          </div>
        </motion.div>
      )}

      {/* Canvas container */}
      <Canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onClick={handleCanvasClick}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6366f1" />
        <spotLight 
          position={[0, 20, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5}
          castShadow
        />

        {/* Camera */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 0, 5]} 
          fov={50}
          near={0.1}
          far={1000}
        />

        {/* Controls */}
        {interactive && showControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            autoRotate={autoRotate && !isDragging}
            autoRotateSpeed={0.5}
            dampingFactor={0.1}
            enableDamping
          />
        )}

        {/* The nothing model with suspense boundary */}
        <Suspense fallback={<ModelLoadingFallback />}>
          <NothingModel
            position={[0, 0, 0]}
            scale={1.5}
            autoRotate={autoRotate && !isDragging && !showControls}
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
        </Suspense>

        {/* Background gradient */}
        <mesh position={[0, 0, -5]} scale={[20, 20, 1]}>
          <planeGeometry />
          <meshBasicMaterial 
            color="#1a1a2e" 
            transparent 
            opacity={0.1}
          />
        </mesh>
      </Canvas>

      {/* UI overlays */}
      {interactive && (
        <div className="absolute bottom-4 left-4 text-xs text-white/70 bg-black/20 backdrop-blur-sm rounded px-2 py-1">
          {showControls ? 'Drag to rotate • Scroll to zoom' : 'Click to interact'}
        </div>
      )}

      {/* Model info */}
      {!isLoading && !error && (
        <motion.div
          className="absolute top-4 right-4 text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="bg-black/20 backdrop-blur-sm rounded px-3 py-2 text-white">
            <div className="text-sm font-medium">Nothing™ 3D Model</div>
            <div className="text-xs opacity-70">Premium void visualization</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Debug component for development
function ThreeDShowcaseDebug() {
  if (!config.isDevelopment) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
      <div>Three.js Debug Panel</div>
      <div>Renderer: WebGL2</div>
      <div>Model: nothing.glb</div>
    </div>
  )
}

// Main export with debug overlay in development
export default function ThreeDShowcaseWithDebug(props: ThreeDShowcaseProps) {
  useEffect(() => {
    // Track component mount
    eventBus.emit('analytics:event', { 
      name: '3d_showcase_mounted',
      properties: { props: Object.keys(props) }
    })
    
    return () => {
      eventBus.emit('analytics:event', { 
        name: '3d_showcase_unmounted' 
      })
    }
  }, [props])

  return (
    <>
      <ThreeDShowcase {...props} />
      {config.isDevelopment && <ThreeDShowcaseDebug />}
    </>
  )
}

// Named exports
export type { ThreeDShowcaseProps }
