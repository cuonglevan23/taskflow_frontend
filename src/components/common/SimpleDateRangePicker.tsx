"use client";

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface SimpleDateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  title?: string;
}

const SimpleDateRangePicker: React.FC<SimpleDateRangePickerProps> = ({
  isOpen,
  onClose,
  onSave,
  title = "Select Date Range"
}) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleSave = () => {
    onSave({
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
    });
    
    // Reset and close
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  const handleCancel = () => {
    setStartDate(null);
    setEndDate(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">{title}</h2>
        
        <div className="space-y-4">
          <DatePicker
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            rangeSeparator=" to "
            inline
            className="w-full"
            calendarClassName="shadow-lg border border-gray-200 rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!startDate} // Disable if no start date
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDateRangePicker;