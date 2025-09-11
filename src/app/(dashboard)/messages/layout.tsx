import React from 'react';
import PrivateLayout from "@/layouts/private/PrivateLayout";

interface MessagesLayoutProps {
  children: React.ReactNode;
}

export default function MessagesLayout({ children }: MessagesLayoutProps) {
  return (
    <PrivateLayout>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </PrivateLayout>
  );
}
