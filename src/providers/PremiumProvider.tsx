"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { PricingService } from '@/services/pricing/pricing';
import { PremiumStatusResponse } from '@/types/pricing';
import { useAuth } from '@/components/auth/AuthProvider';

/* ===================== Types ===================== */
interface PremiumContextType {
  premiumStatus: PremiumStatusResponse | null;
  loading: boolean;
  error: string | null;
  refreshPremiumStatus: () => Promise<void>;
  startTrial: () => Promise<boolean>;
  isPremium: boolean;
  hasTrialAccess: boolean;
  daysRemaining: number;
  showUpgradeBanner: boolean;
  markTourCompleted: () => void;
}

interface PremiumProviderProps {
  children: ReactNode;
}

/* ===================== Context ===================== */
const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

/* ===================== Hook ===================== */
export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

/* ===================== Provider ===================== */
export function PremiumProvider({ children }: PremiumProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh premium status
  const refreshPremiumStatus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPremiumStatus(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const trialAnalytics = await PricingService.getTrialAnalytics();

      if (trialAnalytics && trialAnalytics.trialStatus === 'ACTIVE') {
        const daysRemaining = trialAnalytics.analytics?.daysRemaining || 0;
        const isExpired = daysRemaining <= 0;

        const builtPremiumStatus: PremiumStatusResponse = {
          isPremium: !isExpired, // Not premium if trial expired
          subscriptionStatus: isExpired ? 'EXPIRED' : 'TRIAL',
          planType: 'trial',
          daysRemaining: Math.max(0, daysRemaining),
          expiryDate: trialAnalytics.dates?.endDate || '',
          premiumBadgeUrl: null,
          isExpired: isExpired,
          message: isExpired
            ? 'Trial đã hết hạn - Cần nâng cấp'
            : `Trial còn ${daysRemaining} ngày`,
          trial: {
            hasTrialStarted: true,
            isTrialActive: !isExpired,
            daysRemaining: Math.max(0, daysRemaining),
            hoursRemaining: trialAnalytics.analytics?.hoursRemaining || 0,
            status: isExpired ? 'EXPIRED' : 'ACTIVE',
            hasAccess: !isExpired,
            startDate: trialAnalytics.dates?.startDate || '',
            endDate: trialAnalytics.dates?.endDate || '',
            urgencyLevel: isExpired ? 'CRITICAL' : (daysRemaining > 7 ? 'LOW' : 'MEDIUM')
          },
          availablePlans: {
            monthly: { price: 9.99, currency: 'USD', savings: null },
            quarterly: { price: 24.99, currency: 'USD', savings: '17%' },
            yearly: { price: 89.99, currency: 'USD', savings: '25%' }
          }
        };

        setPremiumStatus(builtPremiumStatus);
      } else if (trialAnalytics && trialAnalytics.trialStatus === 'EXPIRED') {
        // Handle explicitly expired trials
        const builtPremiumStatus: PremiumStatusResponse = {
          isPremium: false,
          subscriptionStatus: 'EXPIRED',
          planType: 'trial',
          daysRemaining: 0,
          expiryDate: trialAnalytics.dates?.endDate || '',
          premiumBadgeUrl: null,
          isExpired: true,
          message: 'Trial đã hết hạn - Cần nâng cấp',
          trial: {
            hasTrialStarted: true,
            isTrialActive: false,
            daysRemaining: 0,
            hoursRemaining: 0,
            status: 'EXPIRED',
            hasAccess: false,
            startDate: trialAnalytics.dates?.startDate || '',
            endDate: trialAnalytics.dates?.endDate || '',
            urgencyLevel: 'CRITICAL'
          },
          availablePlans: {
            monthly: { price: 9.99, currency: 'USD', savings: null },
            quarterly: { price: 24.99, currency: 'USD', savings: '17%' },
            yearly: { price: 89.99, currency: 'USD', savings: '25%' }
          }
        };

        setPremiumStatus(builtPremiumStatus);
      } else {
        setPremiumStatus(null);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch premium status');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const startTrial = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    try {
      setLoading(true);
      await PricingService.startTrial();
      await refreshPremiumStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to start trial');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, refreshPremiumStatus]);

  const markTourCompleted = useCallback(() => {
    localStorage.setItem('welcomeTourCompleted', 'true');
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshPremiumStatus();
    } else {
      setPremiumStatus(null);
      setError(null);
    }
  }, [isAuthenticated, user, refreshPremiumStatus]);

  // Computed values
  const isPremium = premiumStatus?.isPremium ?? false;
  const hasTrialAccess = premiumStatus?.trial.hasAccess ?? false;
  const daysRemaining = premiumStatus?.daysRemaining ?? 0;

  // Show banner for trial users (both active and expired)
  const showUpgradeBanner = isAuthenticated && premiumStatus !== null && (premiumStatus.trial.isTrialActive || premiumStatus.isExpired);

  const contextValue: PremiumContextType = {
    premiumStatus,
    loading,
    error,
    refreshPremiumStatus,
    startTrial,
    isPremium,
    hasTrialAccess,
    daysRemaining,
    showUpgradeBanner,
    markTourCompleted
  };

  return (
    <PremiumContext.Provider value={contextValue}>
      {children}
    </PremiumContext.Provider>
  );
}

export default PremiumProvider;
