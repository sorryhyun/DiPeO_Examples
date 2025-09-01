import type { Payment, PaymentRequest, ID } from '@/core/contracts';
import { appConfig } from '@/app/config';

// Mock payees for bill payments
export const mockPayees = [
  {
    id: 'payee_electric_001',
    name: 'City Electric Company',
    category: 'utilities',
    accountNumber: '****4567',
    logoUrl: '/mock-logos/electric.png',
  },
  {
    id: 'payee_gas_001',
    name: 'Metro Gas & Power',
    category: 'utilities',
    accountNumber: '****8901',
    logoUrl: '/mock-logos/gas.png',
  },
  {
    id: 'payee_water_001',
    name: 'Municipal Water Authority',
    category: 'utilities',
    accountNumber: '****2345',
    logoUrl: '/mock-logos/water.png',
  },
  {
    id: 'payee_internet_001',
    name: 'FastNet Internet Services',
    category: 'telecommunications',
    accountNumber: '****6789',
    logoUrl: '/mock-logos/internet.png',
  },
  {
    id: 'payee_phone_001',
    name: 'GlobalTel Mobile',
    category: 'telecommunications',
    accountNumber: '****0123',
    logoUrl: '/mock-logos/phone.png',
  },
  {
    id: 'payee_credit_001',
    name: 'Premier Credit Card',
    category: 'credit',
    accountNumber: '****4567',
    logoUrl: '/mock-logos/credit.png',
  },
  {
    id: 'payee_mortgage_001',
    name: 'HomeLoan Bank',
    category: 'loan',
    accountNumber: '****8901',
    logoUrl: '/mock-logos/mortgage.png',
  },
  {
    id: 'payee_insurance_001',
    name: 'SecureLife Insurance',
    category: 'insurance',
    accountNumber: '****2345',
    logoUrl: '/mock-logos/insurance.png',
  },
  {
    id: 'payee_cable_001',
    name: 'StreamMax Cable & TV',
    category: 'entertainment',
    accountNumber: '****6789',
    logoUrl: '/mock-logos/cable.png',
  },
  {
    id: 'payee_gym_001',
    name: 'FitLife Fitness Center',
    category: 'lifestyle',
    accountNumber: '****0123',
    logoUrl: '/mock-logos/gym.png',
  },
];

// Generate mock payments data
function generateMockPayments(): Payment[] {
  const payments: Payment[] = [];
  const currentDate = new Date();
  
  // Mock user account IDs (should match accounts mock data)
  const userAccountIds = [
    'acc_checking_001',
    'acc_savings_001',
    'acc_checking_002',
  ];

  // Generate payments for the last 6 months
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const paymentDate = new Date(currentDate);
    paymentDate.setMonth(paymentDate.getMonth() - monthOffset);
    
    // Generate 3-8 payments per month
    const paymentsThisMonth = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < paymentsThisMonth; i++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const createdAt = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), randomDay);
      const scheduledAt = new Date(createdAt);
      scheduledAt.setHours(scheduledAt.getHours() + Math.floor(Math.random() * 48)); // 0-48 hours later
      
      const processedAt = new Date(scheduledAt);
      processedAt.setMinutes(processedAt.getMinutes() + Math.floor(Math.random() * 30)); // 0-30 minutes processing time
      
      const payee = mockPayees[Math.floor(Math.random() * mockPayees.length)];
      const accountId = userAccountIds[Math.floor(Math.random() * userAccountIds.length)];
      
      // Generate amounts based on payee category
      let amount: number;
      switch (payee.category) {
        case 'utilities':
          amount = Math.floor(Math.random() * 200) + 50; // $50-$250
          break;
        case 'telecommunications':
          amount = Math.floor(Math.random() * 100) + 30; // $30-$130
          break;
        case 'credit':
          amount = Math.floor(Math.random() * 800) + 100; // $100-$900
          break;
        case 'loan':
          amount = Math.floor(Math.random() * 1500) + 800; // $800-$2300
          break;
        case 'insurance':
          amount = Math.floor(Math.random() * 300) + 100; // $100-$400
          break;
        case 'entertainment':
          amount = Math.floor(Math.random() * 80) + 20; // $20-$100
          break;
        case 'lifestyle':
          amount = Math.floor(Math.random() * 60) + 25; // $25-$85
          break;
        default:
          amount = Math.floor(Math.random() * 150) + 25; // $25-$175
      }
      
      // Most payments are completed, some are pending, very few failed
      const statusRandom = Math.random();
      let status: Payment['status'];
      let failureReason: string | undefined;
      
      if (scheduledAt > currentDate) {
        status = 'pending';
      } else if (statusRandom < 0.85) {
        status = 'completed';
      } else if (statusRandom < 0.95) {
        status = 'pending';
      } else {
        status = 'failed';
        failureReason = Math.random() < 0.5 ? 'Insufficient funds' : 'Payment declined by payee';
      }
      
      const payment: Payment = {
        id: `payment_${Date.now()}_${i}_${monthOffset}` as ID,
        payeeId: payee.id,
        accountId: accountId as ID,
        amount,
        currency: 'USD',
        scheduledAt: scheduledAt.toISOString(),
        memo: Math.random() < 0.6 ? `${payee.name} - ${paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : undefined,
        status,
        createdAt: createdAt.toISOString(),
        processedAt: status === 'completed' ? processedAt.toISOString() : undefined,
        failureReason,
      };
      
      payments.push(payment);
    }
  }
  
  // Sort by creation date (newest first)
  return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Generate upcoming scheduled payments
function generateUpcomingPayments(): PaymentRequest[] {
  const upcomingPayments: PaymentRequest[] = [];
  const currentDate = new Date();
  
  // Generate some recurring payments for the next 3 months
  const recurringPayees = mockPayees.filter(payee => 
    ['utilities', 'telecommunications', 'credit', 'loan', 'insurance'].includes(payee.category)
  );
  
  recurringPayees.forEach(payee => {
    // Generate 1-3 upcoming payments per recurring payee
    const upcomingCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < upcomingCount; i++) {
      const scheduledDate = new Date(currentDate);
      scheduledDate.setDate(scheduledDate.getDate() + (i + 1) * 30 + Math.floor(Math.random() * 5)); // Roughly monthly with some variance
      
      let amount: number;
      switch (payee.category) {
        case 'utilities':
          amount = Math.floor(Math.random() * 200) + 50;
          break;
        case 'telecommunications':
          amount = Math.floor(Math.random() * 100) + 30;
          break;
        case 'credit':
          amount = Math.floor(Math.random() * 800) + 100;
          break;
        case 'loan':
          amount = Math.floor(Math.random() * 1500) + 800;
          break;
        case 'insurance':
          amount = Math.floor(Math.random() * 300) + 100;
          break;
        default:
          amount = Math.floor(Math.random() * 150) + 25;
      }
      
      upcomingPayments.push({
        id: `upcoming_payment_${payee.id}_${i}` as ID,
        payeeId: payee.id,
        accountId: 'acc_checking_001' as ID, // Default to primary checking
        amount,
        currency: 'USD',
        scheduledAt: scheduledDate.toISOString(),
        memo: `${payee.name} - ${scheduledDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      });
    }
  });
  
  return upcomingPayments.sort((a, b) => 
    new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
  );
}

// Payment templates for quick payments
export const paymentTemplates = [
  {
    id: 'template_electric',
    name: 'Monthly Electric Bill',
    payeeId: 'payee_electric_001',
    amount: 125,
    memo: 'Electric bill - auto template',
  },
  {
    id: 'template_gas',
    name: 'Monthly Gas Bill',
    payeeId: 'payee_gas_001',
    amount: 85,
    memo: 'Gas bill - auto template',
  },
  {
    id: 'template_internet',
    name: 'Internet Service',
    payeeId: 'payee_internet_001',
    amount: 79,
    memo: 'Internet service - monthly',
  },
  {
    id: 'template_phone',
    name: 'Mobile Phone Bill',
    payeeId: 'payee_phone_001',
    amount: 65,
    memo: 'Mobile service - monthly',
  },
  {
    id: 'template_credit',
    name: 'Credit Card Payment',
    payeeId: 'payee_credit_001',
    amount: 250,
    memo: 'Credit card - minimum payment',
  },
];

// Export the main payments data
export const paymentsData = {
  payments: generateMockPayments(),
  upcomingPayments: generateUpcomingPayments(),
  payees: mockPayees,
  templates: paymentTemplates,
  
  // Helper methods for accessing data
  getPaymentById: (id: string) => {
    return generateMockPayments().find(payment => payment.id === id);
  },
  
  getPaymentsByAccountId: (accountId: string) => {
    return generateMockPayments().filter(payment => payment.accountId === accountId);
  },
  
  getPaymentsByStatus: (status: Payment['status']) => {
    return generateMockPayments().filter(payment => payment.status === status);
  },
  
  getPaymentsByPayeeId: (payeeId: string) => {
    return generateMockPayments().filter(payment => payment.payeeId === payeeId);
  },
  
  getPayeeById: (id: string) => {
    return mockPayees.find(payee => payee.id === id);
  },
  
  getPaymentsByDateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return generateMockPayments().filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= start && paymentDate <= end;
    });
  },
  
  // Statistics helpers
  getTotalPaidAmount: (accountId?: string) => {
    const payments = accountId 
      ? generateMockPayments().filter(p => p.accountId === accountId && p.status === 'completed')
      : generateMockPayments().filter(p => p.status === 'completed');
    
    return payments.reduce((total, payment) => total + payment.amount, 0);
  },
  
  getPaymentCountByCategory: () => {
    const payments = generateMockPayments();
    const categoryCounts: Record<string, number> = {};
    
    payments.forEach(payment => {
      const payee = mockPayees.find(p => p.id === payment.payeeId);
      if (payee) {
        categoryCounts[payee.category] = (categoryCounts[payee.category] || 0) + 1;
      }
    });
    
    return categoryCounts;
  },
};
