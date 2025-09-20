"use client";

import React, { useState } from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";

type TrialCardProps = {
  title: string;
  description: string;
  bgColor: string;
  icon: React.ReactNode;
  buttonText: string;
};

const TrialCard = ({ title, description, bgColor, icon, buttonText }: TrialCardProps) => {
  const { theme } = useThemeContext();

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
            e.currentTarget.style.backgroundColor = theme.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.button.secondary.background;
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default function TrialIntroSection() {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [tab, setTab] = useState("Explore");

  const trialCards = [
    {
      title: t('trial.cards.inviteTeam.title'),
      description: t('trial.cards.inviteTeam.description'),
      bgColor: "bg-blue-50",
      buttonText: t('trial.cards.inviteTeam.button'),
      icon: (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">👥</span>
        </div>
      ),
    },
    {
      title: t('trial.cards.createProject.title'),
      description: t('trial.cards.createProject.description'),
      bgColor: "bg-green-50",
      buttonText: t('trial.cards.createProject.button'),
      icon: (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">📁</span>
        </div>
      ),
    },
    {
      title: t('trial.cards.moveToProduction.title'),
      description: t('trial.cards.moveToProduction.description'),
      bgColor: "bg-purple-50",
      buttonText: t('trial.cards.moveToProduction.button'),
      icon: (
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">🚀</span>
        </div>
      ),
    },
  ];

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
          {t('trial.title')}{" "}
          <span className="text-sm text-green-600 ml-2">{t('trial.daysLeft')}</span>
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
          {t('trial.tabs.explore')}
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
          {t('trial.tabs.manage')}
        </button>
      </div>

      {/* Description */}
      {tab === "Explore" && (
        <>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            {t('trial.description')}
          </p>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trialCards.map((card, index) => (
              <TrialCard
                key={index}
                title={card.title}
                description={card.description}
                bgColor={card.bgColor}
                buttonText={card.buttonText}
                icon={card.icon}
              />
            ))}
          </div>
        </>
      )}

      {tab === "Manage" && (
        <p className="text-sm italic" style={{ color: theme.text.secondary }}>
          {t('trial.manageContent')}
        </p>
      )}
    </div>
  );
}
