import { useState, useEffect } from 'react';

interface UsePremiumBannerVisibilityProps {
  userId?: string; // Optional: để support multi-user
}

export const usePremiumBannerVisibility = ({ userId }: UsePremiumBannerVisibilityProps = {}) => {
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tạo key duy nhất cho localStorage
  const getStorageKey = () => {
    const baseKey = 'premium_banner_dismissed';
    return userId ? `${baseKey}_${userId}` : baseKey;
  };

  // Kiểm tra xem đã đủ 24h chưa
  const hasOneDayPassed = (timestamp: number): boolean => {
    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 giờ
    return (now - timestamp) >= oneDayInMs;
  };

  // Kiểm tra có phải ngày mới không
  const isNewDay = (lastDismissedDate: string): boolean => {
    const today = new Date().toDateString();
    return lastDismissedDate !== today;
  };

  useEffect(() => {
    try {
      const storageKey = getStorageKey();
      const bannerData = localStorage.getItem(storageKey);

      if (!bannerData) {
        // Chưa từng dismiss banner, hiển thị banner
        setShouldShowBanner(true);
      } else {
        const { dismissedAt, dismissedDate } = JSON.parse(bannerData);

        // Kiểm tra theo ngày thay vì 24h chính xác
        // Cách này user-friendly hơn (reset vào 00:00 mỗi ngày)
        if (isNewDay(dismissedDate)) {
          setShouldShowBanner(true);
        } else {
          setShouldShowBanner(false);
        }
      }
    } catch (error) {
      console.error('Error reading premium banner state from localStorage:', error);
      // Nếu có lỗi, hiển thị banner để đảm bảo không bỏ sót
      setShouldShowBanner(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Hàm để dismiss banner
  const dismissBanner = () => {
    try {
      const storageKey = getStorageKey();
      const dismissData = {
        dismissedAt: new Date().getTime(),
        dismissedDate: new Date().toDateString(),
        dismissedBy: userId || 'anonymous'
      };

      localStorage.setItem(storageKey, JSON.stringify(dismissData));
      setShouldShowBanner(false);

      console.log('Premium banner dismissed for today');
    } catch (error) {
      console.error('Error saving premium banner state to localStorage:', error);
    }
  };

  // Hàm để force show banner (cho testing hoặc admin)
  const resetBannerVisibility = () => {
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      setShouldShowBanner(true);
      console.log('Premium banner visibility reset');
    } catch (error) {
      console.error('Error resetting premium banner state:', error);
    }
  };

  // Hàm để kiểm tra thời gian còn lại đến khi banner hiển thị lại
  const getTimeUntilNextShow = (): number => {
    try {
      const storageKey = getStorageKey();
      const bannerData = localStorage.getItem(storageKey);

      if (!bannerData) return 0;

      const { dismissedDate } = JSON.parse(bannerData);
      const dismissed = new Date(dismissedDate);
      const tomorrow = new Date(dismissed);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to start of next day

      return tomorrow.getTime() - new Date().getTime();
    } catch (error) {
      console.error('Error calculating time until next show:', error);
      return 0;
    }
  };

  return {
    shouldShowBanner,
    isLoading,
    dismissBanner,
    resetBannerVisibility,
    getTimeUntilNextShow
  };
};
