// filepath: src/features/hero/MatrixRainZero.tsx

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/utils/gsap'
import { clamp, uid } from '@/core/utils'
import { config } from '@/app/config'

interface MatrixChar {
  x: number
  y: number
  speed: number
  opacity: number
  char: string
  id: string
}

interface MatrixRainZeroProps {
  className?: string
  density?: number
  speed?: number
  color?: string
  glow?: boolean
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export default function MatrixRainZero({
  className = '',
  density = 0.8,
  speed = 1,
  color = '#00ff00',
  glow = true
}: MatrixRainZeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const charactersRef = useRef<MatrixChar[]>([])
  const [isVisible, setIsVisible] = useState(true)
  
  // Matrix characters - focusing on zeros and binary
  const matrixChars = ['0', '1', '0', '0', '0', '1', '0', '0', '1', '0']
  
  const initializeCharacters = (canvas: HTMLCanvasElement) => {
    const { width, height } = canvas
    const charCount = Math.floor((width * height * density) / 10000)
    
    charactersRef.current = Array.from({ length: charCount }, () => ({
      x: randomBetween(0, width),
      y: randomBetween(-height, 0),
      speed: randomBetween(1, 4) * speed,
      opacity: randomBetween(0.1, 1),
      char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
      id: uid('matrix-char-')
    }))
  }
  
  const updateCharacters = (canvas: HTMLCanvasElement, deltaTime: number) => {
    const { height } = canvas
    
    charactersRef.current.forEach((char) => {
      char.y += char.speed * deltaTime * 60 // 60fps normalized
      char.opacity = Math.max(0.1, char.opacity - 0.002 * deltaTime * 60)
      
      // Reset character when it goes off screen
      if (char.y > height + 20) {
        char.y = randomBetween(-100, -20)
        char.x = randomBetween(0, canvas.width)
        char.opacity = randomBetween(0.3, 1)
        char.char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
      }
    })
  }
  
  const render = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Clear with slight trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Set font and text properties
    ctx.font = '14px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    charactersRef.current.forEach((char) => {
      const alpha = clamp(char.opacity, 0, 1)
      
      if (glow) {
        // Glow effect
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
      } else {
        ctx.shadowBlur = 0
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
      }
      
      ctx.fillText(char.char, char.x, char.y)
    })
    
    // Reset shadow
    ctx.shadowBlur = 0
  }
  
  const animate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    let lastTime = 0
    
    const loop = (currentTime: number) => {
      if (!isVisible) return
      
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      
      updateCharacters(canvas, deltaTime)
      render(canvas, ctx)
      
      animationRef.current = requestAnimationFrame(loop)
    }
    
    animationRef.current = requestAnimationFrame(loop)
  }
  
  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const container = canvas.parentElement
    if (!container) return
    
    const { width, height } = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
    
    initializeCharacters(canvas)
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Initial setup
    resizeCanvas(canvas)
    
    // Handle window resize
    const handleResize = () => resizeCanvas(canvas)
    window.addEventListener('resize', handleResize)
    
    // Start animation
    animate(canvas, ctx)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [density, speed, color, glow, isVisible])
  
  // Handle visibility change for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  
  // GSAP entrance animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    gsap.fromTo(canvas, 
      { opacity: 0, scale: 1.1 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 2,
        ease: 'power2.out'
      }
    )
  }, [])
  
  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="img"
      aria-label="Matrix rain animation with zeros"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          filter: glow ? 'blur(0.5px)' : 'none',
          mixBlendMode: config.isDevelopment ? 'normal' : 'screen'
        }}
      />
    </div>
  )
}
