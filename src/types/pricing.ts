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
