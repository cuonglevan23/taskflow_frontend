"use client";

import { useState } from 'react';
import { ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProjectOverview } from '../context/ProjectOverviewContext';

export function ProjectRoles() {
  const { data, addMember, removeMember, loading } = useProjectOverview();
  const { theme } = useTheme();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    avatar: '',
    email: ''
  });

  const handleAddMember = async () => {
    if (newMember.name && newMember.role) {
      await addMember({
        ...newMember,
        avatar: newMember.avatar || newMember.name.substring(0, 2).toUpperCase()
      });
      setNewMember({ name: '', role: '', avatar: '', email: '' });
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Project roles</div>
      
      <div className="space-y-3">
        {data.members.map((member) => (
          <div key={member.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {member.avatar}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: theme.text.primary }}>
                  {member.name}
                </div>
                <div className="text-xs" style={{ color: theme.text.muted }}>
                  {member.role}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRemoveMember(member.id)}
              className="opacity-0 group-hover:opacity-100 p-1 transition-all"
              style={{ color: theme.text.muted }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.text.muted}
            >
              <ACTION_ICONS.close size={16} />
            </button>
          </div>
        ))}

        {/* Add Member Section */}
        {isAddingMember ? (
          <div 
            className="border rounded-md p-3 space-y-3"
            style={{ 
              borderColor: theme.border.default,
              backgroundColor: theme.background.primary
            }}
          >
            <input
              type="text"
              placeholder="Member name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: theme.border.default,
                backgroundColor: theme.background.primary,
                color: theme.text.primary
              }}
            />
            <input
              type="text"
              placeholder="Role (e.g., Developer, Designer)"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: theme.border.default,
                backgroundColor: theme.background.primary,
                color: theme.text.primary
              }}
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: theme.border.default,
                backgroundColor: theme.background.primary,
                color: theme.text.primary
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddMember}
                disabled={loading || !newMember.name || !newMember.role}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
              <button
                onClick={() => setIsAddingMember(false)}
                className="px-3 py-1.5 border text-sm rounded-md transition-colors"
                style={{
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                  backgroundColor: theme.background.primary
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.secondary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.background.primary}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ 
              color: theme.text.secondary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = theme.text.primary}
            onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
          >
            <div 
              className="w-8 h-8 rounded-full border border-dashed flex items-center justify-center"
              style={{ borderColor: theme.border.default }}
            >
              <ACTION_ICONS.create size={16} />
            </div>
            <span>Add member</span>
          </button>
        )}
      </div>
    </div>
  );
}