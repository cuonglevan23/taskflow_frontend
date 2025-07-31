"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { DetailPanelData } from "@/types/detail-panel";

interface DetailPanelContextType {
  isOpen: boolean;
  data: DetailPanelData | null;
  openPanel: (data: DetailPanelData) => void;
  closePanel: () => void;
}

const DetailPanelContext = createContext<DetailPanelContextType | undefined>(
  undefined
);

export function DetailPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<DetailPanelData | null>(null);
  const { theme } = useTheme();

  const openPanel = useCallback((newData: DetailPanelData) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    // Optional: Clear data after animation completes
    setTimeout(() => setData(null), 300);
  }, []);

  const value = {
    isOpen,
    data,
    openPanel,
    closePanel,
  };

  return (
    <DetailPanelContext.Provider value={value}>
      {children}
    </DetailPanelContext.Provider>
  );
}

export function useDetailPanel() {
  const context = useContext(DetailPanelContext);
  if (context === undefined) {
    throw new Error("useDetailPanel must be used within a DetailPanelProvider");
  }
  return context;
}
