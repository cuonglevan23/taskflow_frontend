"use client";

import React, { useState } from 'react';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface MUIDateRangePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
  title?: string;
}

const MUIDateRangePicker: React.FC<MUIDateRangePickerProps> = ({
  isOpen,
  onClose,
  onSave,
  title = "Select Date Range"
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const handleSave = () => {
    const [startDate, endDate] = dateRange;
    
    onSave({
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
    });
    
    onClose();
  };

  const handleCancel = () => {
    setDateRange([null, null]);
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mt: 2 }}>
            <DateRangePicker
              calendars={1}
              value={dateRange}
              onChange={(newValue) => setDateRange(newValue)}
              slots={{
                textField: (params) => (
                  <div style={{ margin: '8px 0' }}>
                    {params.startDate && <div>Start: {params.startDate}</div>}
                    {params.endDate && <div>End: {params.endDate}</div>}
                  </div>
                )
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={!dateRange[0]} // Disable if no start date
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MUIDateRangePicker;