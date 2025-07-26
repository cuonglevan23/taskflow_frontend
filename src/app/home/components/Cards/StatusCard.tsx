import React from "react";
import DashboardCard from "../DashboardCard";
import { FileText } from "lucide-react";

type Props = {};

const StatusCard = (props: Props) => {
  return (
    <DashboardCard title="Status updates">
      <div className="flex flex-col items-center justify-center mt-10 text-center">
        <div className="w-12 h-12 rounded-md border-2 border-gray-300 flex items-center justify-center relative">
          <FileText className="w-6 h-6 text-gray-400" />
          <div className="w-3 h-3 bg-gray-400 rounded-full absolute top-[-4px] right-[-4px]" />
        </div>

        <p className="mt-4 text-gray-600 max-w-xs">
          Status updates help you monitor the progress of work. You can request
          one from any project.{" "}
          <a href="#" className="underline hover:text-gray-800 transition">
            Learn more
          </a>
        </p>
      </div>
    </DashboardCard>
  );
};

export default StatusCard;
