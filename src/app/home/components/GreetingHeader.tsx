"use client";

import React from "react";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function GreetingHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500">{today}</p>
      <h1 className="text-2xl font-semibold">{getGreeting()}, Alienn704</h1>
    </div>
  );
}
