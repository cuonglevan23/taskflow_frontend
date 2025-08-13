"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';
import { Filter, Download, Settings, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui';

interface GoalsLayoutProps {
  children: React.ReactNode;
}

function GoalsContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [timeframe, setTimeframe] = useState("This Quarter");

  const handleExport = () => {
    console.log('Export goals data');
  };

  const handleFilter = () => {
    console.log('Open filter modal');
  };

  const handleTimeframeChange = () => {
    console.log('Change timeframe');
  };

  const handleSettings = () => {
    console.log('Open goals settings');
  };

  // Clone children with any needed props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      try {
        return React.cloneElement(child as React.ReactElement<any>, { timeframe });
      } catch (error) {
        console.warn('Failed to clone element:', error);
        return child;
      }
    }
    return child;
  });

  return (
    <>
      {/* Shared Header for all Goals tabs */}
      <div 
        className="sticky top-0 z-30 shadow-sm border-b" 
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          width: '100%'
        }}
      >
        <div className="flex items-center justify-between py-4 px-6">
          {/* Left side - Timeframe */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTimeframeChange}
              leftIcon={<Target className="w-4 h-4" />}
            >
              {timeframe}
            </Button>
          </div>
          
          {/* Right side - Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFilter}
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filter
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettings}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="h-[calc(100vh-228px)] overflow-hidden">
        {childrenWithProps}
      </div>
    </>
  );
};

const GoalsLayout = ({ children }: GoalsLayoutProps) => {
  return (
    <PageLayout>
      <GoalsContent>
        {children}
      </GoalsContent>
    </PageLayout>
  );
};

export default GoalsLayout;