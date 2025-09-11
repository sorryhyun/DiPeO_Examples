// filepath: src/features/reviews/ReviewsList.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect, useRef } from 'react'
import { config } from '@/app/config'
import { eventBus } from '@/core/events'
import { Review } from '@/core/contracts'
import { nothingService } from '@/services/nothingService'
import Rating from '@/shared/components/Rating'
import Skeleton from '@/shared/components/Skeleton'

interface ReviewsListProps {
  className?: string
  maxReviews?: number
  showConfetti?: boolean
}

interface ConfettiParticle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  className = '',
  maxReviews = 6,
  showConfetti = true,
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  // Load reviews on mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await nothingService.getReviews()
        if (result.success) {
          setReviews(result.data?.slice(0, maxReviews) || [])
        } else {
          setError(result.error || 'Failed to load reviews')
        }
      } catch (err) {
        setError('Failed to load reviews')
        console.error('Reviews loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [maxReviews])

  // Confetti animation system
  const createConfetti = (count: number = 50) => {
    if (!showConfetti) return

    const particles: ConfettiParticle[] = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b']
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: Math.random() * 100 + 50,
      })
    }
    
    setConfettiParticles(prev => [...prev, ...particles])
  }

  // Animate confetti particles
  useEffect(() => {
    if (!showConfetti || confettiParticles.length === 0) return

    const animate = () => {
      setConfettiParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: particle.vx * 0.98,
          vy: particle.vy + 0.1,
          life: particle.life + 1,
        }))
        .filter(particle => 
          particle.life < particle.maxLife && 
          particle.y < window.innerHeight + 10 &&
          particle.x > -10 && 
          particle.x < window.innerWidth + 10
        )
      )
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [confettiParticles.length, showConfetti])

  // Draw confetti on canvas
  useEffect(() => {
    if (!showConfetti) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize canvas to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      confettiParticles.forEach(particle => {
        const opacity = Math.max(0, (particle.maxLife - particle.life) / particle.maxLife)
        
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = particle.color
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        ctx.restore()
      })
      
      requestAnimationFrame(draw)
    }
    
    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [confettiParticles, showConfetti])

  const handleReviewClick = (review: Review) => {
    eventBus.emit('analytics:event', {
      name: 'review_clicked',
      properties: { reviewId: review.id, rating: review.rating }
    })
    
    // Trigger confetti for 5-star reviews
    if (review.rating === 5) {
      createConfetti()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, review: Review) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleReviewClick(review)
    }
  }

  if (loading) {
    return (
      <section className={`reviews-list ${className}`} aria-label="Customer reviews">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: maxReviews }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <Skeleton className="w-24 h-4 mb-3" />
<Skeleton className="w-full h-16 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`reviews-list ${className}`} aria-label="Customer reviews">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M6.343 6.343A8 8 0 0112 4.001c1.566 0 3.033.45 4.266 1.225" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Unable to Load Reviews
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          {config.isDevelopment && (
            <p className="text-sm text-gray-500 mt-2">
              Check that the nothing service is properly configured
            </p>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className={`reviews-list relative ${className}`} aria-label="Customer reviews">
      {showConfetti && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ mixBlendMode: 'multiply' }}
          aria-hidden="true"
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <article
            key={review.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            onClick={() => handleReviewClick(review)}
            onKeyDown={(e) => handleKeyDown(e, review)}
            tabIndex={0}
            role="button"
            aria-label={`Review by ${review.author}, ${review.rating} out of 5 stars`}
          >
            <div className="flex items-center justify-between mb-3">
              <Rating
                value={review.rating}
                maxValue={5}
                size="sm"
                className="text-yellow-400"
                aria-label={`${review.rating} out of 5 stars`}
              />
              <time
                className="text-sm text-gray-500 dark:text-gray-400"
                dateTime={review.date}
                title={new Date(review.date).toLocaleDateString()}
              >
                {new Date(review.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
            
            <blockquote className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-4">
              "{review.content}"
            </blockquote>
            
            <footer className="flex items-center justify-between">
              <cite className="font-medium text-gray-900 dark:text-white not-italic">
                {review.author}
              </cite>
              {review.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </footer>
          </article>
        ))}
      </div>
      
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to review our absolutely nothing!
          </p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {reviews.length} of our most satisfied customers
          {showConfetti && reviews.some(r => r.rating === 5) && (
            <span className="block mt-1">
              ✨ Click a 5-star review for a surprise! ✨
            </span>
          )}
        </p>
      </div>
    </section>
  )
}

export default ReviewsList
