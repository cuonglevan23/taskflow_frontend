"use client";

import React, { useState, useEffect } from "react";
import PrivateHeader from "./PrivateHeader";
import PrivateSidebar from "./PrivateSidebar";
import { DetailPanel } from "@/components/features/DetailPanel";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import PremiumUpgradeModal from "@/components/Banner/PremiumUpgradeModal";
import PricingService from "@/services/pricing/pricing";
import { Subscription } from "@/types/pricing";

interface PrivateLayoutContentProps {
  children: React.ReactNode;
}

export default function PrivateLayoutContent({ children }: PrivateLayoutContentProps) {
  const { theme } = useThemeContext();
  const { user, isLoading } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      // Chỉ load subscription khi user đã authenticated
      if (!user?.id || !user) return;

      try {
        setSubscriptionLoading(true);
        const subscription = await PricingService.getCurrentSubscription();
        setCurrentSubscription(subscription);
        console.log('✅ Subscription loaded successfully:', subscription);
      } catch (error: any) {
        console.error('❌ Failed to load subscription:', error);
        // Không set subscription thành null để tránh gây lỗi UI
        // Chỉ log error và continue với default state
        if (!error.message?.includes('Authentication required')) {
          console.log('ℹ️ User may not have subscription, continuing with free tier');
        }
      } finally {
        setSubscriptionLoading(false);
      }
    };

    // Delay một chút để đảm bảo auth đã được setup đầy đủ
    const timer = setTimeout(() => {
      loadSubscription();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  const handlePremiumUpgrade = () => {
    // Logic xử lý upgrade premium
    console.log('Premium upgrade initiated');
  };

  // Kiểm tra trạng thái premium dựa trên subscription
  const isPremiumUser = currentSubscription?.status === 'ACTIVE';

  // Map user data to match PremiumUpgradeModal interface
  const mappedUserInfo = user ? {
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    isPremium: isPremiumUser
  } : undefined;

  // Simple loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: theme.background.primary }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ FIX: Always render layout structure, even without user data
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme.background.primary }}>
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PrivateHeader
          user={user || { id: '1', email: 'loading@example.com', name: 'Loading...', role: 'MEMBER' }}
          onSidebarToggle={() => {}}
          onSidebarCollapseToggle={() => {}}
          isSidebarCollapsed={false}
          onLogout={() => {}}
        />
      </div>

      {/* Main Content Area - Add top padding to account for fixed header */}
      <div className="flex flex-1 overflow-hidden pt-12">
        {/* Sidebar - Fixed positioning */}
        <div className="fixed left-0 top-12 h-[calc(100vh-3rem)] z-40">
          <PrivateSidebar
            user={user || { id: '1', email: 'loading@example.com', name: 'Loading...', role: 'MEMBER' }}
            isOpen={true}
            isCollapsed={false}
            onClose={() => {}}
            onToggleCollapse={() => {}}
            onPremiumClick={() => setIsPremiumModalOpen(true)}
            isPremiumUser={isPremiumUser}
          />
        </div>

        {/* Content - Adjust margin for fixed sidebar */}
        <div
          className="flex-1 flex flex-col min-w-0 ml-64"
          style={{ backgroundColor: theme.background.primary }}
        >
          <main
            className="flex-1 overflow-auto relative"
            style={{
              backgroundColor: theme.background.primary,
              overscrollBehavior: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {children}
          </main>
        </div>

        {/* Detail Panel */}
        <DetailPanel />
      </div>

      {/* Premium Modal - Đặt ở ngoài để hiển thị toàn màn hình */}
      <PremiumUpgradeModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handlePremiumUpgrade}
        userInfo={mappedUserInfo}
      />
    </div>
  );
}
