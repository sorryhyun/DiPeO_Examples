// filepath: src/features/roadmap/RoadmapTimeline.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { RoadmapItem } from '@/core/contracts'
import { config } from '@/app/config'
import { uid } from '@/core/utils'
import { containerVariants, itemVariants, glitchVariants } from '@/utils/framerMotionPresets'

interface RoadmapTimelineProps {
  items?: RoadmapItem[]
  className?: string
  showGlitchEffect?: boolean
}

// Mock roadmap data for the "nothing" theme
const mockRoadmapItems: RoadmapItem[] = [
  {
    id: uid('roadmap'),
    title: 'Nothing v1.0',
    date: '2024-01-01',
    description: 'Initial release of premium nothing with basic void features',
    status: 'shipped'
  },
  {
    id: uid('roadmap'),
    title: 'Nothing v1.1 - Enhanced Emptiness',
    date: '2024-03-15',
    description: 'Improved void rendering with 50% more nothing per nothing',
    status: 'shipped'
  },
  {
    id: uid('roadmap'),
    title: 'Nothing v2.0 - The Great Void',
    date: '2024-06-01',
    description: 'Revolutionary breakthrough in nothing technology. Complete reimagining of emptiness.',
    status: 'in_progress'
  },
  {
    id: uid('roadmap'),
    title: 'Nothing v2.1 - Quantum Nothing',
    date: '2024-09-30',
    description: 'Quantum-entangled nothing that exists and doesn\'t exist simultaneously',
    status: 'planned'
  },
  {
    id: uid('roadmap'),
    title: 'Nothing v3.0 - Infinite Void',
    date: '2025-01-15',
    description: 'Unlimited nothing storage with cloud-based emptiness synchronization',
    status: 'planned'
  },
  {
    id: uid('roadmap'),
    title: 'Nothing v4.0 - Metaverse Nothing',
    date: '2025-06-01',
    description: 'Virtual reality nothing experiences in the metaverse. Experience nothing like never before.',
    status: 'planned'
  }
]

const getStatusColor = (status: RoadmapItem['status']) => {
  switch (status) {
    case 'shipped':
      return 'bg-green-500 border-green-400'
    case 'in_progress':
      return 'bg-yellow-500 border-yellow-400'
    case 'planned':
      return 'bg-gray-500 border-gray-400'
    default:
      return 'bg-gray-500 border-gray-400'
  }
}

const getStatusLabel = (status: RoadmapItem['status']) => {
  switch (status) {
    case 'shipped':
      return 'Delivered'
    case 'in_progress':
      return 'In Progress'
    case 'planned':
      return 'Planned'
    default:
      return 'Unknown'
  }
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

const RoadmapItem: React.FC<{
  item: RoadmapItem
  index: number
  showGlitchEffect: boolean
}> = ({ item, index, showGlitchEffect }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isHovered, setIsHovered] = useState(false)

  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.2 }}
      className={`relative flex items-center w-full mb-8 ${
        isLeft ? 'flex-row' : 'flex-row-reverse'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`roadmap-title-${item.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsHovered(!isHovered)
        }
      }}
    >
      {/* Timeline line connector */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500 transform -translate-x-px -z-10" />
      
      {/* Content card */}
      <div className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}>
        <motion.div
          variants={showGlitchEffect ? glitchVariants : {}}
          animate={isHovered && showGlitchEffect ? 'glitch' : 'idle'}
          className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300 focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <time 
              className="text-sm text-gray-400 font-mono"
              dateTime={item.date}
            >
              {formatDate(item.date || '')}
            </time>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)} text-white`}
              aria-label={`Status: ${getStatusLabel(item.status)}`}
            >
              {getStatusLabel(item.status)}
            </span>
          </div>
          
          <h3 
            id={`roadmap-title-${item.id}`}
            className="text-lg font-bold text-white mb-2"
          >
            {item.title}
          </h3>
          
          {item.description && (
            <p className="text-gray-300 text-sm leading-relaxed">
              {item.description}
            </p>
          )}
        </motion.div>
      </div>
      
      {/* Timeline dot */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`w-4 h-4 rounded-full border-2 ${getStatusColor(item.status)} relative z-10`}
          aria-hidden="true"
        >
          <div className="absolute inset-1 bg-white rounded-full" />
        </motion.div>
      </div>
      
      {/* Empty space for opposite side */}
      <div className="w-5/12" />
    </motion.div>
  )
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  items = mockRoadmapItems,
  className = '',
  showGlitchEffect = config.isDevelopment
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-200px' })

  useEffect(() => {
    // Analytics tracking for roadmap views
    if (isInView && config.isDevelopment) {
      console.debug('[RoadmapTimeline] Timeline viewed')
    }
  }, [isInView])

  if (!items.length) {
    return (
      <div 
        className={`text-center text-gray-400 py-12 ${className}`}
        role="status"
        aria-live="polite"
      >
        <p>No roadmap items to display. The void is complete.</p>
      </div>
    )
  }

  return (
    <section
      ref={containerRef}
      className={`relative max-w-4xl mx-auto py-12 ${className}`}
      aria-labelledby="roadmap-heading"
    >
      {/* Section header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="text-center mb-16"
      >
        <h2 
          id="roadmap-heading"
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Nothing Roadmap
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Our journey through the void continues. Here's what's coming to absolutely nothing.
        </p>
      </motion.div>

      {/* Timeline container */}
      <motion.div
variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative"
      >
        {/* Animated gradient background line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-px">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50" />
        </div>
        
        {items.map((item, index) => (
          <RoadmapItem
            key={item.id}
            item={item}
            index={index}
            showGlitchEffect={showGlitchEffect}
          />
        ))}
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: items.length * 0.2 + 0.5 }}
        className="text-center mt-16"
      >
        <p className="text-gray-400 mb-6">
          Want to shape the future of nothing?
        </p>
        <button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
          onClick={() => {
            if (config.isDevelopment) {
              console.debug('[RoadmapTimeline] Feedback button clicked')
            }
          }}
        >
          Share Your Nothing Ideas
        </button>
      </motion.div>
    </section>
  )
}

export default RoadmapTimeline
