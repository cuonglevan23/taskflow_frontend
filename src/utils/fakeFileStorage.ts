// Fake file storage utility for demo purposes
import { TaskAttachment } from '@/components/TaskList/types';

const STORAGE_KEY = 'fake_task_attachments';

export class FakeFileStorage {
  private static getStorage(): Record<string, TaskAttachment[]> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private static setStorage(data: Record<string, TaskAttachment[]>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static getAttachments(taskId: string): TaskAttachment[] {
    const storage = this.getStorage();
    return storage[taskId] || [];
  }

  static addAttachments(taskId: string, attachments: TaskAttachment[]): void {
    const storage = this.getStorage();
    if (!storage[taskId]) {
      storage[taskId] = [];
    }
    storage[taskId].push(...attachments);
    this.setStorage(storage);
  }

  static removeAttachment(taskId: string, attachmentId: string): void {
    const storage = this.getStorage();
    if (storage[taskId]) {
      storage[taskId] = storage[taskId].filter(att => att.id !== attachmentId);
      this.setStorage(storage);
    }
  }

  static clearAttachments(taskId: string): void {
    const storage = this.getStorage();
    delete storage[taskId];
    this.setStorage(storage);
  }

  static getAllAttachments(): Record<string, TaskAttachment[]> {
    return this.getStorage();
  }
}

// Utility function to create fake attachment objects
export function createFakeAttachment(file: File, index: number = 0): TaskAttachment {
  return {
    id: `attachment_${Date.now()}_${index}`,
    name: file.name,
    url: URL.createObjectURL(file), // Create object URL for preview
    type: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: {
      id: 'current_user',
      name: 'Current User',
      avatar: undefined
    }
  };
}

// Sample fake attachments for demo
export const sampleAttachments: TaskAttachment[] = [
  {
    id: 'sample_1',
    name: 'project-mockup.png',
    url: '/public/demo.png',
    type: 'image/png',
    size: 245760,
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    uploadedBy: {
      id: 'user_1',
      name: 'John Doe',
      avatar: '/public/images/avatar1.jpg'
    }
  },
  {
    id: 'sample_2',
    name: 'requirements.docx',
    url: '#',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024000,
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    uploadedBy: {
      id: 'user_2',
      name: 'Jane Smith',
      avatar: '/public/images/avatar2.jpg'
    }
  },
  {
    id: 'sample_3',
    name: 'design-specs.pdf',
    url: '#',
    type: 'application/pdf',
    size: 2048000,
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    uploadedBy: {
      id: 'user_3',
      name: 'Mike Johnson',
      avatar: '/public/images/avatar3.jpg'
    }
  }
];
