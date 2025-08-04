import React, { useState } from "react";
import { Plus } from "lucide-react";
import { EditableTask, TaskStatus, Assignee } from "@/types/task";
import TaskSection from "./TaskSection";
import { NewTaskDataType } from "./types";
import TaskDetailPanel from "@/app/project/list/components/TaskDetailPanel";
interface TaskTableProps {
  tasks: EditableTask[];
  assignees: Assignee[];
  showAddTaskInput: boolean;
  addTaskStatus: TaskStatus | null;
  newTaskData: NewTaskDataType;
  editingNewTaskField:
    | "name"
    | "assignee"
    | "dueDate"
    | "priority"
    | "status"
    | null;
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
  onAddTaskClick: (status: TaskStatus) => void;
  onNewTaskDataChange: (field: keyof NewTaskDataType, value: any) => void;
  onEditingFieldChange: (
    field: "name" | "assignee" | "dueDate" | "priority" | "status" | null
  ) => void;
  onAddTask: () => void;
  onCancelAddTask: () => void;
  onAddTaskKeyDown: (e: React.KeyboardEvent) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  assignees,
  showAddTaskInput,
  addTaskStatus,
  newTaskData,
  editingNewTaskField,
  onEdit,
  onToggleEdit,
  onKeyPress,
  onAddTaskClick,
  onNewTaskDataChange,
  onEditingFieldChange,
  onAddTask,
  onCancelAddTask,
  onAddTaskKeyDown,
}) => {
  const sections = [
    { title: "To do", status: TaskStatus.TO_DO },
    { title: "In Progress", status: TaskStatus.IN_PROGRESS },
  ];

  const [selectedTask, setSelectedTask] = useState<EditableTask | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const handleOpenDetail = (task: EditableTask) => {
    setSelectedTask(task);
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
    setPanelOpen(false);
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide max-h-[530px] mt-2">
      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="min-w-[200px] px-2 py-2">Name</th>
            <th className="min-w-[130px] px-2 py-2">Assignee</th>
            <th className="min-w-[100px] px-2 py-2">Due date</th>
            <th className="min-w-[100px] px-2 py-2">Priority</th>
            <th className="min-w-[100px] px-2 py-2">Status</th>
            <th className="min-w-[70px] px-2 py-2">
              <Plus className="w-4 h-4" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section, index) => (
            <React.Fragment key={section.status}>
              <TaskSection
                onOpenDetail={handleOpenDetail}
                title={section.title}
                status={section.status}
                tasks={tasks}
                assignees={assignees}
                showAddTaskInput={showAddTaskInput}
                addTaskStatus={addTaskStatus}
                newTaskData={newTaskData}
                editingNewTaskField={editingNewTaskField}
                onEdit={onEdit}
                onToggleEdit={onToggleEdit}
                onKeyPress={onKeyPress}
                onAddTaskClick={onAddTaskClick}
                onNewTaskDataChange={
                  onNewTaskDataChange as (
                    field: string | number | symbol,
                    value: any
                  ) => void
                }
                onEditingFieldChange={onEditingFieldChange}
                onAddTask={onAddTask}
                onCancelAddTask={onCancelAddTask}
                onAddTaskKeyDown={onAddTaskKeyDown}
              />
              {index < sections.length - 1 && <tr className="h-10"></tr>}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          isOpen={panelOpen}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
};

export default TaskTable;
