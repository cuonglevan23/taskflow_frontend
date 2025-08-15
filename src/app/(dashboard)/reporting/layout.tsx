"use client";

import React, { useState } from 'react';
import PageLayout from '@/layouts/page/PageLayout';
import { useTheme } from '@/layouts/hooks/useTheme';
import { usePathname } from 'next/navigation';
import { Filter, Download, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui';

interface ReportingLayoutProps {
  children: React.ReactNode;
}

function ReportingContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState("Last 30 days");

  const handleExport = () => {
    console.log('Export report data');
  };

  const handleFilter = () => {
    console.log('Open filter modal');
  };

  const handleDateRangeChange = () => {
    console.log('Change date range');
  };

  const handleSettings = () => {
    console.log('Open report settings');
  };

  // Check if we're on a dashboard detail page
  const isDashboardDetailPage = pathname?.match(/\/reporting\/dashboards\/[^/]+$/);

  // Clone children with any needed props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      try {
        return React.cloneElement(child, { dateRange } as any);
      } catch (error) {
        console.warn('Failed to clone element:', error);
        return child;
      }
    }
    return child;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Shared Header for all Reporting tabs - Hide on dashboard detail pages */}
      {!isDashboardDetailPage && (
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
            {/* Left side - Date Range */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDateRangeChange}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                {dateRange}
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
      )}

      {/* Tab Content */}
      <div className={isDashboardDetailPage ? "flex-1 overflow-hidden" : "h-[calc(100vh-228px)] overflow-hidden"}>
        {childrenWithProps}
      </div>
    </div>
  );
};

const ReportingLayout = ({ children }: ReportingLayoutProps) => {
  return (
    <PageLayout>
      <ReportingContent>
        {children}
      </ReportingContent>
    </PageLayout>
  );
};

export default ReportingLayout;