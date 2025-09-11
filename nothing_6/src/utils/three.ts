// filepath: src/utils/three.ts
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component (threeUtils)
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for 3D utils)

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { appConfig } from '@/app/config'
import { eventBus } from '@/core/events'

// Three.js scene utilities and model loading for the 3D nothing showcase

export interface LoadedModel {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
  gltf: any
}

export interface ModelLoaderOptions {
  enableDraco?: boolean
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  receiveShadow?: boolean
}

export interface SceneSetupOptions {
  backgroundColor?: string
  fogColor?: string
  fogNear?: number
  fogFar?: number
  enableShadows?: boolean
  shadowMapType?: THREE.ShadowMapType
}

export interface CameraAnimationOptions {
  duration?: number
  easing?: (t: number) => number
  onComplete?: () => void
}

// Model loader with caching
export class ModelLoader {
  private static cache = new Map<string, Promise<LoadedModel>>()
  private static loader: GLTFLoader | null = null
  private static dracoLoader: DRACOLoader | null = null

  private static initLoaders(enableDraco = true): void {
    if (!this.loader) {
      this.loader = new GLTFLoader()
      
      if (enableDraco) {
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        this.loader.setDRACOLoader(this.dracoLoader)
      }
    }
  }

  static async loadModel(
    path: string, 
    options: ModelLoaderOptions = {}
  ): Promise<LoadedModel> {
    const cacheKey = `${path}:${JSON.stringify(options)}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    this.initLoaders(options.enableDraco)

    const loadPromise = new Promise<LoadedModel>((resolve, reject) => {
      if (!this.loader) {
        reject(new Error('Failed to initialize GLTF loader'))
        return
      }

      this.loader.load(
        path,
        (gltf) => {
          try {
            const model = gltf.scene.clone()
            
            // Apply transformations
            if (options.scale) {
              model.scale.setScalar(options.scale)
            }
            
            if (options.position) {
              model.position.set(...options.position)
            }
            
            if (options.rotation) {
              model.rotation.set(...options.rotation)
            }

            // Configure shadows
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                if (options.castShadow) child.castShadow = true
                if (options.receiveShadow) child.receiveShadow = true
                
                // Ensure proper material setup
                if (child.material) {
                  child.material.needsUpdate = true
                }
              }
            })

            const result: LoadedModel = {
              scene: model,
              animations: gltf.animations || [],
              gltf: gltf
            }

            eventBus.emit('three:model-loaded', { path, model: result })
            resolve(result)
          } catch (error) {
            eventBus.emit('three:model-error', { path, error })
            reject(error)
          }
        },
        (progress) => {
          eventBus.emit('three:model-progress', { 
            path, 
            loaded: progress.loaded, 
            total: progress.total 
          })
        },
        (error) => {
          eventBus.emit('three:model-error', { path, error })
          reject(error)
        }
      )
    })

    this.cache.set(cacheKey, loadPromise)
    return loadPromise
  }

  static clearCache(): void {
    this.cache.clear()
  }

  static dispose(): void {
    this.clearCache()
    if (this.dracoLoader) {
      this.dracoLoader.dispose()
      this.dracoLoader = null
    }
    this.loader = null
  }
}

// Load the nothing.glb model specifically
export async function loadGLBModel(options: ModelLoaderOptions = {}): Promise<LoadedModel> {
  const modelPath = '/src/assets/models/nothing.glb'
  
  const defaultOptions: ModelLoaderOptions = {
    enableDraco: true,
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    castShadow: true,
    receiveShadow: true,
    ...options
  }

  try {
    return await ModelLoader.loadModel(modelPath, defaultOptions)
  } catch (error) {
    if (appConfig.isDevelopment) {
      console.warn('[loadGLBModel] Failed to load nothing.glb model:', error)
    }
    throw error
  }
}

// Scene setup utilities
export function setupScene(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  options: SceneSetupOptions = {}
): void {
  const {
    backgroundColor = '#000000',
    fogColor = '#000000',
    fogNear = 1,
    fogFar = 1000,
    enableShadows = true,
    shadowMapType = THREE.PCFSoftShadowMap
  } = options

  // Background
  scene.background = new THREE.Color(backgroundColor)
  
  // Fog
  scene.fog = new THREE.Fog(new THREE.Color(fogColor), fogNear, fogFar)
  
  // Shadows
  if (enableShadows) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = shadowMapType
  }
  
  // Renderer settings
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
}

// Camera animation utilities
export function animateCamera(
  camera: THREE.Camera,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  options: CameraAnimationOptions = {}
): Promise<void> {
  const { duration = 2000, easing = (t: number) => t, onComplete } = options
  
  return new Promise((resolve) => {
    const startPosition = camera.position.clone()
    const startQuaternion = camera.quaternion.clone()
    
    // Create temporary camera for target rotation
    const tempCamera = camera.clone()
    tempCamera.position.copy(targetPosition)
    tempCamera.lookAt(targetLookAt)
    const targetQuaternion = tempCamera.quaternion.clone()
    
    const startTime = Date.now()
    
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)
      
      // Interpolate position
      camera.position.lerpVectors(startPosition, targetPosition, easedProgress)
      
      // Interpolate rotation
      camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, easedProgress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        onComplete?.()
        resolve()
      }
    }
    
    animate()
  })
}

// React Three Fiber helpers hook
export function useThreeHelpers() {
  const { scene, camera, gl: renderer } = useThree()
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clockRef = useRef(new THREE.Clock())
  
  // Setup scene with default options
  const setupDefaultScene = useCallback((options?: SceneSetupOptions) => {
    setupScene(scene, renderer, {
      backgroundColor: '#0a0a0a',
      fogColor: '#1a1a2e',
      fogNear: 10,
      fogFar: 100,
      enableShadows: true,
      ...options
    })
  }, [scene, renderer])
  
  // Load and setup the nothing model
  const loadNothingModel = useCallback(async (options?: ModelLoaderOptions) => {
    try {
      const model = await loadGLBModel({
        scale: 1,
        position: [0, 0, 0],
        castShadow: true,
        receiveShadow: true,
        ...options
      })
      
      scene.add(model.scene)
      
      // Setup animation mixer if animations exist
      if (model.animations.length > 0) {
        animationMixerRef.current = new THREE.AnimationMixer(model.scene)
        
        // Play all animations
        model.animations.forEach(clip => {
          const action = animationMixerRef.current!.clipAction(clip)
          action.play()
        })
      }
      
      return model
    } catch (error) {
      if (appConfig.isDevelopment) {
        console.error('[useThreeHelpers] Failed to load nothing model:', error)
      }
      throw error
    }
  }, [scene])
  
  // Animation frame updates
  useFrame(() => {
    if (animationMixerRef.current) {
      const delta = clockRef.current.getDelta()
      animationMixerRef.current.update(delta)
    }
  })
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationMixerRef.current) {
        animationMixerRef.current.stopAllAction()
        animationMixerRef.current = null
      }
    }
  }, [])
  
  // Camera animation helper
  const animateCameraTo = useCallback((
    position: [number, number, number],
    lookAt: [number, number, number],
    options?: CameraAnimationOptions
  ) => {
    return animateCamera(
      camera,
      new THREE.Vector3(...position),
      new THREE.Vector3(...lookAt),
      options
    )
  }, [camera])
  
  return {
    scene,
    camera,
    renderer,
    setupDefaultScene,
    loadNothingModel,
    animateCameraTo,
    animationMixer: animationMixerRef.current,
  }
}

// Lighting presets
export const lightingPresets = {
  nothing: (scene: THREE.Scene) => {
    // Ambient lighting for void
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1)
    scene.add(ambientLight)
    
    // Directional light for drama
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    scene.add(directionalLight)
    
    return { ambientLight, directionalLight }
  },
  
  showcase: (scene: THREE.Scene) => {
    // Studio lighting setup
    const keyLight = new THREE.DirectionalLight(0xffffff, 1)
    keyLight.position.set(10, 10, 5)
    keyLight.castShadow = true
    scene.add(keyLight)
    
    const fillLight = new THREE.DirectionalLight(0x4040ff, 0.3)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)
    
    const rimLight = new THREE.DirectionalLight(0xff4040, 0.2)
    rimLight.position.set(0, 5, -10)
    scene.add(rimLight)
    
    return { keyLight, fillLight, rimLight }
  }
}

// Material helpers
export const materialPresets = {
  nothing: new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9
  }),
  
  void: new THREE.MeshPhongMaterial({
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.7,
    shininess: 100
  }),
  
  holographic: new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x4040ff) },
      color2: { value: new THREE.Color(0xff4040) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      
      void main() {
        float alpha = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, alpha);
        gl_FragColor = vec4(color, 0.8);
      }
    `,
    transparent: true
  })
}

// Geometry helpers
export const geometryPresets = {
  nothingPlane: () => new THREE.PlaneGeometry(1, 1, 32, 32),
  voidSphere: () => new THREE.SphereGeometry(1, 32, 32),
  infiniteBox: () => new THREE.BoxGeometry(1, 1, 1, 8, 8, 8)
}

// Main utilities object
export const threeUtils = {
  ModelLoader,
  loadGLBModel,
  setupScene,
  animateCamera,
  useThreeHelpers,
  lightingPresets,
  materialPresets,
  geometryPresets,
}

// Development helpers
if (appConfig.isDevelopment && typeof window !== 'undefined') {
  (window as any).__THREE_UTILS__ = {
    threeUtils,
    ModelLoader,
    THREE,
  }
}

export default threeUtils
