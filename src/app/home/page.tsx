"use client";

import React, { useState } from "react";
import { PrivateLayout } from "@/layouts";
import {
  getTheme,
  type ThemeMode,
} from "@/constants/theme"; 
import GreetingHeader from "./components/GreetingHeader";
import UserSummaryBar from "./components/UserSummaryBar";
import TrialIntroSection from "./components/TrialIntroSection";
import ToggleBackgroundButton from "./components/ToggleBackgroundButton";
import ProjectCard from "./components/Cards/ProjectCard";
import TaskIAssignCard from "./components/Cards/TaskIAssignCard";
import StatusCard from "./components/Cards/StatusCard";
import MyTasksCard from "./components/Cards/MyTasksCard";

export default function HomeDashboard() {
  const [themeMode] = useState<ThemeMode>("light");
  const theme = getTheme(themeMode);
  const [bgColor, setBgColor] = useState(theme.background.secondary);

  return (
    <PrivateLayout>
      <div
        className="px-30 py-10 space-y-6"
        style={{
          backgroundColor: bgColor,
          minHeight: "100vh",
        }}
      >
        <div className="text-center">
          <GreetingHeader />
        </div>

        <div className="relative flex justify-center w-full">
          <UserSummaryBar />
          <div className="absolute right-0 bottom-0">
            <ToggleBackgroundButton onColorChange={setBgColor} />
          </div>
        </div>

        <TrialIntroSection />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectCard />
          <TaskIAssignCard />
          <StatusCard />
          <MyTasksCard />
        </div>
      </div>
    </PrivateLayout>
  );
}
