export type User = {
  id: string;
  avatarUrl?: string;
  name: string;
  email: string;
  role: string;
  team: string;
  projectCount: number;
  taskCount: number;
  status: 'active' | 'inactive';
  lastActive: string; // ISO string hoặc mô tả thời gian
}; 