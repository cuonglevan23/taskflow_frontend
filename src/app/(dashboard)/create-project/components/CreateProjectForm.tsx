"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Calendar, Clock, FileText, Mail, User } from "lucide-react";
import { useEffect } from "react";

export type FormData = {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  pmEmail: string;
  status: string;
};

interface Props {
  onNameChange: (name: string) => void;
}
export default function CreateProjectForm({ onNameChange }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
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

  const name = watch("name");

  useEffect(() => {
    onNameChange(name);
  }, [name, onNameChange]);

  const today = new Date().toISOString().split("T")[0];
  const startDateValue = watch("startDate");

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

    console.log("Creating projects:", data);
    await new Promise((res) => setTimeout(res, 1000));
    alert(`Project "${data.name}" created`);
    router.push("/project/list"); // Updated path - removed /owner
    reset();
  };

  return (
    <div className="w-full max-w-2xl  h-fit bg-white rounded-lg p-10">
      <h1 className="text-3xl font-bold mb-1">Create New Project</h1>
      <p className="text-gray-600 mb-6">
        Set up a new project with all the essential details to get started.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div>
          <label className="font-medium flex items-center gap-1 mb-1">
            <FileText className="w-4 h-4" /> Project Name *
          </label>
          <input
            {...register("name", { required: "Project name is required" })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="font-medium flex items-center gap-1 mb-1">
            <FileText className="w-4 h-4" /> Description
          </label>
          <textarea
            {...register("description")}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            placeholder="Describe the project..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="font-medium flex items-center gap-1 mb-1">
              <Calendar className="w-4 h-4" /> Start Date *
            </label>
            <input
              {...register("startDate", {
                required: "Start date is required",
                validate: (value) =>
                  value >= today || "Start date cannot be in the past",
              })}
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="font-medium flex items-center gap-1 mb-1">
              <Clock className="w-4 h-4" /> End Date (Optional)
            </label>
            <input
              {...register("endDate")}
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2"
              min={startDateValue || today}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-medium flex items-center gap-1 mb-1">
              <Mail className="w-4 h-4" /> Project Manager Email *
            </label>
            <input
              {...register("pmEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="pm@company.com"
            />
            {errors.pmEmail && (
              <p className="text-red-500 text-sm">{errors.pmEmail.message}</p>
            )}
          </div>
          <div>
            <label className="font-medium flex items-center gap-1 mb-1">
              <User className="w-4 h-4" /> Project Status *
            </label>
            <select
              {...register("status")}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option>Planned</option>
              <option>In Progress</option>
              <option>Blocked</option>
              <option>At Risk</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="border border-gray-300 px-5 py-2 rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}