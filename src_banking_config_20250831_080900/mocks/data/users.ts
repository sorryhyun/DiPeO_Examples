import { getMockUsers } from '@/app/config'
import type { User, UserRole, LoginRequest } from '@/core/contracts'

// Extended user data with password for authentication
interface MockUserWithPassword extends User {
  password: string
}

// Convert config mock users to full User objects with IDs and metadata
export const mockUsers: MockUserWithPassword[] = getMockUsers().map((configUser, index) => ({
  id: `user-${index + 1}`,
  email: configUser.email,
  fullName: getMockFullName(configUser.email, configUser.role),
  avatarUrl: getMockAvatarUrl(configUser.email),
  roles: [configUser.role],
  createdAt: getMockCreatedAt(index),
  password: configUser.password,
  metadata: {
    lastLoginAt: getMockLastLogin(index),
    loginCount: getMockLoginCount(configUser.role),
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: configUser.role === 'premium',
        sms: configUser.role !== 'standard'
      }
    },
    accountTier: configUser.role,
    twoFactorEnabled: configUser.role === 'premium' || configUser.role === 'business'
  }
}))

// Additional mock users for testing various scenarios
export const additionalMockUsers: MockUserWithPassword[] = [
  {
    id: 'user-admin',
    email: 'admin@bank.com',
    fullName: 'System Administrator',
    avatarUrl: getGravatarUrl('admin@bank.com'),
    roles: ['admin'],
    createdAt: '2023-01-01T00:00:00Z',
    password: 'admin123',
    metadata: {
      lastLoginAt: new Date().toISOString(),
      loginCount: 500,
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: { email: true, push: true, sms: true }
      },
      accountTier: 'admin',
      twoFactorEnabled: true
    }
  },
  {
    id: 'user-guest',
    email: 'guest@example.com',
    fullName: 'Guest User',
    avatarUrl: getGravatarUrl('guest@example.com'),
    roles: ['guest'],
    createdAt: '2024-01-01T00:00:00Z',
    password: 'guest123',
    metadata: {
      lastLoginAt: null,
      loginCount: 0,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: { email: false, push: false, sms: false }
      },
      accountTier: 'guest',
      twoFactorEnabled: false
    }
  }
]

// All mock users combined
export const allMockUsers: MockUserWithPassword[] = [
  ...mockUsers,
  ...additionalMockUsers
]

/**
 * Find a user by email address
 */
export function findUserByEmail(email: string): MockUserWithPassword | undefined {
  return allMockUsers.find(user => 
    user.email.toLowerCase() === email.toLowerCase()
  )
}

/**
 * Validate login credentials against mock users
 */
export function validateCredentials(request: LoginRequest): {
  success: boolean
  user?: User
  error?: string
} {
  const { email, password } = request
  
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required'
    }
  }

  const user = findUserByEmail(email)
  
  if (!user) {
    return {
      success: false,
      error: 'User not found'
    }
  }

  if (user.password !== password) {
    return {
      success: false,
      error: 'Invalid password'
    }
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user
  
  return {
    success: true,
    user: userWithoutPassword
  }
}

/**
 * Get all available mock users (without passwords)
 */
export function getAllUsers(): User[] {
  return allMockUsers.map(({ password, ...user }) => user)
}

/**
 * Get user by ID
 */
export function findUserById(id: string): User | undefined {
  const user = allMockUsers.find(u => u.id === id)
  if (user) {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return undefined
}

/**
 * Get users by role
 */
export function getUsersByRole(role: UserRole): User[] {
  return allMockUsers
    .filter(user => user.roles.includes(role))
    .map(({ password, ...user }) => user)
}

// Helper functions for generating mock data

function getMockFullName(email: string, role: UserRole): string {
  const emailPrefix = email.split('@')[0]
  const roleNames = {
    premium: 'Premium',
    standard: 'Standard',
    business: 'Business',
    admin: 'Admin',
    guest: 'Guest'
  }
  
  return `${capitalizeFirst(emailPrefix)} ${roleNames[role]} User`
}

function getMockAvatarUrl(email: string): string {
  return getGravatarUrl(email)
}

function getGravatarUrl(email: string): string {
  // Generate a simple hash-based avatar URL
  const hash = simpleHash(email.toLowerCase())
  return `https://api.dicebear.com/7.x/initials/svg?seed=${hash}&backgroundColor=random`
}

function getMockCreatedAt(index: number): string {
  const baseDate = new Date('2023-06-01')
  baseDate.setDate(baseDate.getDate() + index * 30) // Spread users over time
  return baseDate.toISOString()
}

function getMockLastLogin(index: number): string {
  const now = new Date()
  now.setHours(now.getHours() - (index + 1) * 2) // Recent but staggered logins
  return now.toISOString()
}

function getMockLoginCount(role: UserRole): number {
  const baseCounts = {
    guest: 1,
    standard: 25,
    premium: 150,
    business: 75,
    admin: 300
  }
  
  return baseCounts[role] + Math.floor(Math.random() * 50)
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}
