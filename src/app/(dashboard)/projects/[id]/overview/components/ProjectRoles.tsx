"use client";

import { useState, useMemo } from 'react';
import { ACTION_ICONS } from '@/constants/icons';
import { useTheme } from '@/layouts/hooks/useTheme';
import { useProject } from '../../components/DynamicProjectProvider';
import { useUser } from '@/contexts/UserContext';
import Avatar from '@/components/ui/Avatar/Avatar';
import { InviteModal, type InviteFormData } from '@/components/modals';
import useSWR, { mutate } from 'swr';

export function ProjectRoles() {
  const { project } = useProject();
  const { user } = useUser();
  const { theme } = useTheme();
  
  // Create default members from project creator and current user
  const defaultMembers = useMemo(() => {
    if (!project || !user) return [];
    
    const members = [];
    
    // Add project creator as owner if different from current user
    if (project.createdBy && project.createdBy !== user.id) {
      members.push({
        id: project.createdBy,
        name: project.createdByName || `User ${project.createdBy}`,
        role: 'Project Owner',
        avatar: project.createdByName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
        email: project.createdByEmail || ''
      });
    }
    
    // Add current user
    members.push({
      id: user.id,
      name: user.name || user.email?.split('@')[0] || 'Current User',
      role: project.createdBy === user.id ? 'Project Owner' : 'Member',
      avatar: user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      email: user.email || ''
    });
    
    return members;
  }, [project, user]);
  
  // Use existing global hooks instead of redundant context
  const { data: teamMembers, mutate: mutateMembers } = useSWR(
    project?.id ? `project-${project.id}-members` : null,
    async () => {
      // Use project creator and current user as default members
      return defaultMembers;
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteMembers = async (inviteData: InviteFormData) => {
    setLoading(true);
    try {
      // Parse emails and create member data
      const emails = inviteData.emails.split(',').map(email => email.trim());
      const newMembers = emails.map(email => ({
        id: `invite-${Date.now()}-${Math.random()}`,
        name: email.split('@')[0], // Use email prefix as name
        role: 'Member',
        avatar: email.split('@')[0].substring(0, 2).toUpperCase(),
        email: email
      }));
      
      // Optimistic update - add invited members to list
      await mutateMembers([...teamMembers, ...newMembers], false);
      
      // TODO: Real API call when backend is ready
      // await projectsService.inviteProjectMembers(Number(project.id), inviteData);
      
      console.log('Invited members to project:', project?.name, inviteData);
      
      // Revalidate to get real data
      await mutateMembers();
    } catch (error) {
      console.error('Failed to invite members:', error);
      // Rollback optimistic update
      await mutateMembers();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    setLoading(true);
    try {
      // Optimistic update - instant UI response  
      const updatedMembers = teamMembers.filter(m => m.id !== memberId);
      await mutateMembers(updatedMembers, false);
      
      // TODO: Real API call when backend is ready
      // await projectsService.removeProjectMember(Number(project.id), memberId);
      
      // Revalidate to get real data
      await mutateMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      // Rollback optimistic update
      await mutateMembers();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm" style={{ color: theme.text.secondary }}>Project roles</div>
      
      <div className="space-y-3">
        {(teamMembers || []).map((member) => (
          <div key={member.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <Avatar
                src={member.avatar?.startsWith('http') ? member.avatar : undefined}
                name={member.name}
                size="sm"
                variant="circle"
                className="bg-blue-500 text-white"
              />
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

        {/* Add Member Button */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ 
            color: theme.text.secondary,
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = theme.text.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
        >
          <Avatar
            size="sm"
            variant="circle"
            className="border border-dashed"
            style={{ borderColor: theme.border.default, backgroundColor: 'transparent' }}
          >
            <ACTION_ICONS.create size={16} style={{ color: theme.text.secondary }} />
          </Avatar>
          <span>Invite member</span>
        </button>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteMembers}
        projects={project ? [{ 
          id: project.id.toString(), 
          name: project.name,
          icon: '📋'
        }] : []}
      />
    </div>
  );
}