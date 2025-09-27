/* ===================== Pricing & Subscription Types ===================== */

// Plan Types
export type PlanType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Subscription Status
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CANCELLED'
  | 'PAST_DUE'
  | 'UNPAID'
  | 'TRIALING';

// Payment Status
export type PaymentStatus =
  | 'SUCCEEDED'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'REQUIRES_ACTION';

// ===== NEW PREMIUM STATUS TYPES =====
export type TrialStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NOT_STARTED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'EXPIRED';
export type PremiumPlanType = 'trial' | 'monthly' | 'quarterly' | 'yearly' | 'none';

/**
 * Trial Information for Premium Status
 */
export interface TrialInfo {
  hasTrialStarted: boolean;
  isTrialActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  status: TrialStatus;
  hasAccess: boolean;
  startDate: string; // ISO datetime string
  endDate: string; // ISO datetime string
  urgencyLevel: UrgencyLevel;
}

/**
 * Available Plans Information
 */
export interface AvailablePlans {
  monthly: {
    price: number;
    currency: string;
    savings: string | null;
  };
  quarterly: {
    price: number;
    currency: string;
    savings: string | null;
  };
  yearly: {
    price: number;
    currency: string;
    savings: string | null;
  };
}

/**
 * 🏆 Premium Status Response - GET /api/premium/status
 */
export interface PremiumStatusResponse {
  isPremium: boolean;
  subscriptionStatus: string;
  planType: PremiumPlanType;
  daysRemaining: number;
  expiryDate: string; // ISO datetime string
  premiumBadgeUrl: string | null;
  isExpired: boolean;
  message: string;
  trial: TrialInfo;
  availablePlans: AvailablePlans;
}

/**
 * Start Trial Response - POST /api/premium/start-trial
 */
export interface StartTrialResponse {
  success: boolean;
  trialStatus: TrialStatus;
  message: string;
  isPremium: boolean;
  planType: string; // "trial"
  startDate: string; // ISO datetime string
  endDate: string; // ISO datetime string
  daysRemaining: number;
  premiumBadgeUrl: string | null;
}

/* ===================== Request Types ===================== */

export interface CreateSubscriptionRequest {
  planType: PlanType;
  userId: number;
}

/* ===================== Response Types ===================== */

export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  subscriptionId: string;
  success: boolean;
  message: string;
}

export interface Subscription {
  id: number;
  stripeSubscriptionId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  content: PaymentHistory[];
  totalElements: number;
  size: number;
  number: number;
}

/* ===================== Plan Configuration Types ===================== */

export interface PlanConfig {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: string;
  savings?: string;
  isPopular: boolean;
  features: string[];
}

/* ===================== Error Types ===================== */

export interface PricingError {
  message: string;
  code?: string;
  status?: number;
}
