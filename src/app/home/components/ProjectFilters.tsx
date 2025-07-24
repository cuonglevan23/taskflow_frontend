import React from "react";

type ProjectFiltersProps = {
  keyword: string;
  status: string;
  priority: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onClearFilters: () => void;
};

const statusOptions = ["All", "On Track", "Off Track", "In Progress"];
const priorityOptions = ["All", "Low", "Medium", "High"];

export default function ProjectFilters({
  keyword,
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  onKeywordChange,
  onClearFilters,
}: ProjectFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap items-center">
      <input
        type="text"
        placeholder="Search by project or PM..."
        className="border px-4 py-2 rounded w-full max-w-sm"
        onChange={(e) => onKeywordChange(e.target.value)}
        value={keyword}
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border px-4 py-2 rounded"
      >
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="border px-4 py-2 rounded"
      >
        {priorityOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {(status !== "All" || priority !== "All") && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 border px-4 py-2 rounded text-md text-gray-700 hover:bg-gray-100 transition"
        >
          Clear <span className="text-base">×</span> 
        </button>
      )}
    </div>
  );
}
