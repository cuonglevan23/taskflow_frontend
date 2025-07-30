import { Avatar } from "antd";
import { Plus, Goal, FolderKanban, Info, FileText, Landmark, Paperclip } from "lucide-react";

export default function Overview() {
    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 ">
            {/* Left Panel */}
            <div className="lg:col-span-3 space-y-6 px-30 max-h-[80vh] overflow-y-auto">
                {/* Project Description */}
                <div>
                    <div className="font-semibold text-sm text-neutral-500 mb-1">Project description</div>
                    <textarea
                        rows={4}
                        // className="w-full border border-neutral-300 rounded-md p-3 text-sm mt-4"
                        className="w-full  p-3 text-sm mt-4 resize-none"
                        defaultValue={`**How we'll collaborate**\nWelcome to the Marketing team! We'll be using this project to track our progress on our Q1 product launch. Final ad designs are in the “Key resources” section below. Use this Asana form to submit new ideas!`}
                    />
                </div>

                {/* Project Roles */}
                <div className=" mt-6">
                    <div className="font-semibold text-sm text-neutral-500 mb-1">Project roles</div>
                    <div className="flex items-center gap-10 mt-4">
                        <div className="flex items-center gap-2">
                            <button className="w-9 h-9 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                                <Plus size={18} />
                            </button>
                            <div className="text-sm font-medium">Add Role</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Avatar style={{ backgroundColor: '#a78bfa' }}>OH</Avatar>
                            <div>
                                <div className="text-sm font-medium">OHIHI</div>
                                <div className="text-xs text-gray-500">Project owner</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Avatar style={{ backgroundColor: '#6ee7b7' }}>D2</Avatar>
                            <div>
                                <div className="text-sm font-medium">ducdh.2lit@v...</div>
                                <div className="text-xs text-gray-500">Project Management</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Connected Goals */}
                <div className="mt-10">
                    <div className="font-semibold text-sm text-neutral-500 mb-1">Connected goals</div>
                    <div className="border min-h-[125px] border-dashed border-gray-300 p-6 rounded-lg text-center text-sm text-gray-500">
                        <Goal className="mx-auto mb-2" size={20} />
                        Connect or create a goal to link this project to a larger purpose.<br />
                        <button className="mt-2 text-indigo-600 font-medium hover:underline">Add goal</button>
                    </div>
                </div>

                {/* Key Resources */}
                <div className="mt-10">
                    <div className="font-semibold text-sm text-neutral-500 mb-1">Key resources</div>
                    <div className="border min-h-[125px] border-dashed border-gray-300 p-6 rounded-lg text-center text-sm text-gray-500">
                        Align your team around a shared vision with a project brief and supporting resources.
                        <div className="flex justify-center gap-4 mt-3">
                            <button className="flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                                <FileText size={16} /> Create project brief
                            </button>
                            <button className="flex items-center gap-1 text-indigo-600 font-medium hover:underline">
                                <Paperclip size={16} /> Add links & files
                            </button>
                        </div>
                    </div>
                </div>

                {/* Milestones */}
                <div>
                    <div className="flex items-center gap-2 font-semibold text-sm text-neutral-500 mb-1">
                        Milestones <Plus size={14} />
                    </div>
                    <div className="border-t border-gray-200 pt-2 text-sm text-gray-500">
                        <button className="flex items-center gap-2 text-green-600">
                            <Landmark size={16} /> Add milestone...
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded-md">
                    <div className="font-bold text-yellow-800 mb-1">At risk</div>
                    <div className="text-sm font-medium">DSADSDSDSADS</div>
                    <div className="text-xs text-gray-600 mt-1">OHIHI · Just now</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="font-semibold text-sm text-neutral-700">Project summary</div>
                        <Info size={16} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                        Use artificial intelligence to catch up on what's happened in this project recently.
                    </p>
                    <button className="text-sm text-indigo-600 hover:underline">View summary</button>
                </div>

                <div className="border-l border-gray-300 pl-4">
                    <div className="text-xs text-gray-400 mb-2">No due date</div>
                    <button className="text-sm text-indigo-600 mb-2">Send message to members</button>
                    <ul className="space-y-1 text-sm text-gray-700">
                        <li>🟡 DSADSDSDSADS - OHIHI · Just now</li>
                        <li>🟢 Cross-functional project plan - 29 Jul · 1 minute ago</li>
                        <li>🔴 Cross-functional project plan - 29 Jul · 2 minutes ago</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
