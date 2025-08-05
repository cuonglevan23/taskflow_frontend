import { TaskListItem } from "@/components/TaskList";

// Sample data - In real app, this would come from API or state management
export const SAMPLE_TASKS: TaskListItem[] = [
  {
    id: "1",
    name: "Remember to add discussion topics for the next meeting",
    description: "Prepare agenda items and key points for the upcoming team meeting",
    assignees: [
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" }
    ],
    dueDate: "2024-01-15",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    startTime: "14:00",
    endTime: "15:30",
    hasStartTime: true,
    hasEndTime: true,
    priority: "high",
    status: "todo",
    tags: ["meeting", "planning"],
    project: "cuongly.21ad / levancuong",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Learn more about how to run effective 1:1s",
    description: "Research best practices for conducting productive one-on-one meetings",
    assignees: [
      { id: "2", name: "Jane Smith", email: "jane@example.com" }
    ],
    dueDate: "2024-01-20",
    priority: "medium",
    status: "in_progress",
    tags: ["learning", "management"],
    project: "cuongly.21ad / levancuong",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
  },
  {
    id: "3",
    name: "If not already scheduled, set up a recurring 1:1 meeting in your calendar",
    description: "Schedule regular one-on-one meetings with team members",
    assignees: [
      { id: "1", name: "John Doe", email: "john@example.com" }
    ],
    dueDate: "2024-01-18",
    priority: "high",
    status: "todo",
    tags: ["calendar", "meetings"],
    project: "cuongly.21ad / levancuong",
    createdAt: "2024-01-09T10:00:00Z",
    updatedAt: "2024-01-09T10:00:00Z",
  },
  {
    id: "4",
    name: "Schedule kickoff meeting",
    description: "Organize the project kickoff meeting with all stakeholders",
    assignees: [
      { id: "3", name: "Mike Johnson", email: "mike@example.com" }
    ],
    dueDate: "2024-01-22",
    startDate: "2024-01-22",
    endDate: "2024-01-22",
    startTime: "10:00",
    hasStartTime: true,
    hasEndTime: false,
    priority: "high",
    status: "in_progress",
    tags: ["kickoff", "project"],
    project: "Cross-functional project",
    createdAt: "2024-01-11T10:00:00Z",
    updatedAt: "2024-01-13T10:00:00Z",
  },
  {
    id: "5",
    name: "Draft project brief",
    description: "Create a comprehensive project brief document",
    assignees: [
      { id: "4", name: "Sarah Wilson", email: "sarah@example.com" }
    ],
    dueDate: "2024-08-05",
    startDate: "2024-08-05",
    endDate: "2024-08-29",
    startTime: "09:00",
    endTime: "17:00",
    hasStartTime: true,
    hasEndTime: true,
    priority: "medium",
    status: "review",
    tags: ["documentation", "brief"],
    project: "Cross-functional project",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "6",
    name: "Complete project proposal",
    description: "Finalize the project proposal document",
    assignees: [
      { id: "1", name: "John Doe", email: "john@example.com" }
    ],
    dueDate: "2024-01-16",
    priority: "urgent",
    status: "done",
    tags: ["proposal", "documentation"],
    project: "Marketing Project",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  }
];