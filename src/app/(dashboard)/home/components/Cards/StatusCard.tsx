import React from "react";
import DashboardCard from "../DashboardCard";
import { FileText } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

type Props = {};

const StatusCard = (props: Props) => {
  const { theme } = useTheme();

  return (
    <DashboardCard title="Status updates">
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
          Status updates help you monitor the progress of work. You can request
          one from any project.{" "}
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
            Learn more
          </a>
        </p>
      </div>
    </DashboardCard>
  );
};

export default StatusCard;
