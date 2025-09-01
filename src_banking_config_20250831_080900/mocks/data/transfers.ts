import type { Transfer, ID } from '@/core/contracts'
import { accountsData } from './accounts'

// Helper function to generate realistic transfer IDs
function generateTransferId(): ID {
  return `trf_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to get random account ID from available accounts
function getRandomAccountId(excludeId?: ID): ID {
  const availableAccounts = accountsData.filter(acc => acc.id !== excludeId)
  return availableAccounts[Math.floor(Math.random() * availableAccounts.length)].id
}

// Helper function to generate realistic transfer amounts
function generateTransferAmount(): number {
  const amounts = [25, 50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

// Helper function to generate realistic descriptions
function generateTransferDescription(): string {
  const descriptions = [
    'Monthly allowance',
    'Shared dinner bill',
    'Rent payment',
    'Emergency fund transfer',
    'Investment contribution',
    'Loan repayment',
    'Birthday gift',
    'Vacation fund',
    'Car repair fund',
    'Grocery money',
    'Utility bill split',
    'Medical expenses',
    'Home improvement',
    'Education fund',
    'Savings transfer'
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Helper function to generate dates in the past 30 days
function generateRecentDate(daysAgo: number = 30): string {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Helper function to generate processed date after created date
function generateProcessedDate(createdAt: string, status: Transfer['status']): string | undefined {
  if (status === 'pending' || status === 'processing') {
    return undefined
  }
  
  const createdDate = new Date(createdAt)
  const processedDate = new Date(createdDate)
  
  // Add 1-60 minutes for processing time
  processedDate.setMinutes(processedDate.getMinutes() + Math.floor(Math.random() * 60) + 1)
  
  return processedDate.toISOString()
}

// Helper function to generate failure reasons for failed transfers
function generateFailureReason(): string {
  const reasons = [
    'Insufficient funds',
    'Account temporarily restricted',
    'Invalid recipient account',
    'Daily transfer limit exceeded',
    'Security hold - manual review required',
    'Network timeout - please retry',
    'Recipient account closed',
    'Currency conversion failed'
  ]
  return reasons[Math.floor(Math.random() * reasons.length)]
}

// Generate mock transfers data
export const transfersData: Transfer[] = [
  // Completed transfers (most common)
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id, // Checking account
    toAccountId: accountsData[1].id,   // Savings account
    amount: 500.00,
    currency: 'USD',
    description: 'Monthly savings transfer',
    status: 'completed',
    createdAt: generateRecentDate(7),
    processedAt: generateProcessedDate(generateRecentDate(7), 'completed')
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[1].id, // Savings account
    toAccountId: accountsData[0].id,   // Checking account
    amount: 1200.00,
    currency: 'USD',
    description: 'Emergency fund withdrawal',
    status: 'completed',
    createdAt: generateRecentDate(3),
    processedAt: generateProcessedDate(generateRecentDate(3), 'completed')
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: getRandomAccountId(accountsData[0].id),
    amount: 75.00,
    currency: 'USD',
    description: 'Shared dinner expense',
    status: 'completed',
    createdAt: generateRecentDate(1),
    processedAt: generateProcessedDate(generateRecentDate(1), 'completed')
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[1].id,
    toAccountId: accountsData[2].id, // Investment account
    amount: 2000.00,
    currency: 'USD',
    description: 'Investment contribution',
    status: 'completed',
    createdAt: generateRecentDate(14),
    processedAt: generateProcessedDate(generateRecentDate(14), 'completed')
  },
  
  // Pending transfers
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: accountsData[1].id,
    amount: 300.00,
    currency: 'USD',
    description: 'Weekly savings',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    processedAt: undefined
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[1].id,
    toAccountId: getRandomAccountId(accountsData[1].id),
    amount: 150.00,
    currency: 'USD',
    description: 'Rent payment',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    processedAt: undefined
  },
  
  // Processing transfers
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: getRandomAccountId(accountsData[0].id),
    amount: 750.00,
    currency: 'USD',
    description: 'Medical expenses',
    status: 'processing',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    processedAt: undefined
  },
  
  // Failed transfers
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: getRandomAccountId(accountsData[0].id),
    amount: 5000.00,
    currency: 'USD',
    description: 'Large transfer attempt',
    status: 'failed',
    createdAt: generateRecentDate(2),
    processedAt: generateProcessedDate(generateRecentDate(2), 'failed'),
    failureReason: generateFailureReason()
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[1].id,
    toAccountId: 'acc_invalid123',
    amount: 100.00,
    currency: 'USD',
    description: 'Test transfer to invalid account',
    status: 'failed',
    createdAt: generateRecentDate(1),
    processedAt: generateProcessedDate(generateRecentDate(1), 'failed'),
    failureReason: 'Invalid recipient account'
  },
  
  // Cancelled transfers
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: accountsData[1].id,
    amount: 200.00,
    currency: 'USD',
    description: 'Cancelled by user',
    status: 'cancelled',
    createdAt: generateRecentDate(5),
    processedAt: generateProcessedDate(generateRecentDate(5), 'cancelled')
  },
  
  // More realistic transfer patterns
  ...Array.from({ length: 15 }, () => {
    const fromAccountId = getRandomAccountId()
    const toAccountId = getRandomAccountId(fromAccountId)
    const amount = generateTransferAmount()
    const description = generateTransferDescription()
    const createdAt = generateRecentDate(30)
    
    // 70% completed, 15% pending, 10% failed, 5% cancelled
    const statusRandom = Math.random()
    let status: Transfer['status']
    if (statusRandom < 0.70) {
      status = 'completed'
    } else if (statusRandom < 0.85) {
      status = 'pending'
    } else if (statusRandom < 0.95) {
      status = 'failed'
    } else {
      status = 'cancelled'
    }
    
    return {
      id: generateTransferId(),
      fromAccountId,
      toAccountId,
      amount,
      currency: 'USD',
      description,
      status,
      createdAt,
      processedAt: generateProcessedDate(createdAt, status),
      failureReason: status === 'failed' ? generateFailureReason() : undefined,
      scheduledAt: status === 'pending' && Math.random() > 0.5 
        ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Within 7 days
        : undefined
    }
  }),
  
  // Scheduled future transfers for testing
  {
    id: generateTransferId(),
    fromAccountId: accountsData[0].id,
    toAccountId: accountsData[1].id,
    amount: 500.00,
    currency: 'USD',
    description: 'Automatic monthly savings',
    status: 'pending',
    createdAt: new Date().toISOString(),
    scheduledAt: (() => {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(1) // First day of next month
      return nextMonth.toISOString()
    })(),
    processedAt: undefined
  },
  {
    id: generateTransferId(),
    fromAccountId: accountsData[1].id,
    toAccountId: accountsData[2].id,
    amount: 1000.00,
    currency: 'USD',
    description: 'Quarterly investment contribution',
    status: 'pending',
    createdAt: new Date().toISOString(),
    scheduledAt: (() => {
      const nextQuarter = new Date()
      nextQuarter.setMonth(nextQuarter.getMonth() + 3)
      nextQuarter.setDate(15) // 15th of the quarter
      return nextQuarter.toISOString()
    })(),
    processedAt: undefined
  }
]

// Helper functions for status progression simulation
export function getTransfersByStatus(status: Transfer['status']): Transfer[] {
  return transfersData.filter(transfer => transfer.status === status)
}

export function getTransfersByAccountId(accountId: ID): Transfer[] {
  return transfersData.filter(
    transfer => transfer.fromAccountId === accountId || transfer.toAccountId === accountId
  )
}

export function getRecentTransfers(days: number = 7): Transfer[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return transfersData.filter(
    transfer => new Date(transfer.createdAt) >= cutoffDate
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPendingTransfersReadyForProcessing(): Transfer[] {
  const now = new Date()
  return transfersData.filter(
    transfer => 
      transfer.status === 'pending' && 
      (!transfer.scheduledAt || new Date(transfer.scheduledAt) <= now)
  )
}

// Simulate status progression (useful for real-time updates in mock WebSocket)
export function simulateTransferStatusProgression(transferId: ID): Transfer | null {
  const transfer = transfersData.find(t => t.id === transferId)
  if (!transfer) return null
  
  // Clone to avoid mutation
  const updatedTransfer = { ...transfer }
  
  switch (transfer.status) {
    case 'pending':
      // 80% chance to move to processing, 20% chance to fail
      if (Math.random() < 0.8) {
        updatedTransfer.status = 'processing'
      } else {
        updatedTransfer.status = 'failed'
        updatedTransfer.failureReason = generateFailureReason()
        updatedTransfer.processedAt = new Date().toISOString()
      }
      break
      
    case 'processing':
      // 90% chance to complete, 10% chance to fail
      if (Math.random() < 0.9) {
        updatedTransfer.status = 'completed'
      } else {
        updatedTransfer.status = 'failed'
        updatedTransfer.failureReason = generateFailureReason()
      }
      updatedTransfer.processedAt = new Date().toISOString()
      break
      
    default:
      // No progression for completed, failed, or cancelled transfers
      return transfer
  }
  
  // Update the original data array
  const index = transfersData.findIndex(t => t.id === transferId)
  if (index !== -1) {
    transfersData[index] = updatedTransfer
  }
  
  return updatedTransfer
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure data module
- [x] Reads config from `@/app/config` - not applicable for mock data
- [x] Exports default named component - exports transfersData and helper functions
- [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for data module
*/
