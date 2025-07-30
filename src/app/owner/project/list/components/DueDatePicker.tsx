"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Calendar, X } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

interface DueDatePickerProps {
  initialDate?: string | null; // YYYY-MM-DD
  onChange: (date: Date | null) => void;
}

export default function DueDatePicker({
  initialDate,
  onChange,
}: DueDatePickerProps) {
  const [dueDate, setDueDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );

  useEffect(() => {
    onChange(dueDate);
  }, [dueDate]);

  const isOverdue = dueDate ? isBefore(dueDate, startOfToday()) : false;

  return (
    <div className="flex items-center gap-3 ">
      <div className="text-sm font-medium text-gray-700 min-w-[70px]">Due date</div>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${
            isOverdue
              ? "border-red-500 text-red-600"
              : "border-green-400 text-green-600"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <DatePicker
            selected={dueDate}
            onChange={(date: Date | null) => setDueDate(date)}
            placeholderText="Pick a date"
            className="bg-transparent outline-none w-24 cursor-pointer"
            dateFormat="dd MMM"
          />
        </div>

        {dueDate && (
          <button
            onClick={() => setDueDate(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
