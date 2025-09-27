"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/auth/AuthProvider';
import { usePremium } from '@/providers/PremiumProvider';
import BaseModal from "@/components/ui/modal/BaseModal";
import { useThemeContext } from '@/providers/ThemeProvider';
import { Crown, Clock, AlertTriangle, Zap, X, Check } from "lucide-react";

/* ===================== Global Trial Banner System ===================== */
export default function GlobalTrialBanner() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useThemeContext();
  const {
    showUpgradeBanner,
    premiumStatus
  } = usePremium();
  const [showModal, setShowModal] = useState(false);

  // ✅ Move useEffect BEFORE any conditional returns
  useEffect(() => {
    if (showUpgradeBanner) {
      setShowModal(true);
    }
  }, [showUpgradeBanner]);

  // Only show on authenticated pages
  if (!isAuthenticated || !user) {
    return null;
  }

  if (!premiumStatus?.trial.isTrialActive && !premiumStatus?.isExpired) {
    return null;
  }

  const trial = premiumStatus.trial;
  const daysRemaining = trial.daysRemaining;
  const isTrialExpired = daysRemaining <= 0 || premiumStatus.isExpired;

  // Get styling based on urgency
  const getBannerStyling = () => {
    if (isTrialExpired) {
      return {
        background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
        icon: AlertTriangle,
        pulse: 'animate-pulse'
      };
    } else if (daysRemaining <= 1) {
      return {
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        icon: AlertTriangle,
        pulse: 'animate-pulse'
      };
    } else if (daysRemaining <= 3) {
      return {
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        icon: Clock,
        pulse: 'animate-bounce'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: Crown,
        pulse: ''
      };
    }
  };

  const styling = getBannerStyling();
  const IconComponent = styling.icon;

  const handleClose = () => {
    // ✅ Only allow close if trial is still active
    if (!isTrialExpired) {
      setShowModal(false);
    }
  };

  const handleUpgrade = () => {
    // ✅ Close modal first, then navigate to pricing page
    setShowModal(false);
    router.push('/pricing');
  };

  // Handle plan selection and upgrade
  const handlePlanSelect = (planId: string) => {
    // Close modal and navigate to pricing page with selected plan
    setShowModal(false);
    router.push(`/pricing?plan=${planId}`);
  };

  // Handle clicks on the overlay - block all interactions except upgrade button
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only allow clicks on upgrade buttons
    const target = e.target as HTMLElement;
    const isUpgradeButton = target.closest('[data-upgrade-button="true"]');
    if (!isUpgradeButton) {
      // Prevent the click from reaching underlying elements
      return false;
    }
  };

  // Pricing plans
  const pricingPlans = [
    { id: 'monthly', name: 'Monthly', price: '$9.99', billing: '/month' },
    { id: 'quarterly', name: 'Quarterly', price: '$24.99', billing: '/3 months', savings: 'Save 17%', popular: true },
    { id: 'yearly', name: 'Yearly', price: '$89.99', billing: '/year', savings: 'Save 25%' }
  ];

  const features = [
    'Unlimited tasks & projects',
    'Advanced analytics',
    'Priority support',
    'Team collaboration',
    'Custom integrations',
    'Enhanced security'
  ];

  return (
    <>
      {/* Global Overlay for Trial Expired - Blocks All Interactions */}
      {isTrialExpired && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
          style={{
            pointerEvents: 'all',
            cursor: 'not-allowed'
          }}
        >
          {/* Trial Expired Notice */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border border-red-200 dark:border-red-800">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
                Trial Expired
              </h2>

              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Your 14-day trial has ended. Upgrade to Premium to continue accessing all features.
              </p>

              <button
                data-upgrade-button="true"
                onClick={handleUpgrade}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
              >
                Upgrade Now - Restore Access
              </button>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                All other features are temporarily disabled
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Single Unified Modal */}
      <BaseModal
        isOpen={showModal}
        onClose={handleClose}
        maxWidth="4xl"
        showHeader={false}
        backdropClickToClose={!isTrialExpired}
      >
        <div className="overflow-hidden">
          {/* Header with trial countdown */}
          <div
            className="relative px-6 py-4"
            style={{ background: styling.background }}
          >
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-10">
              <Crown className="absolute top-2 left-4 w-6 h-6 text-white animate-pulse" />
              <Zap className="absolute top-2 right-4 w-4 h-4 text-white animate-ping" />
              <Crown className="absolute bottom-2 right-8 w-5 h-5 text-white animate-bounce" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-white/20 rounded-full ${styling.pulse}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-xl">
                    {isTrialExpired
                      ? "Trial has expired"
                      : `${daysRemaining} days left in trial`
                    }
                  </h3>
                  <p className="text-white/90 text-sm">
                    {isTrialExpired
                      ? "⚠️ Upgrade required to continue"
                      : daysRemaining <= 3 ? '⏰ Expiring Soon!' : '🚀 Trial Active'
                    }
                  </p>

                  {/* Progress bar - show empty for expired */}
                  <div className="mt-2 w-48 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                      style={{ width: isTrialExpired ? '0%' : `${Math.max(0, (daysRemaining / 14) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Only show close button if trial is still active */}
              {!isTrialExpired && (
                <button onClick={handleClose} className="p-2 text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                {isTrialExpired ? "Your trial has ended" : "Upgrade to Premium"}
              </h2>
              <p style={{ color: theme.text.secondary }}>
                {isTrialExpired
                  ? "Upgrade now to restore access to all premium features"
                  : "Continue enjoying all premium features after your trial ends"
                }
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm" style={{ color: theme.text.secondary }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing plans */}
            <div className="space-y-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    plan.popular 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                  data-upgrade-button="true"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 border-purple-500 bg-purple-500" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium" style={{ color: theme.text.primary }}>
                            {plan.name}
                          </h4>
                          {plan.savings && (
                            <span className="text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                              {plan.savings}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: theme.text.primary }}>
                        {plan.price}
                      </div>
                      <div className="text-sm" style={{ color: theme.text.secondary }}>
                        {plan.billing}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.border.default }}>
              <div className="flex justify-between items-center">
                <p className="text-xs" style={{ color: theme.text.secondary }}>
                  {isTrialExpired
                    ? "⚠️ Premium features are currently restricted"
                    : "Cancel anytime • 30-day money back guarantee"
                  }
                </p>

                <div className="space-x-3">
                  {/* ✅ Only show "Maybe Later" if trial is still active */}
                  {!isTrialExpired && (
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm rounded-lg border"
                      style={{
                        color: theme.text.primary,
                        borderColor: theme.border.default
                      }}
                    >
                      Maybe Later
                    </button>
                  )}

                  <button
                    data-upgrade-button="true"
                    onClick={handleUpgrade}
                    className={`px-6 py-2 text-sm font-semibold text-white rounded-lg transition-opacity shadow-lg ${
                      isTrialExpired 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
                    }`}
                  >
                    {isTrialExpired ? "Upgrade Now - Restore Access" : "Upgrade Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
}
