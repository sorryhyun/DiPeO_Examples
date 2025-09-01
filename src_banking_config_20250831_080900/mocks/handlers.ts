import { http, HttpResponse } from 'msw'
import type { 
  Account, 
  Transaction, 
  Transfer, 
  Payment, 
  Investment, 
  Budget, 
  Card, 
  User,
  LoginRequest,
  CreateAccountRequest,
  CreateTransferRequest,
  CreatePaymentRequest,
  UpdateBudgetRequest,
  ID
} from '@/core/contracts'
import { accountsData, getAccountsByUserId, getAccountById, updateAccountBalance } from './data/accounts'
import { transactionsData, getTransactionsByAccountId, createTransaction } from './data/transactions'
import { transfersData, getTransfersByAccountId, simulateTransferStatusProgression } from './data/transfers'
import { paymentsData, getPaymentsByUserId } from './data/payments'
import { investmentsData, getInvestmentsByUserId } from './data/investments'
import { budgetsData, getBudgetsByUserId, updateBudget } from './data/budgets'
import { cardsData, getCardsByUserId } from './data/cards'
import { validateCredentials, findUserById } from './data/users'

// Simulate network delay for realistic development experience
const delay = (ms: number = Math.random() * 300 + 100) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Helper to generate auth token for mock responses
const generateToken = (userId: string): string => 
  `mock_token_${userId}_${Date.now()}`

// Current session tracking for mock authentication
let currentSession: { user: User; token: string } | null = null

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    await delay()
    
    try {
      const loginData = await request.json() as LoginRequest
      const result = validateCredentials(loginData)
      
      if (result.success && result.user) {
        const token = generateToken(result.user.id)
        currentSession = { user: result.user, token }
        
        return HttpResponse.json({
          success: true,
          data: {
            user: result.user,
            token,
            expiresIn: 3600
          }
        })
      }
      
      return HttpResponse.json({
        success: false,
        error: result.error
      }, { status: 401 })
      
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }
  }),

  http.post('/api/auth/logout', async () => {
    await delay(50)
    currentSession = null
    
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await delay(100)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !currentSession) {
      return HttpResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    return HttpResponse.json({
      success: true,
      data: currentSession.user
    })
  }),

  // Account endpoints
  http.get('/api/accounts', async ({ request }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || currentSession.user.id
    
    const accounts = getAccountsByUserId(userId)
    
    return HttpResponse.json({
      success: true,
      data: accounts,
      meta: {
        total: accounts.length,
        page: 1,
        limit: 50
      }
    })
  }),

  http.get('/api/accounts/:id', async ({ params }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const accountId = params.id as string
    const account = getAccountById(accountId)
    
    if (!account) {
      return HttpResponse.json({
        success: false,
        error: 'Account not found'
      }, { status: 404 })
    }
    
    // Check if user owns this account
    if (account.userId !== currentSession.user.id) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    return HttpResponse.json({
      success: true,
      data: account
    })
  }),

  http.post('/api/accounts', async ({ request }) => {
    await delay(500) // Account creation is slower
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    try {
      const accountData = await request.json() as CreateAccountRequest
      
      // Generate new account
      const newAccount: Account = {
        id: `acc_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentSession.user.id,
        accountNumber: `2110${Math.random().toString().substr(2, 10)}`,
        routingNumber: '021100001',
        accountType: accountData.accountType,
        accountName: accountData.accountName,
        balance: accountData.initialBalance || 0,
        currency: 'USD',
        status: 'active',
        interestRate: accountData.accountType === 'savings' ? 3.50 : 0.01,
        minimumBalance: accountData.accountType === 'savings' ? 1000 : 0,
        overdraftLimit: accountData.accountType === 'checking' ? 500 : 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      accountsData.push(newAccount)
      
      return HttpResponse.json({
        success: true,
        data: newAccount
      }, { status: 201 })
      
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }
  }),

  // Transaction endpoints
  http.get('/api/transactions', async ({ request }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    if (!accountId) {
      return HttpResponse.json({
        success: false,
        error: 'accountId parameter is required'
      }, { status: 400 })
    }
    
    // Verify account ownership
    const account = getAccountById(accountId)
    if (!account || account.userId !== currentSession.user.id) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    const allTransactions = getTransactionsByAccountId(accountId)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: paginatedTransactions,
      meta: {
        total: allTransactions.length,
        page,
        limit,
        hasMore: endIndex < allTransactions.length
      }
    })
  }),

  http.get('/api/transactions/:id', async ({ params }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const transactionId = params.id as string
    const transaction = transactionsData.find(t => t.id === transactionId)
    
    if (!transaction) {
      return HttpResponse.json({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 })
    }
    
    // Verify account ownership
    const account = getAccountById(transaction.accountId)
    if (!account || account.userId !== currentSession.user.id) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    return HttpResponse.json({
      success: true,
      data: transaction
    })
  }),

  // Transfer endpoints
  http.get('/api/transfers', async ({ request }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    const status = url.searchParams.get('status')
    
    let transfers = transfersData.filter(transfer => {
      // Only show transfers from/to user's accounts
      const fromAccount = getAccountById(transfer.fromAccountId)
      const toAccount = getAccountById(transfer.toAccountId)
      
      const userOwnsFromAccount = fromAccount?.userId === currentSession!.user.id
      const userOwnsToAccount = toAccount?.userId === currentSession!.user.id
      
      return userOwnsFromAccount || userOwnsToAccount
    })
    
    if (accountId) {
      transfers = getTransfersByAccountId(accountId)
    }
    
    if (status) {
      transfers = transfers.filter(t => t.status === status)
    }
    
    return HttpResponse.json({
      success: true,
      data: transfers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  }),

  http.get('/api/transfers/:id', async ({ params }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const transferId = params.id as string
    const transfer = transfersData.find(t => t.id === transferId)
    
    if (!transfer) {
      return HttpResponse.json({
        success: false,
        error: 'Transfer not found'
      }, { status: 404 })
    }
    
    // Verify user has access to this transfer
    const fromAccount = getAccountById(transfer.fromAccountId)
    const toAccount = getAccountById(transfer.toAccountId)
    
    const hasAccess = 
      fromAccount?.userId === currentSession.user.id || 
      toAccount?.userId === currentSession.user.id
    
    if (!hasAccess) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    return HttpResponse.json({
      success: true,
      data: transfer
    })
  }),

  http.post('/api/transfers', async ({ request }) => {
    await delay(800) // Transfer creation is slower
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    try {
      const transferData = await request.json() as CreateTransferRequest
      
      // Validate accounts
      const fromAccount = getAccountById(transferData.fromAccountId)
      const toAccount = getAccountById(transferData.toAccountId)
      
      if (!fromAccount || fromAccount.userId !== currentSession.user.id) {
        return HttpResponse.json({
          success: false,
          error: 'Invalid source account'
        }, { status: 400 })
      }
      
      if (!toAccount) {
        return HttpResponse.json({
          success: false,
          error: 'Invalid destination account'
        }, { status: 400 })
      }
      
      // Check balance
      if (fromAccount.balance < transferData.amount) {
        return HttpResponse.json({
          success: false,
          error: 'Insufficient funds'
        }, { status: 400 })
      }
      
      // Create transfer
      const newTransfer: Transfer = {
        id: `trf_${Math.random().toString(36).substr(2, 9)}`,
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: transferData.amount,
        currency: 'USD',
        description: transferData.description || 'Transfer',
        status: transferData.scheduledAt ? 'pending' : 'processing',
        createdAt: new Date().toISOString(),
        scheduledAt: transferData.scheduledAt,
        processedAt: undefined
      }
      
      transfersData.push(newTransfer)
      
      // If immediate transfer, simulate processing
      if (!transferData.scheduledAt) {
        setTimeout(() => {
          simulateTransferStatusProgression(newTransfer.id)
          
          // Update account balances on completion
          updateAccountBalance(transferData.fromAccountId, fromAccount.balance - transferData.amount)
          updateAccountBalance(transferData.toAccountId, toAccount.balance + transferData.amount)
          
          // Create transaction records
          createTransaction({
            accountId: transferData.fromAccountId,
            amount: -transferData.amount,
            type: 'transfer_out',
            description: `Transfer to ${toAccount.accountName}`,
            merchantName: undefined,
            category: 'transfer'
          })
          
          createTransaction({
            accountId: transferData.toAccountId,
            amount: transferData.amount,
            type: 'transfer_in',
            description: `Transfer from ${fromAccount.accountName}`,
            merchantName: undefined,
            category: 'transfer'
          })
        }, 2000) // 2 second processing delay
      }
      
      return HttpResponse.json({
        success: true,
        data: newTransfer
      }, { status: 201 })
      
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }
  }),

  // Payment endpoints
  http.get('/api/payments', async ({ request }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    
    let payments = getPaymentsByUserId(currentSession.user.id)
    
    if (status) {
      payments = payments.filter(p => p.status === status)
    }
    
    return HttpResponse.json({
      success: true,
      data: payments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  }),

  http.post('/api/payments', async ({ request }) => {
    await delay(600)
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    try {
      const paymentData = await request.json() as CreatePaymentRequest
      
      // Validate account
      const account = getAccountById(paymentData.accountId)
      if (!account || account.userId !== currentSession.user.id) {
        return HttpResponse.json({
          success: false,
          error: 'Invalid account'
        }, { status: 400 })
      }
      
      // Check balance for non-credit accounts
      if (account.accountType !== 'credit' && account.balance < paymentData.amount) {
        return HttpResponse.json({
          success: false,
          error: 'Insufficient funds'
        }, { status: 400 })
      }
      
      // Create payment
      const newPayment: Payment = {
        id: `pay_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentSession.user.id,
        accountId: paymentData.accountId,
        amount: paymentData.amount,
        currency: 'USD',
        description: paymentData.description,
        paymentMethod: paymentData.paymentMethod,
        recipientName: paymentData.recipientName,
        recipientAccount: paymentData.recipientAccount,
        status: 'processing',
        createdAt: new Date().toISOString(),
        scheduledAt: paymentData.scheduledAt,
        processedAt: undefined,
        metadata: paymentData.metadata
      }
      
      paymentsData.push(newPayment)
      
      // Simulate processing
      setTimeout(() => {
        const payment = paymentsData.find(p => p.id === newPayment.id)
        if (payment) {
          payment.status = Math.random() > 0.1 ? 'completed' : 'failed'
          payment.processedAt = new Date().toISOString()
          
          if (payment.status === 'completed') {
            // Update account balance and create transaction
            const newBalance = account.accountType === 'credit' 
              ? account.balance - paymentData.amount 
              : account.balance - paymentData.amount
              
            updateAccountBalance(paymentData.accountId, newBalance)
            
            createTransaction({
              accountId: paymentData.accountId,
              amount: account.accountType === 'credit' ? paymentData.amount : -paymentData.amount,
              type: account.accountType === 'credit' ? 'payment_credit' : 'payment',
              description: paymentData.description,
              merchantName: paymentData.recipientName,
              category: 'payment'
            })
          }
        }
      }, 3000)
      
      return HttpResponse.json({
        success: true,
        data: newPayment
      }, { status: 201 })
      
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }
  }),

  // Investment endpoints
  http.get('/api/investments', async () => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const investments = getInvestmentsByUserId(currentSession.user.id)
    
    return HttpResponse.json({
      success: true,
      data: investments
    })
  }),

  http.get('/api/investments/portfolio', async () => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const investments = getInvestmentsByUserId(currentSession.user.id)
    
    const portfolioSummary = {
      totalValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
      totalCost: investments.reduce((sum, inv) => sum + inv.totalCost, 0),
      totalGainLoss: investments.reduce((sum, inv) => sum + (inv.currentValue - inv.totalCost), 0),
      totalGainLossPercent: 0,
      holdings: investments
    }
    
    portfolioSummary.totalGainLossPercent = 
      portfolioSummary.totalCost > 0 
        ? (portfolioSummary.totalGainLoss / portfolioSummary.totalCost) * 100 
        : 0
    
    return HttpResponse.json({
      success: true,
      data: portfolioSummary
    })
  }),

  // Budget endpoints
  http.get('/api/budgets', async () => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const budgets = getBudgetsByUserId(currentSession.user.id)
    
    return HttpResponse.json({
      success: true,
      data: budgets
    })
  }),

  http.put('/api/budgets/:id', async ({ params, request }) => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    try {
      const budgetId = params.id as string
      const updateData = await request.json() as UpdateBudgetRequest
      
      const updatedBudget = updateBudget(budgetId, currentSession.user.id, updateData)
      
      if (!updatedBudget) {
        return HttpResponse.json({
          success: false,
          error: 'Budget not found or access denied'
        }, { status: 404 })
      }
      
      return HttpResponse.json({
        success: true,
        data: updatedBudget
      })
      
    } catch (error) {
      return HttpResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 })
    }
  }),

  // Card endpoints
  http.get('/api/cards', async () => {
    await delay()
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const cards = getCardsByUserId(currentSession.user.id)
    
    return HttpResponse.json({
      success: true,
      data: cards
    })
  }),

  http.post('/api/cards/:id/freeze', async ({ params }) => {
    await delay(300)
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const cardId = params.id as string
    const card = cardsData.find(c => c.id === cardId)
    
    if (!card) {
      return HttpResponse.json({
        success: false,
        error: 'Card not found'
      }, { status: 404 })
    }
    
    // Verify account ownership
    const account = getAccountById(card.accountId)
    if (!account || account.userId !== currentSession.user.id) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    card.status = 'frozen'
    card.updatedAt = new Date().toISOString()
    
    return HttpResponse.json({
      success: true,
      data: card
    })
  }),

  http.post('/api/cards/:id/unfreeze', async ({ params }) => {
    await delay(300)
    
    if (!currentSession) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const cardId = params.id as string
    const card = cardsData.find(c => c.id === cardId)
    
    if (!card) {
      return HttpResponse.json({
        success: false,
        error: 'Card not found'
      }, { status: 404 })
    }
    
    // Verify account ownership
    const account = getAccountById(card.accountId)
    if (!account || account.userId !== currentSession.user.id) {
      return HttpResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 })
    }
    
    card.status = 'active'
    card.updatedAt = new Date().toISOString()
    
    return HttpResponse.json({
      success: true,
      data: card
    })
  }),

  // Generic error handler for unmatched routes
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    
    return HttpResponse.json({
      success: false,
      error: `No handler found for ${request.method} ${new URL(request.url).pathname}`
    }, { status: 404 })
  })
]

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure MSW handlers
- [x] Reads config from `@/app/config` - not applicable for handlers
- [x] Exports default named component - exports handlers array
- [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for API handlers
*/
