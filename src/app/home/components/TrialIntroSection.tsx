"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";

type TrialCardProps = {
  title: string;
  description: string;
  bgColor: string;
  icon: React.ReactNode;
};
const TrialCard = ({ title, description, bgColor, icon }: TrialCardProps) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-5 ${bgColor} flex flex-col h-full`}>
      <div className="mb-2">{icon}</div>
      <h3 className="font-semibold" style={{ color: theme.text.primary }}>
        {title}
      </h3>
      <p className="text-sm mb-3" style={{ color: theme.text.secondary }}>
        {description}
      </p>

      <div className="mt-auto">
        <button
          className="px-4 py-2 text-sm rounded-md transition-colors"
          style={{
            backgroundColor: theme.button.secondary.background,
            color: theme.button.secondary.text,
            border: `1px solid ${theme.border.default}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              theme.button.secondary.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              theme.button.secondary.background;
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
};

export default function TrialIntroSection() {
  const [tab, setTab] = useState<"Explore" | "Manage">("Explore");

  const { theme } = useTheme();

  return (
    <div
      className="p-6 rounded-lg shadow space-y-4"
      style={{ backgroundColor: theme.background.secondary }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className="text-lg font-semibold"
          style={{ color: theme.text.primary }}
        >
          Advanced trial{" "}
          <span className="text-sm text-green-600 ml-2">12 days left</span>
        </h2>
      </div>

      {/* Tabs */}
      <div
        className="flex space-x-4 text-sm font-medium border-b pb-2"
        style={{ borderColor: theme.border.default }}
      >
        <button
          className="pb-1 transition-colors"
          style={{
            borderBottom:
              tab === "Explore" ? `2px solid ${theme.text.primary}` : "none",
            color:
              tab === "Explore" ? theme.text.primary : theme.text.secondary,
          }}
          onClick={() => setTab("Explore")}
        >
          Explore
        </button>
        <button
          className="pb-1 transition-colors"
          style={{
            borderBottom:
              tab === "Manage" ? `2px solid ${theme.text.primary}` : "none",
            color: tab === "Manage" ? theme.text.primary : theme.text.secondary,
          }}
          onClick={() => setTab("Manage")}
        >
          Manage
        </button>
      </div>

      {/* Description */}
      {tab === "Explore" && (
        <>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Discover popular ways that teams use ManaKai during their trial.
          </p>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TrialCard
              title="Work intake"
              description="Standardize intake, assess resourcing needs, and manage approvals, all in one place."
              bgColor="bg-blue-50"
              icon={<span className="text-blue-600 text-xl">📋</span>}
            />
            <TrialCard
              title="Goal management"
              description="Connect your company objectives and the work that supports them, so teams can get the right things done."
              bgColor="bg-green-50"
              icon={<span className="text-green-600 text-xl">🎯</span>}
            />
            <TrialCard
              title="Project management"
              description="Track projects from start to finish to keep your team in sync and hitting goals on schedule."
              bgColor="bg-red-50"
              icon={<span className="text-red-600 text-xl">📅</span>}
            />
          </div>
        </>
      )}

      {tab === "Manage" && (
        <p className="text-sm italic" style={{ color: theme.text.secondary }}>
          Manage tab content coming soon...
        </p>
      )}
    </div>
  );
}
