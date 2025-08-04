'use client'

import React from 'react'
import { Task, TaskStatus, Assignee } from '@/types/task'
import { Plus } from 'lucide-react'
import AvatarGroup from '@/components/ui/Avatar/AvatarGroup'

type TaskSection = {
    title: string
    tasks: Task[]
}

const statusColor = {
    Low: 'bg-teal-200 text-teal-800',
    Medium: 'bg-yellow-200 text-yellow-800',
    High: 'bg-red-200 text-red-800',
}

const progressColor = {
    [TaskStatus.TO_DO]: 'bg-cyan-200 text-cyan-800',
    [TaskStatus.BLOCKED]: 'bg-red-100 text-red-700',
    [TaskStatus.IN_PROGRESS]: 'bg-purple-200 text-purple-800',
    [TaskStatus.TESTING]: 'bg-blue-200 text-blue-800',
    [TaskStatus.DONE]: 'bg-green-200 text-green-800',
}


const TaskCard = ({ task, assignees }: { task: Task; assignees?: Assignee[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 space-y-2 cursor-pointer">
        <div className="font-medium">{task.name}</div>
        <div className="flex flex-wrap gap-2 text-sm mt-4">
            <span className={`px-2 py-1 rounded-md ${statusColor[task.priority]}`}>
                {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-md ${progressColor[task.status]}`}>
                {task.status}
            </span>
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2 mt-4">
            {task.assignee.length > 0 ? (
                <AvatarGroup 
                    users={task.assignee.map(assigneeName => {
                        // Tìm assignee trong danh sách assignees nếu có
                        const assignee = assignees?.find(a => a.name === assigneeName);
                        return {
                            name: assigneeName,
                            src: assignee?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
                        };
                    })}
                    maxVisible={3}
                />
            ) : (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">?</span>
                </div>
            )}
            {task.dueDate && (
                <span className="text-gray-500">• {task.dueDate}</span>
            )}
        </div>
    </div>
)

const TaskBoard = ({ sections, assignees }: { sections: TaskSection[]; assignees?: Assignee[] }) => {
    return (
        <div className="flex gap-6 overflow-x-auto px-4 py-6">
            {sections?.map((section) => (
                <div key={section.title} className="w-72 flex-shrink-0 ">
                    <div className="flex items-center gap-2 bg-zinc-100 rounded-xl p-2">
                        <h2 className="text-lg font-semibold text-gray-600">{section.title} </h2>
                        <h2 className="text-sm text-gray-500 my-1">0</h2>
                    </div>
                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] bg-zinc-100 rounded-xl p-2 mt-2">
                        {section.tasks.map((task) => (
                            <TaskCard key={task.name} task={task} assignees={assignees} />
                        ))}
                    </div>
                </div>
            ))}
            <div className="w-72 flex-shrink-0 ">
                <div className="flex items-center gap-2 bg-zinc-100 rounded-xl p-2">
                    <h2 className="text-lg font-semibold  flex items-center gap-2 text-gray-600"><Plus /> Section</h2>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] mt-2">
                    <input type="text" placeholder="Add new section" className="bg-white w-full rounded-xl shadow-sm border border-gray-200 px-4 py-3 space-y-2" />
                </div>
            </div>
        </div>
    )
}

export default TaskBoard
