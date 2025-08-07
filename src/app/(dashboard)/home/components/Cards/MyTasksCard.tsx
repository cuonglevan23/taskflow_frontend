import React, { useState } from "react";
import DashboardCard from "../DashboardCard";
import { Plus, Lock } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

const MyTasksCard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const tabs = ["Upcoming", "Overdue (1)", "Completed"];

  const tasks = [
    {
      title: "Share timeline with teammates",
      project: "Cross-functional project plan",
      due: "Tomorrow",
    },
    {
      title: "Schedule kickoff meeting",
      project: "Cross-functional project plan",
      due: "24 – 28 Jul",
    },
  ];

  return (
    <DashboardCard title="My tasks 🔒" menuCardItems={tabs}>
      <div className="mt-4 space-y-2">
        {/* Create Task */}
        <button
          className="flex items-center text-sm transition-colors"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.text.secondary;
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create task
        </button>

        {/* Task list */}
        <div className="divide-y" style={{ borderColor: theme.border.default }}>
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span style={{ color: theme.text.secondary }}>✔</span>
                <span style={{ color: theme.text.primary }}>{task.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                  style={{
                    backgroundColor: theme.background.secondary,
                    color: theme.text.secondary,
                  }}
                >
                  <span className="w-2 h-2 bg-teal-300 rounded-full" />
                  Cross-...
                </span>
                <span className="text-xs text-emerald-600 whitespace-nowrap">
                  {task.due}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default MyTasksCard;
