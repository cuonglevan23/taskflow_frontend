import React from "react";

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div
      className={`bg-slate-50 hover:bg-indigo-50  shadow rounded p-4 flex flex-col gap-2 items-start`}
    >
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-gray-400">{icon}</div>
    </div>
  );
}
