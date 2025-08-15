"use client";

import React, { useState } from "react";
import ToggleBackgroundPanel from "./ToggleBackgroundPanel";

export default function ToggleBackgroundButton({
  onColorChange,
}: {
  onColorChange?: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm rounded px-2.5 py-1.5 bg-white hover:bg-gray-50 shadow"
      >
        <div className="flex gap-0.5">
          <div className="w-2 h-2 bg-red-400 rounded-sm" />
          <div className="w-2 h-2 bg-orange-300 rounded-sm" />
          <div className="w-2 h-2 bg-green-400 rounded-sm" />
          <div className="w-2 h-2 bg-blue-400 rounded-sm" />
        </div>
        Customize
      </button>f

      {open && (
        <ToggleBackgroundPanel
          onClose={() => setOpen(false)}
          onColorChange={(color) => {
            onColorChange?.(color);
          }}
        />
      )}
    </div>
  );
}
