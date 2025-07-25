"use client";

import { useState, useCallback } from "react";

export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return {
    isOpen,
    onOpen: useCallback(() => setIsOpen(true), []),
    onClose: useCallback(() => setIsOpen(false), []),
    onToggle: useCallback(() => setIsOpen((prev) => !prev), []),
  };
}
