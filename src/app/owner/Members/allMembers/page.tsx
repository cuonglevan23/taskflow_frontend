'use client';
import React, { useState } from 'react';
import { User } from '@/types/user';

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyen.a@company.com',
        role: 'Project Manager',
        team: 'Design Team',
        projectCount: 3,
        taskCount: 45,
        status: 'active',
        lastActive: '2 hours ago',
        avatarUrl: '',
    },
    {
        id: '2',
        name: 'Trần Thị B',
        email: 'tran.b@company.com',
        role: 'UI/UX Designer',
        team: 'Design Team',
        projectCount: 2,
        taskCount: 32,
        status: 'active',
        lastActive: '1 hour ago',
        avatarUrl: '',
    },
    {
        id: '3',
        name: 'Lê Văn C',
        email: 'le.c@company.com',
        role: 'Frontend Developer',
        team: 'Design Team',
        projectCount: 4,
        taskCount: 67,
        status: 'active',
        lastActive: '30 minutes ago',
        avatarUrl: '',
    },
    {
        id: '4',
        name: 'Phạm Văn D',
        email: 'pham.d@company.com',
        role: 'Mobile Developer',
        team: 'Mobile Team',
        projectCount: 2,
        taskCount: 28,
        status: 'active',
        lastActive: '4 hours ago',
        avatarUrl: '',
    },
];

const allProjects = ['Tất cả dự án', 'Dự án 1', 'Dự án 2'];
const allTeams = ['Tất cả team', 'Design Team', 'Mobile Team'];

function UserCard({ user, index }: { user: User; index: number }) {
    return (
        <div
            className="flex flex-col sm:flex-row items-start sm:items-center w-full bg-gradient-to-tr from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 gap-4 sm:gap-0 border border-transparent hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
        >
            <input type="checkbox" className="mt-1 sm:mt-0 mr-2 accent-blue-500" />
            <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-inner overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
                <div>
                    <div className="font-bold text-lg text-gray-800 flex items-center gap-6 mb-2">
                        {user.name}
                        {user.status === 'active' && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold shadow pulse-anim">
                                Active
                            </span>
                        )}
                        <div className="text-xs text-gray-400 mt-2 mb-2 ">Hoạt động: {user.lastActive}</div>
                    </div>

                    <div className="text-gray-500 text-sm font-medium mb-4">{user.email}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-blue-700 mt-2 font-semibold">
                        <span className="bg-blue-100 px-2 py-0.5 rounded">{user.role}</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded">{user.team}</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded">{user.projectCount} dự án</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded">{user.taskCount} tasks</span>
                    </div>

                </div>
            </div>
            <button className="ml-auto px-2 py-1 rounded-full hover:bg-blue-100 text-blue-500 transition-colors">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></svg>
            </button>
        </div>
    );
}

export default function AllMembersPage() {
    const [search, setSearch] = useState('');
    const [project, setProject] = useState('Tất cả dự án');
    const [team, setTeam] = useState('Tất cả team');

    const filteredUsers = mockUsers.filter(user => {
        const matchSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchProject = project === 'Tất cả dự án' || user.projectCount > 0;
        const matchTeam = team === 'Tất cả team' || user.team === team;
        return matchSearch && matchProject && matchTeam;
    });

    return (
        <div className="px-2 sm:px-6 py-6 max-w-full mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Quản lý thành viên</h1>
                    <div className="text-blue-500 text-base mt-1 font-medium">Tổng cộng {mockUsers.length} thành viên</div>
                </div>
                <div className="flex gap-2 items-center">
                    <button className="relative flex items-center px-3 py-2 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-base shadow-sm transition">
                        <span className="sr-only">Thông báo</span>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm thành viên..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-3 py-2 rounded-lg border border-blue-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[200px] shadow-sm"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-3xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 items-center">
                    <label className="font-bold text-blue-900 text-lg">Danh sách thành viên</label>
                    <div className="flex gap-2 flex-1 justify-end">
                        <select value={project} onChange={e => setProject(e.target.value)} className="border border-blue-200 rounded-lg px-3 py-2 text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
                            {allProjects.map(p => <option key={p}>{p}</option>)}
                        </select>
                        <select value={team} onChange={e => setTeam(e.target.value)} className="border border-blue-200 rounded-lg px-3 py-2 text-base bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
                            {allTeams.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    {filteredUsers.map((user, idx) => (
                        <UserCard user={user} key={user.id} index={idx} />
                    ))}
                    {filteredUsers.length === 0 && <div className="py-12 text-center text-blue-400 text-lg">Không có thành viên nào phù hợp.</div>}
                </div>
            </div>
            <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.4,0,0.2,1) both;
        }
        .pulse-anim {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0.15); }
        }
      `}</style>
        </div>
    );
}
