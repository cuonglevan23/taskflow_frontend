"use client";

import { ReactNode } from "react";
import { BreadcrumbItem } from "../../types";

interface PrivateMainProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  className?: string;
}

export default function PrivateMain({
  children,
  breadcrumbs,
  showBreadcrumbs = true,
}: PrivateMainProps) {
  return (
    <div className="lg:ml-64 pt-16">
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-white border-b px-4 lg:px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                <span
                  className={
                    crumb.isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }
                >
                  {crumb.title}
                </span>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
