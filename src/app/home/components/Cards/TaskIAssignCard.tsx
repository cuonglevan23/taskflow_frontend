import React, { useState } from "react";
import DashboardCard from "../DashboardCard";
import { CheckCircle } from "lucide-react";

type Props = {};

const TaskIAssignCard = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const tabs = ["Upcoming", "Overdue", "Completed"];
  return (
    <div>
      <DashboardCard title="Tasks I've assigned" menuCardItems={tabs}>
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <div className="w-12 h-12 border-2 border-gray-400 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="mt-4 text-gray-600">
            Assign tasks to your colleagues, and keep track of them here.
          </p>
          <button className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition">
            Assign task
          </button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default TaskIAssignCard;
