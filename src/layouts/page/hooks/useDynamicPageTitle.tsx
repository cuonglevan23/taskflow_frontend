"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Custom hook to dynamically update page navigation config
export function useDynamicPageTitle(title: string) {
  const pathname = usePathname();
  const titleRef = useRef<string>(title);
  
  useEffect(() => {
    titleRef.current = title;
    
    // Find and update the page header if it exists
    const headerElement = document.querySelector('[data-page-title]');
    if (headerElement) {
      headerElement.textContent = title;
    }
    
    // Also update document title
    if (typeof document !== 'undefined') {
      document.title = `${title} - TaskManager`;
    }
  }, [title, pathname]);

  return titleRef.current;
}