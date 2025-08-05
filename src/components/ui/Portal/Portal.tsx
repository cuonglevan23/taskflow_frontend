"use client";

import { ReactNode, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  target?: string; // CSS selector for target element
}

export default function Portal({ children, target = 'body' }: PortalProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  useLayoutEffect(() => {
    // useLayoutEffect runs synchronously before paint - prevents flicker
    const element = document.querySelector(target);
    setTargetElement(element);
  }, [target]);

  // Only check targetElement, no mounted state needed
  if (!targetElement) {
    return null;
  }

  return createPortal(children, targetElement);
}