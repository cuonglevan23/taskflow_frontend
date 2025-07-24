'use client'

import React from 'react'
import { Task } from '../../../../types/task'
import { Plus } from 'lucide-react'

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
    'On track': 'bg-cyan-200 text-cyan-800',
    'Off track': 'bg-red-100 text-red-700',
    'In progress': 'bg-purple-200 text-purple-800',
}

const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white rounded-xl shadow-sm border px-4 py-3 space-y-2">
        <div className="font-medium">{task.name}</div>
        <div className="flex flex-wrap gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full ${statusColor[task.priority]}`}>
                {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full ${progressColor[task.status]}`}>
                {task.status}
            </span>
        </div>
        <div className="text-sm text-gray-600">{task.dueDate}</div>
    </div>
)

const TaskBoard = ({ sections }: { sections: TaskSection[] }) => {
    return (
        <div className="flex gap-6 overflow-x-auto px-4 py-6">
            {sections?.map((section) => (
                <div key={section.title} className="w-72 flex-shrink-0">
                    <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {section.tasks.map((task) => (
                            <TaskCard key={task.name} task={task} />
                        ))}
                    </div>
                </div>
            ))}
            <div className="w-72 flex-shrink-0">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Plus/> Section</h2>
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="bg-white rounded-xl shadow-sm border px-4 py-3 space-y-2">
                        <div className="font-medium">Add new section</div>
                        </div>
                </div>
            </div>
        </div>
    )
}

export default TaskBoard
