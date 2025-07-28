"use client";

import React from "react";
import DashboardCard from "../DashboardCard";
import { Plus } from "lucide-react";
import { useTheme } from "@/layouts/hooks/useTheme";

type Props = Record<string, never>;

const ProjectCard = (props: Props) => {
  const { theme } = useTheme();

  return (
    <div>
      <DashboardCard title="Projects" dropdownItems={["Started", "Recents"]}>
        <div className="grid grid-cols-2 gap-6">
          {/* Create Project */}
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-16 cursor-pointer transition"
            style={{
              borderColor: theme.border.default,
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
            <Plus className="w-6 h-6" style={{ color: theme.text.secondary }} />
            <span
              className="text-sm mt-1"
              style={{ color: theme.text.secondary }}
            >
              Create project
            </span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[#C1F3ED] h-16 rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <div className="bg-white p-2 rounded-md">
              <div className="w-6 h-6 bg-[#0E3B3A] rounded-[4px] flex items-center justify-center">
                <div className="text-white font-bold text-sm">≡</div>
              </div>
            </div>
            <div>
              <div
                className="font-medium"
                style={{ color: theme.text.primary }}
              >
                Cross-functional project plan
              </div>
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                2 tasks due soon
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ProjectCard;
