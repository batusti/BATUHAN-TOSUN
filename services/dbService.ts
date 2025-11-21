import { Customer, ServiceItem, Transaction, MembershipTier, DashboardStats } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'sw_customers',
  TRANSACTIONS: 'sw_transactions',
  SERVICES: 'sw_services'
};

// Default Data
const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 's1', name: 'Ekspres Yıkama', price: 150, category: 'Dış', pointsAwarded: 15 },
  { id: 's2', name: 'Lüks Yıkama', price: 250, category: 'Tam', pointsAwarded: 25 },
  { id: 's3', name: 'İç Detaylı Temizlik', price: 600, category: 'İç', pointsAwarded: 60 },
  { id: 's4', name: 'Seramik Kaplama', price: 1500, category: 'Detaylı', pointsAwarded: 150 },
  { id: 's5', name: 'Lastik Parlatma', price: 50, category: 'Dış', pointsAwarded: 5 },
];

class DBService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
  }

  // --- Services ---
  getServices(): ServiceItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  }

  addCustomer(customer: Omit<Customer, 'id' | 'points' | 'joinDate'>): Customer {
    const customers = this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      points: 0,
      joinDate: new Date().toISOString()
    };
    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  }

  findCustomerByPlate(plate: string): Customer | undefined {
    const customers = this.getCustomers();
    return customers.find(c => c.licensePlate.toUpperCase() === plate.toUpperCase());
  }

  // --- Transactions ---
  getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  }

  createTransaction(
    customer: Customer,
    items: ServiceItem[],
    redeemPoints: number
  ): Transaction {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    
    // Membership Discounts
    let discountRate = 0;
    if (customer.membershipTier === MembershipTier.PREMIUM) discountRate = 0.10;
    if (customer.membershipTier === MembershipTier.VIP) discountRate = 0.20;
    
    const memberDiscount = subtotal * discountRate;
    
    // Points Redemption (Let's adjust for TRY context: 100 points = 50 TL off)
    const pointsDiscount = (redeemPoints / 100) * 50; 

    const totalDiscount = memberDiscount + pointsDiscount;
    const finalAmount = Math.max(0, subtotal - totalDiscount);
    
    // Calculate points earned from this transaction (1 point per 10 TL spent to keep numbers sane)
    const pointsEarned = Math.floor(finalAmount / 10);

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      customerName: customer.name,
      items,
      subtotal,
      discountAmount: totalDiscount,
      pointsRedeemed: redeemPoints,
      finalAmount,
      timestamp: new Date().toISOString()
    };

    // Save Transaction
    const transactions = this.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update Customer Points
    const newPoints = customer.points - redeemPoints + pointsEarned;
    this.updateCustomer(customer.id, { points: newPoints });

    return transaction;
  }

  // --- Reporting ---
  getDashboardStats(): DashboardStats {
    const transactions = this.getTransactions();
    const customers = this.getCustomers();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    const dailyRevenue = transactions
      .filter(t => t.timestamp.startsWith(today))
      .reduce((sum, t) => sum + t.finalAmount, 0);

    const monthlyRevenue = transactions
      .filter(t => t.timestamp.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.finalAmount, 0);

    const todaysWashes = transactions.filter(t => t.timestamp.startsWith(today)).length;

    return {
      dailyRevenue,
      monthlyRevenue,
      totalCustomers: customers.length,
      todaysWashes
    };
  }

  // --- Backup/Restore ---
  getBackupData(): string {
    return JSON.stringify({
      customers: this.getCustomers(),
      transactions: this.getTransactions(),
      services: this.getServices()
    });
  }

  restoreData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);
      if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      return true;
    } catch (e) {
      console.error("Restore failed", e);
      return false;
    }
  }
}

export const db = new DBService();