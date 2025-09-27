"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import BaseModal from "@/components/ui/modal/BaseModal";
import { Crown, Star, Check, Zap } from "lucide-react";

/* ===================== Types ===================== */
interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userInfo?: {
    firstName?: string;
    lastName?: string;
    isPremium?: boolean;
  };
}

/* ===================== Component ===================== */
export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  userInfo,
}: PremiumUpgradeModalProps) {
  const router = useRouter();
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const [selectedPlan, setSelectedPlan] = useState('quarterly'); // Default to most popular

  // Helper function to get translated text with interpolation support
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    let result = value || key;

    // Handle interpolation
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }

    return result;
  };

  // Don't show modal if user is already premium
  if (userInfo?.isPremium) {
    return null;
  }

  // Pricing plans data
  const pricingPlans = [
    {
      id: 'monthly',
      name: t('banner.premium.plans.monthly.name'),
      description: t('banner.premium.plans.monthly.description'),
      price: '$9.99',
      billing: t('banner.premium.plans.monthly.billing'),
      savings: null,
      isPopular: false
    },
    {
      id: 'quarterly',
      name: t('banner.premium.plans.quarterly.name'),
      description: t('banner.premium.plans.quarterly.description'),
      price: '$24.99',
      billing: t('banner.premium.plans.quarterly.billing'),
      savings: t('banner.premium.plans.quarterly.savings'),
      isPopular: true
    },
    {
      id: 'yearly',
      name: t('banner.premium.plans.yearly.name'),
      description: t('banner.premium.plans.yearly.description'),
      price: '$89.99',
      billing: t('banner.premium.plans.yearly.billing'),
      savings: t('banner.premium.plans.yearly.savings'),
      isPopular: false
    }
  ];

  const premiumFeatures = [
    t('banner.premium.features.unlimitedTasks'),
    t('banner.premium.features.analytics'),
    t('banner.premium.features.prioritySupport'),
    t('banner.premium.features.teamCollaboration'),
    t('banner.premium.features.customIntegrations'),
    t('banner.premium.features.advancedSecurity')
  ];

  const handleUpgradeClick = () => {
    // Close modal and navigate to pricing page with selected plan
    onClose();
    // Use Next.js router for proper navigation
    router.push(`/pricing?plan=${selectedPlan}`);
  };

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    // Optional: Immediately navigate when plan is selected
    // onClose();
    // router.push(`/pricing?plan=${planId}`);
  };

  // Modal header content
  const headerContent = (
    <div
      className="relative p-6 text-center rounded-t-lg"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-4 left-4">
          <Star className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="absolute top-4 right-4">
          <Crown className="w-6 h-6 text-white animate-bounce" />
        </div>
        <div className="absolute bottom-4 left-8">
          <Zap className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="absolute top-1/2 right-8">
          <Star className="w-4 h-4 text-white animate-ping" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-white/25 rounded-full backdrop-blur-sm shadow-xl">
            <Crown className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
          {t('banner.premium.title')}
        </h2>

        {userInfo?.firstName && (
          <p className="text-white/95 text-base font-medium mb-2">
            {t('banner.premium.greeting', { name: userInfo.firstName })} 👋
          </p>
        )}

        <p className="text-white/90 text-sm">
          {t('banner.premium.subtitle')}
        </p>
      </div>
    </div>
  );

  // Modal main content
  const mainContent = (
    <div className="p-6">
      {/* Premium Features */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          {t('banner.premium.features.title')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span
                className="text-sm"
                style={{ color: theme.text.secondary }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-6">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: theme.text.primary }}
        >
          {t('banner.premium.choosePlan')}
        </h3>

        <div className="space-y-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedPlan === plan.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
              onClick={() => handlePlanSelection(plan.id)}
            >
              {plan.isPopular && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {t('banner.premium.plans.popular')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPlan === plan.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`} />

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4
                        className="font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        {plan.name}
                      </h4>
                      {plan.savings && (
                        <span className="text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      {plan.description}
                    </p>
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
      </div>

      {/* Guarantee */}
      <p className="text-center text-sm" style={{ color: theme.text.secondary }}>
        {t('banner.premium.pricing.guarantee')}
      </p>
    </div>
  );

  // Modal footer
  const footerContent = (
    <div className="flex justify-between items-center px-6 py-4" style={{ borderTop: `1px solid ${theme.border.default}` }}>
      <p className="text-xs" style={{ color: theme.text.secondary }}>
        {t('banner.premium.footerNote')}
      </p>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          style={{
            color: theme.text.primary,
            borderColor: theme.border.default
          }}
        >
          {t('banner.premium.buttons.maybeLater')}
        </button>

        <button
          onClick={handleUpgradeClick}
          className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity shadow-lg"
        >
          {t('banner.premium.buttons.upgradeNow')}
        </button>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showHeader={false}
      className="overflow-hidden"
    >
      {headerContent}
      {mainContent}
      {footerContent}
    </BaseModal>
  );
}
