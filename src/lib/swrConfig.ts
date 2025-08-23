import { SWRConfig } from 'swr';

export const swrGlobalConfig = {
  // Refresh data when the window regains focus
  revalidateOnFocus: true,
  // Refresh data when the network reconnects
  revalidateOnReconnect: true,
  // Don't refresh data when the window is not visible
  revalidateIfStale: true,
  // Don't refresh data in the background
  refreshWhenHidden: false,
  // Don't refresh data when offline
  refreshWhenOffline: false,
  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,
  // Retry failed requests up to 3 times
  errorRetryCount: 3,
  // Exponential backoff for retries
  errorRetryInterval: 5000,
  // Keep previous data while revalidating
  keepPreviousData: true,
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={swrGlobalConfig}>
      {children}
    </SWRConfig>
  );
}
