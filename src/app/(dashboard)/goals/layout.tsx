"use client";

import React from "react";
import PageLayout from "@/layouts/page/PageLayout";

interface GoalsLayoutProps {
  children: React.ReactNode;
}

const GoalsLayout = ({ children }: GoalsLayoutProps) => {
  return (
    <PageLayout>
      {/* flex-1 + min-h-0 để con chiếm toàn bộ */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </PageLayout>
  );
};

export default GoalsLayout;
