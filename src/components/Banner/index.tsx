"use client";

import React, { useState, useEffect } from "react";
import PremiumUpgradeModal from "./PremiumUpgradeModal";
import PricingService from "@/services/pricing";

/* ===================== Types ===================== */
interface UserInfo {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  onlineStatus: string;
  isOnline: boolean;
  lastSeen: string;
  isPremium: boolean;
  premiumExpiry?: string;
  premiumPlanType?: string;
  profile?: any;
}

interface PremiumBannerProps {
  userInfo: UserInfo;
  onUpgrade?: () => void;
  onDismiss?: () => void; // Add dismiss callback
  autoShowDelay?: number; // Delay in milliseconds before auto-showing modal
  showOnMount?: boolean; // Whether to show modal automatically on mount
}

/* ===================== Component ===================== */
export default function PremiumBanner({
  userInfo,
  onUpgrade,
  onDismiss, // Add onDismiss to destructuring
  autoShowDelay = 5000, // 5 seconds default
  showOnMount = true,
}: PremiumBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownAuto, setHasShownAuto] = useState(false);
  const [isActuallyPremium, setIsActuallyPremium] = useState(userInfo.isPremium);
  const [checkingPremium, setCheckingPremium] = useState(false);

  // Check actual premium status from backend
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        setCheckingPremium(true);
        // Add delay to avoid race condition with auth refresh
        await new Promise(resolve => setTimeout(resolve, 1000));

        const subscription = await PricingService.getCurrentSubscription();

        // User is premium if they have an active subscription
        const isPremium = subscription && subscription.status === 'ACTIVE';
        setIsActuallyPremium(Boolean(isPremium)); // Ensure boolean type


      } catch (error) {
        console.error('Failed to check premium status:', error);
        // Don't trigger logout on API error - fallback gracefully
        // Ensure we always pass a boolean value, never null
        setIsActuallyPremium(Boolean(userInfo.isPremium));
      } finally {
        setCheckingPremium(false);
      }
    };

    // Only check if userInfo says not premium, but we want to verify
    // Add additional check to ensure user is authenticated
    if (!userInfo.isPremium && userInfo.userId) {
      checkPremiumStatus();
    }
  }, [userInfo.isPremium, userInfo.userId]);

  // Auto-show modal for non-premium users
  useEffect(() => {
    if (
      !isActuallyPremium &&
      !checkingPremium &&
      showOnMount &&
      !hasShownAuto
    ) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        setHasShownAuto(true);
      }, autoShowDelay);

      return () => clearTimeout(timer);
    }
  }, [isActuallyPremium, checkingPremium, showOnMount, hasShownAuto, autoShowDelay]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Call onDismiss when modal is closed (dismissed)
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleUpgrade = () => {
    console.log("Upgrade to premium clicked for user:", userInfo.email);

    // Call custom upgrade handler if provided
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade action - redirect to pricing page or open upgrade flow
      window.location.href = "/pricing"; // Adjust this URL as needed
    }
  };

  // Method to manually show modal (can be called from parent components)
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Don't render anything if user is actually premium
  if (isActuallyPremium || checkingPremium) {
    return null;
  }

  return (
    <>
      <PremiumUpgradeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpgrade={handleUpgrade}
        userInfo={userInfo}
      />
    </>
  );
}

/* ===================== Export with additional utilities ===================== */
export { PremiumUpgradeModal };
