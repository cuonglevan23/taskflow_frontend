import React, { useState } from "react";
import DashboardCard from "../DashboardCard";
import { CheckCircle } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

type Props = {};

const TaskIAssignCard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const tabs = ["Upcoming", "Overdue", "Completed"];

  return (
    <div>
      <DashboardCard title="Tasks I've assigned" menuCardItems={tabs}>
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <div
            className="w-12 h-12 border-2 rounded-full flex items-center justify-center"
            style={{ borderColor: theme.border.default }}
          >
            <CheckCircle
              className="w-6 h-6"
              style={{ color: theme.text.secondary }}
            />
          </div>
          <p className="mt-4" style={{ color: theme.text.secondary }}>
            Assign tasks to your colleagues, and keep track of them here.
          </p>
          <button
            className="mt-4 px-4 py-2 rounded transition"
            style={{
              border: `1px solid ${theme.border.default}`,
              color: theme.text.primary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Assign task
          </button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default TaskIAssignCard;
