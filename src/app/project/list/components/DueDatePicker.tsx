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
    <>
      <style jsx global>{`
        /* Calendar grid lines styling */
        .react-datepicker__month-container {
          background: #2d3748 !important;
          border: 1px solid #4a5568 !important;
          border-radius: 8px !important;
        }
        
        .react-datepicker__header {
          background: #2d3748 !important;
          border-bottom: 1px solid #4a5568 !important;
          color: #e2e8f0 !important;
        }
        
        .react-datepicker__navigation--previous,
        .react-datepicker__navigation--next {
          border: none !important;
        }
        
        .react-datepicker__navigation--previous:before,
        .react-datepicker__navigation--next:before {
          border-color: #e2e8f0 !important;
        }
        
        .react-datepicker__current-month {
          color: #e2e8f0 !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day-names {
          border-bottom: 1px solid #4a5568 !important;
        }
        
        .react-datepicker__day-name {
          color: #a0aec0 !important;
          font-weight: 500 !important;
          border-right: 1px solid #4a5568 !important;
          width: 2.5rem !important;
          height: 2rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-datepicker__day-name:last-child {
          border-right: none !important;
        }
        
        .react-datepicker__week {
          display: flex !important;
          border-bottom: 1px solid #4a5568 !important;
        }
        
        .react-datepicker__week:last-child {
          border-bottom: none !important;
        }
        
        .react-datepicker__day {
          color: #e2e8f0 !important;
          border-right: 1px solid #4a5568 !important;
          width: 2.5rem !important;
          height: 2.5rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          border-radius: 0 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        .react-datepicker__day:last-child {
          border-right: none !important;
        }
        
        .react-datepicker__day:hover {
          background: #4a5568 !important;
          color: #ffffff !important;
          border-radius: 4px !important;
        }
        
        .react-datepicker__day--selected {
          background: #3182ce !important;
          color: #ffffff !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--today {
          background: #2b6cb0 !important;
          color: #ffffff !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #718096 !important;
        }
        
        .react-datepicker__day--disabled {
          color: #4a5568 !important;
          cursor: not-allowed !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background: #4a5568 !important;
          color: #ffffff !important;
        }
        
        .react-datepicker__triangle {
          border-bottom-color: #2d3748 !important;
        }
        
        .react-datepicker__triangle:before {
          border-bottom-color: #4a5568 !important;
        }
      `}</style>
      
      <div className="flex items-center gap-3 ">
        <div className="text-sm font-medium text-gray-700 min-w-[70px]">Due date</div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded border text-sm cursor-pointer ${
              isOverdue
                ? "border-red-500 text-red-600"
                : "border-gray-600 text-gray-300"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              placeholderText="dd/mm/yyyy"
              className="bg-transparent outline-none w-full cursor-pointer"
              dateFormat="dd/MM/yyyy"
              showPopperArrow={false}
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
    </>
  );
}
