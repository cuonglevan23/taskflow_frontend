"use client";

import React, { useState } from "react";

type TrialCardProps = {
  title: string;
  description: string;
  bgColor: string;
  icon: React.ReactNode;
};
const TrialCard = ({ title, description, bgColor, icon }: TrialCardProps) => (
  <div className={`rounded-lg p-5 ${bgColor} flex flex-col h-full`}>
    <div className="mb-2">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-700 mb-3">{description}</p>

    <div className="mt-auto">
      <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-100">
        Get started
      </button>
    </div>
  </div>
);

export default function TrialIntroSection() {
  const [tab, setTab] = useState<"Explore" | "Manage">("Explore");

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Advanced trial{" "}
          <span className="text-sm text-green-600 ml-2">12 days left</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 text-sm font-medium border-b pb-2">
        <button
          className={`${
            tab === "Explore" ? "border-b-2 border-black" : "text-gray-500"
          } pb-1`}
          onClick={() => setTab("Explore")}
        >
          Explore
        </button>
        <button
          className={`${
            tab === "Manage" ? "border-b-2 border-black" : "text-gray-500"
          } pb-1`}
          onClick={() => setTab("Manage")}
        >
          Manage
        </button>
      </div>

      {/* Description */}
      {tab === "Explore" && (
        <>
          <p className="text-sm text-gray-700">
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
        <p className="text-sm text-gray-600 italic">
          Manage tab content coming soon...
        </p>
      )}
    </div>
  );
}
