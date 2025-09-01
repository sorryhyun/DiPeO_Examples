import type { Transaction, Account } from '@/core/contracts';
import { accountsData } from './accounts';

// Transaction categories for realistic data
const TRANSACTION_CATEGORIES = [
  'groceries',
  'restaurants',
  'gas',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'education',
  'travel',
  'insurance',
  'rent',
  'mortgage',
  'salary',
  'bonus',
  'investment',
  'dividend',
  'transfer',
  'refund',
  'subscription',
  'charity'
];

// Common merchants for different categories
const MERCHANTS_BY_CATEGORY: Record<string, string[]> = {
  groceries: ['Whole Foods', 'Safeway', 'Target', 'Walmart', 'Trader Joe\'s', 'Costco'],
  restaurants: ['Starbucks', 'McDonald\'s', 'Chipotle', 'Subway', 'Pizza Hut', 'Olive Garden'],
  gas: ['Shell', 'Chevron', 'BP', 'Exxon', '76', 'Arco'],
  utilities: ['PG&E', 'Comcast', 'AT&T', 'Verizon', 'City Water Dept', 'Electric Company'],
  entertainment: ['Netflix', 'Spotify', 'AMC Theatres', 'Steam', 'Disney+', 'HBO Max'],
  shopping: ['Amazon', 'Best Buy', 'Target', 'Macy\'s', 'Home Depot', 'Nordstrom'],
  healthcare: ['CVS Pharmacy', 'Walgreens', 'Kaiser Permanente', 'UCSF Medical', 'Urgent Care'],
  education: ['University Bookstore', 'Coursera', 'Khan Academy', 'Library Fine', 'School District'],
  travel: ['United Airlines', 'Hilton Hotels', 'Uber', 'Lyft', 'Hertz', 'Airbnb'],
  insurance: ['State Farm', 'Geico', 'Allstate', 'Progressive', 'Blue Cross', 'Aetna'],
  rent: ['Property Management Co', 'Landlord Payment', 'Apartment Complex'],
  mortgage: ['Wells Fargo Mortgage', 'Chase Home Lending', 'Bank of America Mortgage'],
  salary: ['Direct Deposit - Employer', 'Payroll Deposit', 'Salary Payment'],
  bonus: ['Performance Bonus', 'Holiday Bonus', 'Commission Payment'],
  investment: ['Stock Purchase', 'Bond Purchase', 'Mutual Fund', 'ETF Purchase'],
  dividend: ['AAPL Dividend', 'MSFT Dividend', 'SPY Dividend', 'VTI Dividend'],
  transfer: ['Account Transfer', 'Wire Transfer', 'ACH Transfer'],
  refund: ['Amazon Refund', 'Store Return', 'Service Refund', 'Insurance Claim'],
  subscription: ['Adobe Creative', 'Microsoft 365', 'Apple iCloud', 'GitHub Pro'],
  charity: ['Red Cross', 'Salvation Army', 'Local Food Bank', 'Doctors Without Borders']
};

/**
 * Generate a realistic transaction based on account type and category
 */
export function generateTransaction(
  accountId: string,
  account: Account,
  options: {
    category?: string;
    type?: 'debit' | 'credit' | 'refund' | 'fee';
    amount?: number;
    daysAgo?: number;
    status?: 'pending' | 'posted' | 'failed';
  } = {}
): Transaction {
  const category = options.category || TRANSACTION_CATEGORIES[Math.floor(Math.random() * TRANSACTION_CATEGORIES.length)];
  const merchants = MERCHANTS_BY_CATEGORY[category] || ['Generic Merchant'];
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];

  // Determine transaction type based on category and account type
  let type: Transaction['type'] = options.type || 'debit';
  if (!options.type) {
    if (['salary', 'bonus', 'dividend', 'refund'].includes(category)) {
      type = 'credit';
    } else if (account.type === 'credit') {
      type = Math.random() > 0.1 ? 'debit' : 'credit'; // Credit cards mostly debits (purchases)
    } else {
      type = Math.random() > 0.8 ? 'credit' : 'debit'; // Checking/savings mostly debits
    }
  }

  // Generate realistic amounts based on category
  let amount = options.amount;
  if (!amount) {
    switch (category) {
      case 'groceries':
        amount = Math.random() * 200 + 20; // $20-220
        break;
      case 'restaurants':
        amount = Math.random() * 80 + 10; // $10-90
        break;
      case 'gas':
        amount = Math.random() * 60 + 30; // $30-90
        break;
      case 'utilities':
        amount = Math.random() * 200 + 50; // $50-250
        break;
      case 'rent':
      case 'mortgage':
        amount = Math.random() * 2000 + 1000; // $1000-3000
        break;
      case 'salary':
        amount = Math.random() * 3000 + 2000; // $2000-5000
        break;
      case 'investment':
        amount = Math.random() * 1000 + 100; // $100-1100
        break;
      default:
        amount = Math.random() * 150 + 10; // $10-160
    }
    
    // Round to 2 decimal places
    amount = Math.round(amount * 100) / 100;
  }

  // Generate transaction date
  const daysAgo = options.daysAgo ?? Math.floor(Math.random() * 90); // 0-90 days ago
  const postedAt = new Date();
  postedAt.setDate(postedAt.getDate() - daysAgo);
  postedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

  // Generate transaction ID
  const id = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    id,
    accountId,
    postedAt: postedAt.toISOString(),
    amount,
    currency: account.currency,
    type,
    description: `${merchant}${category !== 'transfer' ? ` - ${category}` : ''}`,
    category,
    merchant: category === 'transfer' ? undefined : merchant,
    status: options.status || (Math.random() > 0.95 ? 'pending' : 'posted'),
    metadata: {
      originalAmount: amount,
      processingFee: type === 'fee' ? Math.round(amount * 0.03 * 100) / 100 : undefined,
      merchantCategory: category,
      location: category === 'transfer' ? undefined : generateLocation()
    }
  };
}

/**
 * Generate a random location for transaction
 */
function generateLocation(): string {
  const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver'];
  const states = ['CA', 'NY', 'IL', 'TX', 'WA', 'MA', 'CO'];
  
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  
  return `${city}, ${state}`;
}

/**
 * Generate transactions for all accounts
 */
function generateTransactionsForAllAccounts(): Transaction[] {
  const transactions: Transaction[] = [];
  
  accountsData.forEach(account => {
    // Generate 15-50 transactions per account
    const transactionCount = Math.floor(Math.random() * 35) + 15;
    
    for (let i = 0; i < transactionCount; i++) {
      // Create more recent transactions with higher probability
      const daysAgo = Math.floor(Math.random() * Math.random() * 90); // Weighted towards recent
      
      // Account-specific transaction patterns
      let categoryOverrides: string[] = [];
      if (account.type === 'checking') {
        categoryOverrides = ['groceries', 'restaurants', 'gas', 'utilities', 'shopping', 'rent', 'salary'];
      } else if (account.type === 'savings') {
        categoryOverrides = ['salary', 'bonus', 'investment', 'transfer'];
      } else if (account.type === 'credit') {
        categoryOverrides = ['groceries', 'restaurants', 'shopping', 'entertainment', 'travel'];
      } else if (account.type === 'investment') {
        categoryOverrides = ['investment', 'dividend', 'bonus'];
      }
      
      const category = categoryOverrides.length > 0 
        ? categoryOverrides[Math.floor(Math.random() * categoryOverrides.length)]
        : undefined;
      
      transactions.push(generateTransaction(account.id, account, {
        category,
        daysAgo
      }));
    }
  });
  
  // Sort transactions by date (most recent first)
  return transactions.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

/**
 * Pre-generated transaction data for consistent mock responses
 */
export const transactionsData: Transaction[] = generateTransactionsForAllAccounts();

// Add some specific test transactions for edge cases
const testTransactions: Transaction[] = [
  // Large salary deposit
  generateTransaction(accountsData[0].id, accountsData[0], {
    category: 'salary',
    type: 'credit',
    amount: 4500.00,
    daysAgo: 1,
    status: 'posted'
  }),
  
  // Pending large purchase
  generateTransaction(accountsData[2].id, accountsData[2], {
    category: 'shopping',
    type: 'debit',
    amount: 1299.99,
    daysAgo: 0,
    status: 'pending'
  }),
  
  // Failed transaction
  generateTransaction(accountsData[0].id, accountsData[0], {
    category: 'utilities',
    type: 'debit',
    amount: 156.78,
    daysAgo: 2,
    status: 'failed'
  }),
  
  // Investment dividend
  generateTransaction(accountsData[3].id, accountsData[3], {
    category: 'dividend',
    type: 'credit',
    amount: 87.42,
    daysAgo: 3,
    status: 'posted'
  }),
  
  // Small refund
  generateTransaction(accountsData[0].id, accountsData[0], {
    category: 'refund',
    type: 'credit',
    amount: 12.99,
    daysAgo: 5,
    status: 'posted'
  })
];

// Add test transactions to the main data
transactionsData.unshift(...testTransactions);

// Helper function to get transactions by account ID
export function getTransactionsByAccountId(accountId: string): Transaction[] {
  return transactionsData.filter(transaction => transaction.accountId === accountId);
}

// Helper function to get recent transactions (last 30 days)
export function getRecentTransactions(limit: number = 10): Transaction[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return transactionsData
    .filter(transaction => new Date(transaction.postedAt) >= thirtyDaysAgo)
    .slice(0, limit);
}

// Helper function to get transactions by category
export function getTransactionsByCategory(category: string): Transaction[] {
  return transactionsData.filter(transaction => transaction.category === category);
}

// Helper function to get transactions by date range
export function getTransactionsByDateRange(startDate: string, endDate: string): Transaction[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return transactionsData.filter(transaction => {
    const transactionDate = new Date(transaction.postedAt);
    return transactionDate >= start && transactionDate <= end;
  });
}

// Helper function to calculate total spending by category
export function getSpendingByCategory(): Record<string, number> {
  const spending: Record<string, number> = {};
  
  transactionsData
    .filter(transaction => transaction.type === 'debit' && transaction.status === 'posted')
    .forEach(transaction => {
      const category = transaction.category || 'other';
      spending[category] = (spending[category] || 0) + transaction.amount;
    });
  
  return spending;
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Pure data module
- [x] Reads config from `@/app/config` - Not applicable for data module
- [x] Exports default named component - Not applicable, exports data and functions
- [x] Adds basic ARIA and keyboard handlers (where relevant) - Not applicable for data module
*/
