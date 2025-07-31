import React, { useRef, useEffect } from "react";
import { CheckCircle, User, Calendar, MoreHorizontal } from "lucide-react";
import AvatarGroup from "@/components/ui/Avatar/AvatarGroup";
import { EditableTask, TaskStatus, Assignee } from "@/types/task";
import {
  getPriorityColor,
  getStatusColor,
  getDueDateColor,
  formatDate,
} from "./utils";

interface TaskRowProps {
  task: EditableTask;
  assignees: Assignee[];
  onEdit: (
    taskId: string,
    field: "name" | "assignee" | "dueDate" | "priority" | "status",
    value: any
  ) => void;
  onToggleEdit: (
    taskId: string,
    field: "name" | "assignee" | "dueDate" | "priority" | "status"
  ) => void;
  onKeyPress: (
    e: React.KeyboardEvent,
    taskId: string,
    field: "name" | "assignee" | "dueDate" | "priority" | "status",
    value: any
  ) => void;
  onOpenDetail: (task: EditableTask) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  assignees,
  onEdit,
  onToggleEdit,
  onKeyPress,
  onOpenDetail,
}) => {
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node) &&
        task.isEditing?.assignee
      ) {
        onToggleEdit(task.id, "assignee");
      }
    };

    if (task.isEditing?.assignee) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [task.isEditing?.assignee, task.id, onToggleEdit]);

  const isEditing = Object.values(task.isEditing || {}).some(Boolean);

  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-100"
      onClick={() => {
        if (!isEditing) onOpenDetail(task);
      }}
    >
      {/* Name */}
      <td className="min-w-[200px] py-1 px-2 border-y border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-gray-400" />
          {task.isEditing?.name ? (
            <input
              type="text"
              value={task.name}
              onChange={(e) => {
                const updatedTask = { ...task, name: e.target.value };
                // optional: onEdit(task.id, 'name', updatedTask.name)
              }}
              onBlur={() => onEdit(task.id, "name", task.name)}
              onKeyDown={(e) => onKeyPress(e, task.id, "name", task.name)}
              className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggleEdit(task.id, "name");
              }}
            >
              {task.name}
            </span>
          )}
        </div>
      </td>

      {/* Assignee */}
      <td className="min-w-[180px] py-1 px-2 border border-gray-200">
        {task.isEditing?.assignee ? (
          <div className="relative" ref={assigneeDropdownRef}>
            <div className="absolute z-10 bg-white border rounded shadow-md w-64 p-2 max-h-48 overflow-y-auto space-y-1">
              {assignees.map((assignee) => {
                const isSelected = task.assignee.includes(assignee.name);
                return (
                  <label
                    key={assignee.id}
                    className={`flex items-center gap-2 py-1 rounded cursor-pointer ${
                      isSelected ? "bg-blue-100" : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelection = e.target.checked
                          ? [...task.assignee, assignee.name]
                          : task.assignee.filter((name) => name !== assignee.name);
                        onEdit(task.id, "assignee", newSelection);
                      }}
                    />
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm w-full">{assignee.name}</span>
                  </label>
                );
              })}
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEdit(task.id, "assignee");
                  }}
                  className="text-sm px-2 py-1 rounded border hover:bg-gray-100"
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggleEdit(task.id, "assignee");
            }}
          >
            {task.assignee.length > 0 ? (
              <>
                <AvatarGroup
                  users={task.assignee.map((name) => {
                    const user = assignees.find((a) => a.name === name);
                    return { name, src: user?.avatar };
                  })}
                  maxVisible={2}
                />
                <span className="text-sm">{task.assignee[0]}</span>
              </>
            ) : (
              <User className="w-6 h-6 text-gray-500 border border-gray-400 rounded-full p-1 ml-1 hover:border-gray-500 hover:text-gray-700" />
            )}
          </div>
        )}
      </td>

      {/* Due Date */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.dueDate ? (
          <input
            type="date"
            value={
              task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const date = e.target.value;
              onEdit(task.id, "dueDate", date ? formatDate(date) : "");
              e.stopPropagation();
            }}
            onBlur={(e) => {
              e.stopPropagation();
              onToggleEdit(task.id, "dueDate");
            }}
            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span
            className={`flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm ${getDueDateColor(task.dueDate)}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleEdit(task.id, "dueDate");
            }}
          >
            {task.dueDate ? (
              <>
                <Calendar className="w-4 h-4" />
                {task.dueDate}
              </>
            ) : (
              <Calendar className="w-4 h-4 text-gray-400" />
            )}
          </span>
        )}
      </td>

      {/* Priority */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.priority ? (
          <select
            value={task.priority}
            onChange={(e) => onEdit(task.id, "priority", e.target.value)}
            onBlur={() => onToggleEdit(task.id, "priority")}
            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getPriorityColor(
              task.priority
            )}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleEdit(task.id, "priority");
            }}
          >
            {task.priority}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="min-w-[100px] py-1 px-2 border border-gray-200">
        {task.isEditing?.status ? (
          <select
            value={task.status}
            onChange={(e) => onEdit(task.id, "status", e.target.value)}
            onBlur={() => onToggleEdit(task.id, "status")}
            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          >
            {Object.values(TaskStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusColor(
              task.status
            )}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleEdit(task.id, "status");
            }}
          >
            {task.status}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="min-w-[70px] py-1 px-2 border-l border-y border-gray-200">
        <div className="flex items-center gap-1">
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </td>
    </tr>
  );
};

export default TaskRow;
