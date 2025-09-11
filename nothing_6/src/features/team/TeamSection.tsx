// filepath: src/features/team/TeamSection.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, useEffect } from 'react'
import { User } from '@/core/contracts'
import { config, shouldUseMockData } from '@/app/config'
import { eventBus } from '@/core/events'
import TeamMemberCard from './TeamMemberCard'
import { nothingService } from '@/services/nothingService'

interface TeamMember extends User {
  title: string
  expertise: string[]
  yearsOfNothing: number
  avatar?: string
  bio?: string
  favoriteVoid?: string
}

interface TeamSectionProps {
  className?: string
  maxMembers?: number
  showBio?: boolean
}

const MOCK_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    email: 'ceo@nothing.void',
    displayName: 'Alex Void',
    role: 'admin',
    title: 'Chief Nothing Officer',
    expertise: ['Strategic Nothingness', 'Void Leadership', 'Emptiness Innovation'],
    yearsOfNothing: 15,
    createdAt: new Date().toISOString(),
    bio: 'Pioneer in the field of professional nothingness with over 15 years of delivering absolutely nothing.',
    favoriteVoid: 'The Original Void™'
  },
  {
    id: 'tm-2',
    email: 'cto@nothing.void',
    displayName: 'Sam Null',
    role: 'admin',
    title: 'Chief Technology Nothing',
    expertise: ['Null Architecture', 'Void Engineering', 'Nothing Scaling'],
    yearsOfNothing: 12,
    createdAt: new Date().toISOString(),
    bio: 'Expert in building scalable nothing systems that handle millions of empty requests.',
    favoriteVoid: 'Database NULL'
  },
  {
    id: 'tm-3',
    email: 'design@nothing.void',
    displayName: 'Jordan Empty',
    role: 'premium_nothing',
    title: 'Senior Nothing Designer',
    expertise: ['Visual Void', 'UX Nothing', 'Aesthetic Emptiness'],
    yearsOfNothing: 8,
    createdAt: new Date().toISOString(),
    bio: 'Designs beautiful interfaces for displaying nothing with perfect user experience.',
    favoriteVoid: 'White Space'
  },
  {
    id: 'tm-4',
    email: 'research@nothing.void',
    displayName: 'Dr. Riley Blank',
    role: 'premium_nothing',
    title: 'Nothing Research Lead',
    expertise: ['Quantum Nothing', 'Void Physics', 'Nothing Theory'],
    yearsOfNothing: 20,
    createdAt: new Date().toISOString(),
    bio: 'PhD in Theoretical Nothingness from the University of Void Sciences.',
    favoriteVoid: 'Quantum Vacuum'
  }
]

export default function TeamSection({ className = '', maxMembers = 4, showBio = true }: TeamSectionProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    const loadTeam = async () => {
      try {
        setLoading(true)
        setError(null)

        let teamData: TeamMember[]
        
        if (shouldUseMockData) {
          // Use mock data in development
          await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
          teamData = MOCK_TEAM
        } else {
          // Fetch from real API (using nothingService as fallback)
          const response = await nothingService.getTeamMembers()
          if (response.ok && response.data) {
            teamData = response.data as TeamMember[]
          } else {
            throw new Error(response.error?.message || 'Failed to load team')
          }
        }

        if (mounted) {
          const limitedTeam = maxMembers ? teamData.slice(0, maxMembers) : teamData
          setTeam(limitedTeam)
          eventBus.emit('analytics:event', {
            name: 'team_section_loaded',
            properties: { teamSize: limitedTeam.length }
          })
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Unknown error loading team'
          setError(message)
          eventBus.emit('analytics:event', {
            name: 'team_section_error',
            properties: { error: message }
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTeam()
    
    return () => {
      mounted = false
    }
  }, [maxMembers])

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(current => current === memberId ? null : memberId)
    eventBus.emit('analytics:event', {
      name: 'team_member_selected',
      properties: { memberId, action: selectedMember === memberId ? 'deselect' : 'select' }
    })
  }

  const handleKeyboardNavigation = (event: React.KeyboardEvent, memberId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleMemberSelect(memberId)
    }
  }

  if (loading) {
    return (
      <section 
        className={`py-16 px-4 ${className}`}
        aria-label="Team section loading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto max-w-md mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto max-w-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: maxMembers }, (_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section 
        className={`py-16 px-4 ${className}`}
        aria-label="Team section error"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-600">Unable to Load Team</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section 
      className={`py-16 px-4 ${className}`}
      aria-labelledby="team-heading"
      role="region"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 
            id="team-heading"
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            Meet Our Nothing Experts
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our world-class team of nothing specialists brings decades of experience 
            in delivering absolutely nothing with unmatched expertise.
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          role="grid"
          aria-label="Team members"
        >
          {team.map((member, index) => (
            <div
              key={member.id}
              role="gridcell"
              tabIndex={0}
              onClick={() => handleMemberSelect(member.id)}
              onKeyDown={(e) => handleKeyboardNavigation(e, member.id)}
              className={`transform transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg ${
                selectedMember === member.id ? 'scale-105 ring-2 ring-blue-500' : ''
              }`}
              aria-expanded={selectedMember === member.id}
              aria-describedby={showBio ? `bio-${member.id}` : undefined}
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <TeamMemberCard
                member={member}
                isSelected={selectedMember === member.id}
                showBio={showBio}
                onClick={() => handleMemberSelect(member.id)}
              />
              
              {showBio && selectedMember === member.id && member.bio && (
                <div
                  id={`bio-${member.id}`}
                  className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in"
                  role="region"
                  aria-label={`${member.displayName} biography`}
                >
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                  {member.favoriteVoid && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Favorite Void: <strong>{member.favoriteVoid}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {team.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No team members found. Even our team is nothing!
            </p>
          </div>
        )}

        {config.isDevelopment && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Dev Mode:</strong> Using {shouldUseMockData ? 'mock' : 'real'} team data. 
              Team size: {team.length}/{maxMembers || 'unlimited'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export type { TeamMember }
