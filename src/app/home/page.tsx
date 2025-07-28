"use client";

import React, { useState } from "react";
import {
  Plus,
  ClipboardList,
  Folder,
  Users,
  CheckCircle,
  BarChart,
} from "lucide-react";
import { PrivateLayout } from "@/layouts";
import GreetingHeader from "./components/GreetingHeader";
import UserSummaryBar from "./components/UserSummaryBar";
import TrialIntroSection from "./components/TrialIntroSection";
import DashboardCard from "./components/DashboardCard";
import ToggleBackgroundPanel from "./components/ToggleBackgroundPanel";
import ToggleBackgroundButton from "./components/ToggleBackgroundButton";
import ProjectCard from "./components/Cards/ProjectCard";
import TaskIAssignCard from "./components/Cards/TaskIAssignCard";
import StatusCard from "./components/Cards/StatusCard";
import MyTasksCard from "./components/Cards/MyTasksCard";

export default function HomeDashboard() {
  const [bgColor, setBgColor] = useState("#fdf9f9");

  return (
    <PrivateLayout>
      <div
        className="px-30 py-10 space-y-6"
        style={{
          backgroundColor: "#0f172a",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div className="text-center">
          <GreetingHeader></GreetingHeader>
        </div>

        <div className="relative flex justify-center w-full">
          {/* UserSummaryBar */}
          <UserSummaryBar />

          {/* Customize*/}
          <div className="absolute right-0 bottom-0">
            <ToggleBackgroundButton onColorChange={setBgColor} />
          </div>
        </div>

        {/* Trial Section */}
        <TrialIntroSection></TrialIntroSection>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ProjectCard */}
          <ProjectCard />

          <TaskIAssignCard />
          <StatusCard />
          <MyTasksCard />
        </div>
      </div>
    </PrivateLayout>
  );
}
