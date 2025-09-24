"use client";

import React, { useState } from "react";
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
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const [selectedPlan, setSelectedPlan] = useState('monthly'); // Default to monthly

  // Helper function to get translated text with interpolation support
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    let result = value || key;

    // Handle interpolation for greeting with name
    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }

    return result;
  };

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

  // Không hiển thị modal nếu user đã là premium
  if (userInfo?.isPremium) {
    return null;
  }

  const premiumFeatures = [
    t('banner.premium.features.unlimitedTasks'),
    t('banner.premium.features.analytics'),
    t('banner.premium.features.prioritySupport'),
    t('banner.premium.features.teamCollaboration'),
    t('banner.premium.features.customIntegrations'),
    t('banner.premium.features.advancedSecurity')
  ];

  const handleUpgradeClick = () => {
    onUpgrade();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      showHeader={false}
      className="overflow-hidden"
    >
      {/* Header with improved gradient background */}
      <div
        className="relative p-8 text-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          minHeight: '180px'
        }}
      >
        {/* Enhanced background decorations */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-6 left-6">
            <Star className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute top-8 right-8">
            <Crown className="w-10 h-10 text-white animate-bounce" />
          </div>
          <div className="absolute bottom-6 left-12">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute top-1/2 right-12">
            <Star className="w-6 h-6 text-white animate-ping" />
          </div>
          <div className="absolute bottom-8 right-16">
            <Crown className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/25 rounded-full backdrop-blur-sm shadow-xl">
              <Crown className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {t('banner.premium.title')}
          </h2>

          {userInfo?.firstName && (
            <p className="text-white/95 text-lg font-medium mb-2">
              {t('banner.premium.greeting', { name: userInfo.firstName })} 👋
            </p>
          )}

          <p className="text-white/90 text-base max-w-2xl mx-auto leading-relaxed">
            {t('banner.premium.subtitle')}
          </p>
        </div>
      </div>

      {/* Enhanced Content Section with horizontal layout */}
      <div className="p-8" style={{ backgroundColor: theme.background.primary }}>

        {/* Main content in two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* Left Column - Premium Features */}
          <div>
            <h3
              className="text-xl font-bold mb-4 text-center lg:text-left"
              style={{ color: theme.text.primary }}
            >
              ✨ {t('banner.premium.features.title')} ✨
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {premiumFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
                  style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.default
                  }}
                >
                  <div
                    className="p-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.status.success }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span
                    className="font-medium text-sm"
                    style={{ color: theme.text.primary }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Pricing Plans */}
          <div>
            <h3
              className="text-xl font-bold mb-4 text-center lg:text-left"
              style={{ color: theme.text.primary }}
            >
              💎 {t('banner.premium.choosePlan')} 💎
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {pricingPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    backgroundColor: selectedPlan === plan.id
                      ? theme.background.tertiary || theme.background.secondary
                      : theme.background.secondary,
                    borderColor: selectedPlan === plan.id
                      ? '#3B82F6'
                      : theme.border.default
                  }}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-2 right-2">
                      <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
                        🔥 {t('banner.premium.plans.popular')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <h4
                        className="text-lg font-bold mb-1"
                        style={{ color: theme.text.primary }}
                      >
                        {plan.name}
                      </h4>
                      <p
                        className="text-xs opacity-80"
                        style={{ color: theme.text.secondary }}
                      >
                        {plan.description}
                      </p>
                      {plan.savings && (
                        <p
                          className="font-bold text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                          style={{
                            color: theme.status.success,
                            backgroundColor: theme.background.primary
                          }}
                        >
                          💰 {plan.savings}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: theme.text.primary }}
                        >
                          {plan.price}
                        </span>
                        <span
                          className="text-sm ml-1"
                          style={{ color: theme.text.secondary }}
                        >
                          {plan.billing}
                        </span>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-1 ml-auto">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section - Guarantee and Actions */}
        <div className="mt-6 max-w-4xl mx-auto">
          {/* Enhanced Guarantee Section */}
          <div
            className="text-center p-4 rounded-xl mb-6 border-2 border-dashed"
            style={{
              backgroundColor: theme.background.secondary,
              borderColor: theme.status.success
            }}
          >
            <p
              className="text-base font-medium flex items-center justify-center gap-2"
              style={{ color: theme.text.primary }}
            >
              🛡️ {t('banner.premium.pricing.guarantee')}
            </p>
          </div>

          {/* Enhanced Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <button
              onClick={handleUpgradeClick}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white text-base transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              }}
            >
              🚀 {t('banner.premium.buttons.upgradeNow')}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 hover:shadow-md"
              style={{
                color: theme.text.secondary,
                borderColor: theme.border.default,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.text.secondary;
              }}
            >
              ⏰ {t('banner.premium.buttons.maybeLater')}
            </button>
          </div>

          {/* Enhanced footer */}
          <div className="text-center mt-4">
            <p
              className="text-sm flex items-center justify-center gap-2"
              style={{ color: theme.text.muted }}
            >
              ⭐ {t('banner.premium.footerNote')} ⭐
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
