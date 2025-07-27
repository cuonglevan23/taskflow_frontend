import React from "react";
import DashboardCard from "../DashboardCard";
import { Plus } from "lucide-react";

type Props = {};

const ProjectCard = (props: Props) => {
  return (
    <div>
      <DashboardCard title="Projects" dropdownItems={["Started", "Recents"]}>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Create Project */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-16 cursor-pointer hover:bg-gray-50 transition">
            <Plus className="w-6 h-6 text-gray-500" />
            <span className="text-sm text-gray-600 mt-1">Create project</span>
          </div>

          
          <div className="flex items-center gap-4 p-4 bg-[#C1F3ED] h-16 rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <div className="bg-white p-2 rounded-md">
              <div className="w-6 h-6 bg-[#0E3B3A] rounded-[4px] flex items-center justify-center">
                <div className="text-white font-bold text-sm">≡</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-black">Cross-functional project plan</div>
              <div className="  -sm text-gray-600">2 tasks due soon</div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ProjectCard;
