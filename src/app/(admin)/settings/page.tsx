"use client";

import React, { useState } from "react";
import { SettingsContainer } from "@/components/settings";

// Settings Page Component
export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // In real app: router.back() or navigate to previous page
  };

  return (
    <SettingsContainer
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}
