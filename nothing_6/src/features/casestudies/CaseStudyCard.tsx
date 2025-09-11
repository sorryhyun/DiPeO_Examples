// filepath: src/features/casestudies/CaseStudyCard.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for this component)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react'
import { eventBus } from '@/core/events'
import GlassCard from '@/shared/components/GlassCard'
import Button from '@/shared/components/Button'

export interface CaseStudyData {
  id: string
  title: string
  company: string
  industry: string
  description: string
  results: {
    metric: string
    value: string
    improvement: string
  }[]
  testimonial: {
    quote: string
    author: string
    role: string
    avatar?: string
  }
  image?: string
  tags: string[]
  duration: string
  publishedAt: Date
}

export interface CaseStudyCardProps {
  caseStudy: CaseStudyData
  className?: string
  onViewDetails?: (id: string) => void
  showFullTestimonial?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({
  caseStudy,
  className = '',
  onViewDetails,
  showFullTestimonial = false,
  variant = 'default'
}) => {
  const handleViewDetails = () => {
    eventBus.emit('analytics:event', {
      name: 'case_study_viewed',
      properties: {
        case_study_id: caseStudy.id,
        company: caseStudy.company,
        industry: caseStudy.industry
      }
    })
    onViewDetails?.(caseStudy.id)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleViewDetails()
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <GlassCard
      className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isFeatured ? 'border-blue-500/30' : ''
      } ${className}`}
      tabIndex={0}
      role="article"
      aria-label={`Case study: ${caseStudy.title} for ${caseStudy.company}`}
      onKeyDown={handleKeyDown}
      onClick={handleViewDetails}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-blue-400 font-medium">
                {caseStudy.industry}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm text-gray-400">
                {formatDate(caseStudy.publishedAt)}
              </span>
            </div>
            <h3 className={`font-bold text-white group-hover:text-blue-300 transition-colors ${
              isCompact ? 'text-lg' : 'text-xl'
            }`}>
              {caseStudy.title}
            </h3>
            <p className="text-gray-300 font-medium mt-1">
              {caseStudy.company}
            </p>
          </div>
          {isFeatured && (
            <div className="flex-shrink-0">
              <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                Featured
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed">
          {isCompact 
            ? truncateText(caseStudy.description, 120)
            : truncateText(caseStudy.description, 180)
          }
        </p>

        {/* Key Results */}
        {!isCompact && caseStudy.results.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {caseStudy.results.slice(0, 2).map((result, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30"
              >
                <div className="text-lg font-bold text-green-400">
                  {result.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {result.improvement}
                </div>
                <div className="text-xs text-gray-500">
                  {result.metric}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonial */}
        {caseStudy.testimonial && (showFullTestimonial || !isCompact) && (
          <div className="bg-gray-800/30 rounded-lg p-4 border-l-4 border-blue-500/50">
            <blockquote className="text-gray-300 italic text-sm leading-relaxed">
              "{showFullTestimonial 
                ? caseStudy.testimonial.quote 
                : truncateText(caseStudy.testimonial.quote, 100)
              }"
            </blockquote>
            <div className="flex items-center gap-2 mt-3">
              {caseStudy.testimonial.avatar && (
                <img
                  src={caseStudy.testimonial.avatar}
                  alt={`${caseStudy.testimonial.author} avatar`}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <div className="text-xs">
                <div className="text-gray-300 font-medium">
                  {caseStudy.testimonial.author}
                </div>
                <div className="text-gray-500">
                  {caseStudy.testimonial.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {caseStudy.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {caseStudy.tags.slice(0, isCompact ? 2 : 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {caseStudy.tags.length > (isCompact ? 2 : 4) && (
              <span className="px-2 py-1 bg-gray-700/30 text-gray-500 text-xs rounded-full">
                +{caseStudy.tags.length - (isCompact ? 2 : 4)} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
          <div className="text-xs text-gray-500">
            Duration: {caseStudy.duration}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 p-0 h-auto font-medium"
            aria-label={`View full case study for ${caseStudy.company}`}
          >
            View Details →
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}

export default CaseStudyCard
