"use client";

import React, { useState } from "react";
import { useThemeContext } from '@/providers/ThemeProvider';
import { useLanguageContext } from '@/providers/LanguageProvider';
import { usePremium } from '@/providers/PremiumProvider';
import BaseModal from "@/components/ui/modal/BaseModal";
import { Crown, Clock, AlertTriangle, Zap, X } from "lucide-react";

/* ===================== Types ===================== */
interface TrialCountdownBannerProps {
  onUpgrade: () => void;
  onStartTrial?: () => void;
  className?: string;
}

/* ===================== Component ===================== */
export default function TrialCountdownBanner({
  onUpgrade,
  onStartTrial,
  className = ""
}: TrialCountdownBannerProps) {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();
  const { premiumStatus } = usePremium();
  const [isOpen, setIsOpen] = useState(true);

  // Helper function to get translated text
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    let result = value || key;

    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
    }

    return result;
  };

  // Don't render if modal is closed or no premium status
  if (!isOpen || !premiumStatus || !premiumStatus.trial.isTrialActive) {
    return null;
  }

  const trial = premiumStatus.trial;
  const daysRemaining = trial.daysRemaining;

  // Get banner styling based on urgency level
  const getBannerStyling = () => {
    if (daysRemaining <= 1) {
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
    } else if (daysRemaining <= 7) {
      return {
        background: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
        icon: Clock,
        pulse: ''
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
    setIsOpen(false);
  };

  const handleUpgrade = () => {
    onUpgrade();
    setIsOpen(false);
  };

  // Modal content
  const modalContent = (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ background: styling.background }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-2 left-4">
          <Crown className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div className="absolute top-3 right-8">
          <Zap className="w-4 h-4 text-white animate-ping" />
        </div>
        <div className="absolute bottom-2 right-16">
          <Crown className="w-5 h-5 text-white animate-bounce" />
        </div>
      </div>

      <div className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-white/20 rounded-full ${styling.pulse}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-white font-bold text-lg">
                {daysRemaining > 0
                  ? t('banner.trial.daysRemaining', { days: daysRemaining.toString() })
                  : t('banner.trial.hoursRemaining', { hours: trial.hoursRemaining.toString() })
                }
              </h3>
              <span className="text-white/90 text-sm">
                {daysRemaining <= 3 ? '⏰ Expiring Soon!' : '🚀 Trial Active'}
              </span>
            </div>

            <p className="text-white/90 text-sm">
              {t('banner.trial.upgradeMessage')}
            </p>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white/60 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, (daysRemaining / 14) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={handleUpgrade}
            className="px-6 py-2 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            {t('banner.trial.upgradeButton')}
          </button>

          <button
            onClick={handleClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="4xl"
      showHeader={false}
      backdropClickToClose={false}
      className="flex items-start justify-center pt-4"
    >
      {modalContent}
    </BaseModal>
  );
}
