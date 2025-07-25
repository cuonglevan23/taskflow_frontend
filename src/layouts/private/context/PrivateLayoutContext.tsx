"use client";

import { createContext, useContext, ReactNode } from "react";
import { LayoutContextValue, LayoutActions } from "../../types";
import { usePrivateLayout } from "../hooks/usePrivateLayout";

interface PrivateLayoutContextValue {
  context: LayoutContextValue;
  actions: LayoutActions;
}

const PrivateLayoutContext = createContext<
  PrivateLayoutContextValue | undefined
>(undefined);

interface PrivateLayoutProviderProps {
  children: ReactNode;
}

export function PrivateLayoutProvider({
  children,
}: PrivateLayoutProviderProps) {
  const layoutData = usePrivateLayout();

  return (
    <PrivateLayoutContext.Provider value={layoutData}>
      {children}
    </PrivateLayoutContext.Provider>
  );
}

export function usePrivateLayoutContext(): PrivateLayoutContextValue {
  const context = useContext(PrivateLayoutContext);

  if (context === undefined) {
    throw new Error(
      "usePrivateLayoutContext must be used within a PrivateLayoutProvider"
    );
  }

  return context;
}

// Individual hooks for specific parts of the layout
export function useLayoutContext(): LayoutContextValue {
  const { context } = usePrivateLayoutContext();
  return context;
}

export function useLayoutActions(): LayoutActions {
  const { actions } = usePrivateLayoutContext();
  return actions;
}
