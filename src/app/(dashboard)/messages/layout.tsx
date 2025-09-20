import React from 'react';

interface MessagesLayoutProps {
  children: React.ReactNode;
}

export default function MessagesLayout({ children }: MessagesLayoutProps) {
  return (
    <div className="h-full flex flex-col">
      {children}
    </div>
  );
}
