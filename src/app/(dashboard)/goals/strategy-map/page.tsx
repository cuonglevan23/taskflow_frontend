"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

interface StrategyMapPageProps {
  timeframe?: string;
}

const StrategyMapPage: React.FC<StrategyMapPageProps> = ({ timeframe }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="h-full p-6"
      style={{ backgroundColor: theme.background.secondary }}
    >
      <div 
        className="bg-white rounded-lg p-8 h-full flex items-center justify-center"
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default 
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
};

export default StrategyMapPage;