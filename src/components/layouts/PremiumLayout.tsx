"use client";

import React from 'react';
import { usePremium } from '@/providers/PremiumProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import GlobalTrialBanner from '@/components/Banner/GlobalTrialBanner';

/* ===================== Types ===================== */
interface PremiumLayoutProps {
  children: React.ReactNode;
}

/* ===================== Component ===================== */
export default function PremiumLayout({ children }: PremiumLayoutProps) {
  const { theme } = useThemeContext();
  const {
    showUpgradeBanner
  } = usePremium();

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Header */}
      <header
        className="border-b transition-colors duration-200"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1
                className="text-xl font-semibold"
                style={{ color: theme.text.primary }}
              >
                TaskFlow
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {showUpgradeBanner && (
        <GlobalTrialBanner />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}
