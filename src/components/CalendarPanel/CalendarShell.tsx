// src/layouts/CalendarShell.tsx
import { ReactNode, useState } from "react";
import CalendarHeader from "@/components/calendar/CalendarHeader";
import { addMonths, subMonths, format, addWeeks, subWeeks } from "date-fns";

interface CalendarShellProps {
  children: (context: { currentDate: Date; view: ViewMode }) => ReactNode;
  renderHeaderActions?: ReactNode;
}

type ViewMode = "month" | "week" | "day";

export default function CalendarShell({
  children,
  renderHeaderActions,
}: CalendarShellProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");

  const goToToday = () => setCurrentDate(new Date());

  const goToPrev = () => {
    setCurrentDate((prev) =>
      view === "month"
        ? subMonths(prev, 1)
        : view === "week"
        ? subWeeks(prev, 1)
        : new Date(prev.setDate(prev.getDate() - 1))
    );
  };

  const goToNext = () => {
    setCurrentDate((prev) =>
      view === "month"
        ? addMonths(prev, 1)
        : view === "week"
        ? addWeeks(prev, 1)
        : new Date(prev.setDate(prev.getDate() + 1))
    );
  };

  const onChangeView = (newView: ViewMode) => {
    setView(newView);
  };

  return (
    <div className="bg-white min-h-screen text-black">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        onChangeView={onChangeView}
        extraActions={renderHeaderActions}
      />
      <div className="p-4">{children({ currentDate, view })}</div>
    </div>
  );
}
