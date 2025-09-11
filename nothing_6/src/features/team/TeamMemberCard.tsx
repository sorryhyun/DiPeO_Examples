// filepath: src/features/team/TeamMemberCard.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState } from 'react'
import { User } from '@/core/contracts'
import { config } from '@/app/config'
import Avatar from '@/shared/components/Avatar'
import GlassCard from '@/shared/components/GlassCard'

interface TeamMember extends User {
  title?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  expertise?: string[]
  avatarUrl?: string
  location?: string
}

interface TeamMemberCardProps {
  member: TeamMember
  className?: string
  onClick?: (member: TeamMember) => void
  showBio?: boolean
  compact?: boolean
}

const SOCIAL_ICONS = {
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  website: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  className = '',
  onClick,
  showBio = true,
  compact = false,
}) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    if (onClick) {
      onClick(member)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
  }

  const handleSocialClick = (url: string, platform: string) => {
    if (config.isDevelopment) {
      console.log(`Opening ${platform}: ${url}`)
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getAvatarSrc = () => {
    if (imageError) return undefined
    return member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`
  }

  const hasValidSocialLinks = member.socialLinks && Object.values(member.socialLinks).some(link => !!link)

  return (
    <GlassCard
      className={`team-member-card transition-all duration-300 hover:scale-105 ${compact ? 'p-4' : 'p-6'} ${
        onClick ? 'cursor-pointer focus:ring-2 focus:ring-blue-500' : ''
      } ${className}`}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={onClick ? `View ${member.displayName || member.email} profile` : undefined}
      onClick={onClick ? handleCardClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Avatar and Basic Info */}
      <div className={`flex ${compact ? 'flex-row items-center space-x-3' : 'flex-col items-center text-center'}`}>
        <div className={`relative ${compact ? 'flex-shrink-0' : 'mb-4'}`}>
          <Avatar
            src={getAvatarSrc()}
            alt={member.displayName || member.email}
            size={compact ? 'md' : 'lg'}
            fallback={member.displayName?.[0] || member.email[0]}
            onError={handleImageError}
            className="ring-2 ring-white/20"
          />
          {member.role === 'admin' && (
            <div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center"
              title="Admin"
              aria-label="Admin user"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>

        <div className={`${compact ? 'flex-1 min-w-0' : 'w-full'}`}>
          <h3 className={`font-semibold text-neutral-900 dark:text-neutral-100 ${compact ? 'text-sm truncate' : 'text-lg'}`}>
            {member.displayName || member.email.split('@')[0]}
          </h3>
          
          {member.title && (
            <p className={`text-neutral-600 dark:text-neutral-400 ${compact ? 'text-xs truncate' : 'text-sm mt-1'}`}>
              {member.title}
            </p>
          )}
          
          {member.location && !compact && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 flex items-center justify-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {member.location}
            </p>
          )}
        </div>
      </div>

      {/* Bio Section */}
      {showBio && member.bio && !compact && (
        <div className="mt-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {member.bio}
          </p>
        </div>
      )}

      {/* Expertise Tags */}
      {member.expertise && member.expertise.length > 0 && !compact && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {member.expertise.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {member.expertise.length > 4 && (
              <span
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-full"
                title={`And ${member.expertise.length - 4} more: ${member.expertise.slice(4).join(', ')}`}
              >
                +{member.expertise.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasValidSocialLinks && (
        <div className={`flex justify-center space-x-3 ${compact ? 'mt-2' : 'mt-6'}`}>
          {Object.entries(member.socialLinks || {}).map(([platform, url]) => {
            if (!url) return null
            
            const icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS]
            if (!icon) return null

            return (
              <button
                key={platform}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSocialClick(url, platform)
                }}
                className={`p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 transition-all duration-200 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
                title={`Visit ${member.displayName || member.email}'s ${platform}`}
                aria-label={`Visit ${platform} profile`}
              >
                {icon}
              </button>
            )
          })}
        </div>
      )}

      {/* Hover overlay for interactive cards */}
      {onClick && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg pointer-events-none" />
      )}
    </GlassCard>
  )
}

export default TeamMemberCard
