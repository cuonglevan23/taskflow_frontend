"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

interface StrategyMapPageProps {
  timeframe?: string;
}

export default function StrategyMapPage({ timeframe }: StrategyMapPageProps) {
  const { theme } = useTheme();

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-lg p-10 w-full max-w-3xl h-[80%]"
        style={{
          backgroundColor: theme.background.primary,
          border: `1px solid ${theme.border.default}`,
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: theme.text.primary }}
          >
            Strategy Map
          </h2>
          <p
            className="text-lg mb-4"
            style={{ color: theme.text.secondary }}
          >
            Visual representation of strategic goals and their relationships will be implemented here
          </p>
          {timeframe && (
            <p
              className="text-sm"
              style={{ color: theme.text.secondary }}
            >
              Timeframe: {timeframe}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
