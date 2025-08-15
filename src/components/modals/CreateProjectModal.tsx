"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import "@/app/globals.css";
import {
  Calendar,
  FileText,
  Mail,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import Input from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useProjects } from "@/hooks";
import { GrProjects } from "react-icons/gr";

/* ===================== Types ===================== */
export type FormData = {
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD (native date input)
  endDate?: string;
  pmEmail: string;
  status: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: "Planned", color: "bg-blue-500" },
  { label: "In Progress", color: "bg-yellow-500" },
  { label: "Blocked", color: "bg-red-500" },
  { label: "At Risk", color: "bg-orange-500" },
  { label: "Completed", color: "bg-green-500" },
  { label: "Cancelled", color: "bg-gray-500" },
];

const PROJECT_COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

/* ===================== Helpers ===================== */
const formatYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getCalendarGrid = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  const startDay = firstDay.getDay(); // 0 = Sun
  start.setDate(firstDay.getDate() - startDay);

  const days: Date[] = [];
  const current = new Date(start);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

/* ===================== Stateless Subcomponents ===================== */
const MonthLabel: React.FC<{ date: Date }> = ({ date }) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return (
    <span className="font-semibold">
      {months[date.getMonth()]} {date.getFullYear()}
    </span>
  );
};

const CalendarPopover: React.FC<{
  month: Date;
  setMonth: (d: Date) => void;
  onSelect: (d: Date) => void;
  minDate?: string; // YYYY-MM-DD
  theme: ReturnType<typeof useTheme>["theme"];
  todayYMD: string;
}> = ({ month, setMonth, onSelect, minDate, theme, todayYMD }) => {
  const days = getCalendarGrid(month);
  const min = minDate ? new Date(minDate) : undefined;

  const isDisabled = (d: Date) =>
    min
      ? d < new Date(min.getFullYear(), min.getMonth(), min.getDate())
      : false;

  return (
    <div
      className="rounded-lg shadow-lg border p-3 w-72"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        color: theme.text.primary,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-600/20"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <MonthLabel date={month} />
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-600/20"
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs mb-1 opacity-70">
        {"SUN MON TUE WED THU FRI SAT".split(" ").map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, idx) => {
          const inMonth = d.getMonth() === month.getMonth();
          const isToday = formatYMD(d) === todayYMD;
          const disabled = isDisabled(d) || !inMonth;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={`h-8 rounded text-sm ${
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-600/20"
              } ${isToday ? "ring-1" : ""}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ===================== Main Component ===================== */
export default function CreateProjectModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { addProject } = useProjects();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      pmEmail: "",
      status: "Planned",
    },
  });

  const today = useMemo(() => formatYMD(new Date()), []);
  const startDateValue = watch("startDate");
  const statusValue = watch("status");

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isStartCalOpen, setIsStartCalOpen] = useState(false);
  const [isEndCalOpen, setIsEndCalOpen] = useState(false);
  const [startMonth, setStartMonth] = useState<Date>(new Date());
  const [endMonth, setEndMonth] = useState<Date>(new Date());
  // Colors are assigned randomly on submit; no UI selection needed

  const handleStatusChange = (status: string) => {
    setValue("status", status, { shouldDirty: true });
    setIsStatusOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    if (data.endDate) {
      if (data.endDate < today) {
        setError("endDate", { message: "End date cannot be in the past" });
        return;
      }
      if (data.endDate < data.startDate) {
        setError("endDate", {
          message: "End date must be after or equal to start date",
        });
        return;
      }
    }

    try {
      // Create projects using global projects system
      const randomColor =
        PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
      const newProject = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        pmEmail: data.pmEmail,
        status: (() => {
          switch (data.status) {
            case "Completed":
              return "completed" as const;
            case "Cancelled":
              return "archived" as const;
            default:
              return "active" as const;
          }
        })(),
        color: randomColor,
        icon: GrProjects,
        tasksDue: 0,
      };

      // Add to global projects system
      addProject(newProject);

      console.log("Creating projects:", newProject);
      await new Promise((res) => setTimeout(res, 300));

      reset();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to create projects:", error);
    }
  };

  return (
   <></>
  );
}
