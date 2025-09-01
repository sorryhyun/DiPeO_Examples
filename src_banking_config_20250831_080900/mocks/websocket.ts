import type { Transaction, User, WebSocketMessage, WebSocketEventType } from '@/core/contracts'
import { shouldUseMockData, appConfig } from '@/app/config'
import { defaultEventBus } from '@/core/events'
import { transactionsData } from './data/transactions'
import { allMockUsers } from './data/users'

// WebSocket connection state
interface MockWebSocketConnection {
  id: string
  userId?: string
  isConnected: boolean
  lastActivity: number
}

// Mock WebSocket server state
interface MockWebSocketServer {
  connections: Map<string, MockWebSocketConnection>
  intervalId: NodeJS.Timeout | null
  isRunning: boolean
  messageQueue: WebSocketMessage[]
}

// Global server instance
let mockServer: MockWebSocketServer = {
  connections: new Map(),
  intervalId: null,
  isRunning: false,
  messageQueue: []
}

/**
 * Generate a unique connection ID
 */
function generateConnectionId(): string {
  return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get a random user for message generation
 */
function getRandomUser(): User {
  return allMockUsers[Math.floor(Math.random() * allMockUsers.length)]
}

/**
 * Generate a mock transaction event
 */
function generateTransactionEvent(userId?: string): WebSocketMessage {
  const user = userId ? allMockUsers.find(u => u.id === userId) : getRandomUser()
  const targetUserId = user?.id || getRandomUser().id
  
  // Get user's transactions or use a random one
  const userTransactions = transactionsData.filter(t => t.userId === targetUserId)
  const randomTransaction = userTransactions.length > 0 
    ? userTransactions[Math.floor(Math.random() * userTransactions.length)]
    : transactionsData[Math.floor(Math.random() * transactionsData.length)]

  // Create a new transaction event based on existing transaction
  const eventTypes: Array<'transaction.created' | 'transaction.updated' | 'transaction.pending'> = [
    'transaction.created',
    'transaction.updated', 
    'transaction.pending'
  ]
  
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  
  const transaction: Transaction = {
    ...randomTransaction,
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId: targetUserId,
    status: eventType === 'transaction.pending' ? 'pending' : 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return {
    type: eventType,
    data: transaction,
    timestamp: new Date().toISOString(),
    userId: targetUserId
  }
}

/**
 * Generate a mock account balance update event
 */
function generateBalanceUpdateEvent(userId?: string): WebSocketMessage {
  const user = userId ? allMockUsers.find(u => u.id === userId) : getRandomUser()
  const targetUserId = user?.id || getRandomUser().id
  
  // Generate random balance change
  const change = (Math.random() - 0.5) * 1000 // -500 to +500
  const accountId = `acc_${targetUserId}_${Math.floor(Math.random() * 3) + 1}`
  
  return {
    type: 'account.balance_updated',
    data: {
      accountId,
      userId: targetUserId,
      previousBalance: Math.random() * 10000,
      newBalance: Math.random() * 10000 + change,
      change,
      currency: 'USD'
    },
    timestamp: new Date().toISOString(),
    userId: targetUserId
  }
}

/**
 * Generate a mock message event
 */
function generateMessageEvent(userId?: string): WebSocketMessage {
  const user = userId ? allMockUsers.find(u => u.id === userId) : getRandomUser()
  const targetUserId = user?.id || getRandomUser().id
  
  const messageTypes = ['security', 'promotion', 'account', 'transaction']
  const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
  
  const messages = {
    security: [
      'Your account has been accessed from a new device',
      'Security alert: Failed login attempt detected',
      'Two-factor authentication has been enabled'
    ],
    promotion: [
      'New investment opportunity available!',
      'Limited time: 0% APR balance transfer',
      'Upgrade to Premium for exclusive benefits'
    ],
    account: [
      'Your monthly statement is ready',
      'Account maintenance scheduled for tonight',
      'New feature: Mobile check deposit now available'
    ],
    transaction: [
      'Large transaction requires verification',
      'Payment scheduled successfully',
      'Recurring payment updated'
    ]
  }
  
  const messageContent = messages[messageType as keyof typeof messages]
  const content = messageContent[Math.floor(Math.random() * messageContent.length)]
  
  return {
    type: 'message.received',
    data: {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: targetUserId,
      title: `${messageType.charAt(0).toUpperCase() + messageType.slice(1)} Alert`,
      content,
      category: messageType,
      priority: messageType === 'security' ? 'high' : 'normal',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    userId: targetUserId
  }
}

/**
 * Generate a mock transfer status event
 */
function generateTransferEvent(userId?: string): WebSocketMessage {
  const user = userId ? allMockUsers.find(u => u.id === userId) : getRandomUser()
  const targetUserId = user?.id || getRandomUser().id
  
  const statuses = ['initiated', 'processing', 'completed', 'failed']
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  return {
    type: 'transfer.status_updated',
    data: {
      transferId: `xfer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: targetUserId,
      status,
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: 'USD',
      fromAccount: 'Primary Checking',
      toAccount: 'Savings Account',
      updatedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    userId: targetUserId
  }
}

/**
 * Generate random WebSocket events
 */
function generateRandomEvent(userId?: string): WebSocketMessage {
  const eventGenerators = [
    generateTransactionEvent,
    generateBalanceUpdateEvent,
    generateMessageEvent,
    generateTransferEvent
  ]
  
  const generator = eventGenerators[Math.floor(Math.random() * eventGenerators.length)]
  return generator(userId)
}

/**
 * Broadcast message to relevant connections
 */
function broadcastMessage(message: WebSocketMessage): void {
  const targetConnections = Array.from(mockServer.connections.values()).filter(conn => {
    // Send to user-specific connections if message has userId
    if (message.userId) {
      return conn.userId === message.userId && conn.isConnected
    }
    // Send to all connected clients for system-wide events
    return conn.isConnected
  })

  if (targetConnections.length > 0) {
    // Emit via event bus for components to receive
    defaultEventBus.emit('websocket.messageReceived', {
      data: message,
      timestamp: new Date().toISOString()
    })

    // Also emit the specific event type
    if (message.type === 'transaction.created') {
      defaultEventBus.emit('transaction.created', {
        transactionId: message.data.id,
        payload: message.data
      })
    } else if (message.type === 'transaction.updated') {
      defaultEventBus.emit('transaction.updated', {
        transactionId: message.data.id,
        changes: message.data
      })
    } else if (message.type === 'message.received') {
      defaultEventBus.emit('message.received', {
        messageId: message.data.id,
        fromUserId: message.data.userId,
        content: message.data.content,
        timestamp: message.timestamp
      })
    } else if (message.type === 'transfer.status_updated') {
      defaultEventBus.emit('transfer.updated', {
        transferId: message.data.transferId,
        status: message.data.status,
        payload: message.data
      })
    } else if (message.type === 'account.balance_updated') {
      defaultEventBus.emit('account.balance.changed', {
        accountId: message.data.accountId,
        oldBalance: message.data.previousBalance,
        newBalance: message.data.newBalance
      })
    }
  }
}

/**
 * Process queued messages
 */
function processMessageQueue(): void {
  while (mockServer.messageQueue.length > 0) {
    const message = mockServer.messageQueue.shift()
    if (message) {
      broadcastMessage(message)
    }
  }
}

/**
 * Main event generation loop
 */
function runEventLoop(): void {
  if (!mockServer.isRunning) return

  try {
    // Clean up inactive connections
    const now = Date.now()
    const staleConnections = Array.from(mockServer.connections.entries()).filter(
      ([_, conn]) => now - conn.lastActivity > appConfig.websocket.connectionTimeout
    )
    
    staleConnections.forEach(([id]) => {
      mockServer.connections.delete(id)
    })

    // Generate random events based on configuration
    if (Math.random() < appConfig.websocket.eventFrequency) {
      // Generate event for random user or specific user
      const randomUser = Math.random() < 0.7 ? getRandomUser() : undefined
      const event = generateRandomEvent(randomUser?.id)
      
      // Add to queue for processing
      mockServer.messageQueue.push(event)
    }

    // Process message queue
    processMessageQueue()

    // Emit heartbeat for debugging
    if (mockServer.connections.size > 0) {
      defaultEventBus.emit('websocket.connected', {
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('MockWebSocket event loop error:', error)
    
    defaultEventBus.emit('websocket.error', {
      error: error as Error,
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Start the mock WebSocket server
 */
export function startMockWebSocket(): void {
  if (!shouldUseMockData()) {
    console.log('MockWebSocket: Skipping start (mock data disabled)')
    return
  }

  if (mockServer.isRunning) {
    console.warn('MockWebSocket: Already running')
    return
  }

  console.log('MockWebSocket: Starting mock WebSocket server...')
  
  mockServer.isRunning = true
  mockServer.connections.clear()
  mockServer.messageQueue = []

  // Start event generation loop
  mockServer.intervalId = setInterval(runEventLoop, appConfig.websocket.heartbeatInterval)

  // Simulate initial connections
  for (let i = 0; i < 3; i++) {
    const user = allMockUsers[i] || getRandomUser()
    const connectionId = generateConnectionId()
    
    mockServer.connections.set(connectionId, {
      id: connectionId,
      userId: user.id,
      isConnected: true,
      lastActivity: Date.now()
    })
  }

  defaultEventBus.emit('websocket.connected', {
    timestamp: new Date().toISOString()
  })

  console.log(`MockWebSocket: Started with ${mockServer.connections.size} initial connections`)
}

/**
 * Stop the mock WebSocket server
 */
export function stopMockWebSocket(): void {
  if (!mockServer.isRunning) {
    return
  }

  console.log('MockWebSocket: Stopping mock WebSocket server...')
  
  mockServer.isRunning = false
  
  if (mockServer.intervalId) {
    clearInterval(mockServer.intervalId)
    mockServer.intervalId = null
  }

  // Close all connections
  mockServer.connections.clear()
  mockServer.messageQueue = []

  defaultEventBus.emit('websocket.disconnected', {
    timestamp: new Date().toISOString(),
    reason: 'Server stopped'
  })

  console.log('MockWebSocket: Stopped')
}

/**
 * Simulate a new client connection
 */
export function connectMockClient(userId?: string): string {
  if (!mockServer.isRunning) {
    throw new Error('MockWebSocket server is not running')
  }

  const connectionId = generateConnectionId()
  const connection: MockWebSocketConnection = {
    id: connectionId,
    userId,
    isConnected: true,
    lastActivity: Date.now()
  }

  mockServer.connections.set(connectionId, connection)

  return connectionId
}

/**
 * Simulate client disconnection
 */
export function disconnectMockClient(connectionId: string): void {
  const connection = mockServer.connections.get(connectionId)
  
  if (connection) {
    mockServer.connections.delete(connectionId)
    
    defaultEventBus.emit('websocket.disconnected', {
      timestamp: new Date().toISOString(),
      reason: 'Client disconnected'
    })
  }
}

/**
 * Send a custom message to specific user or all clients
 */
export function sendMockMessage(message: Omit<WebSocketMessage, 'timestamp'>, userId?: string): void {
  if (!mockServer.isRunning) {
    console.warn('MockWebSocket: Cannot send message, server not running')
    return
  }

  const fullMessage: WebSocketMessage = {
    ...message,
    timestamp: new Date().toISOString(),
    userId: userId || message.userId
  }

  mockServer.messageQueue.push(fullMessage)
}

/**
 * Get current server status
 */
export function getMockWebSocketStatus(): {
  isRunning: boolean
  connectionCount: number
  queueLength: number
  connections: Array<{ id: string; userId?: string; lastActivity: number }>
} {
  return {
    isRunning: mockServer.isRunning,
    connectionCount: mockServer.connections.size,
    queueLength: mockServer.messageQueue.length,
    connections: Array.from(mockServer.connections.values()).map(conn => ({
      id: conn.id,
      userId: conn.userId,
      lastActivity: conn.lastActivity
    }))
  }
}

// Auto-start in development mode if enabled
if (shouldUseMockData() && appConfig.websocket.autoStart) {
  // Start after a short delay to allow other systems to initialize
  setTimeout(() => {
    startMockWebSocket()
  }, 1000)
}
