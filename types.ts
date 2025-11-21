export enum MembershipTier {
  BASIC = 'Standart',
  PREMIUM = 'Premium',
  VIP = 'VIP'
}

export interface Customer {
  id: string;
  name: string;
  licensePlate: string;
  vehicleModel: string;
  phone: string;
  membershipTier: MembershipTier;
  points: number;
  joinDate: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: 'Dış' | 'İç' | 'Tam' | 'Detaylı';
  pointsAwarded: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for easier reporting
  items: ServiceItem[];
  subtotal: number;
  discountAmount: number;
  pointsRedeemed: number;
  finalAmount: number;
  timestamp: string; // ISO string
}

export interface DashboardStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  todaysWashes: number;
}