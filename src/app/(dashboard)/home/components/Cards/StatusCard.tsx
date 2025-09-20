import React from "react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import DashboardCard from "../DashboardCard";
import { FileText } from "lucide-react";

interface Props {
  className?: string;
}

const StatusCard = (props: Props) => {
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <DashboardCard title={t("statusCard.title")}>
      <div className="flex flex-col items-center justify-center mt-10 text-center">
        <div
          className="w-12 h-12 rounded-md border-2 flex items-center justify-center relative"
          style={{ borderColor: theme.border.default }}
        >
          <FileText
            className="w-6 h-6"
            style={{ color: theme.text.secondary }}
          />
          <div
            className="w-3 h-3 rounded-full absolute top-[-4px] right-[-4px]"
            style={{ backgroundColor: theme.text.secondary }}
          />
        </div>

        <p className="mt-4 max-w-xs" style={{ color: theme.text.secondary }}>
          {t("statusCard.description")}
          <a
            href="#"
            className="underline transition"
            style={{ color: theme.text.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.button.primary.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.text.primary;
            }}
          >
            {t("statusCard.learnMore")}
          </a>
        </p>
      </div>
    </DashboardCard>
  );
};

export default StatusCard;
