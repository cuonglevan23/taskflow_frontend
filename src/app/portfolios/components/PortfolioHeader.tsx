"use client";

import React from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

// Header Component - Reusable & Simple
interface PortfolioHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const PortfolioHeader = ({
  title = "Portfolios",
  subtitle,
  className = ""
}: PortfolioHeaderProps) => {
  const { theme } = useTheme();
  
  return (
    <div className={`mb-8 ${className}`}>
      <h1 
        className="text-2xl font-semibold"
        style={{ color: theme.text.primary }}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className="text-sm mt-2"
          style={{ color: theme.text.secondary }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PortfolioHeader;