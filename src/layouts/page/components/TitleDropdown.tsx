"use client";

import React, { useState } from 'react';
import { ChevronDown, Edit, Trash2, Share } from 'lucide-react';
import Dropdown, { DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown/Dropdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/Input';
import { useThemeContext } from '@/providers/ThemeProvider'; // ✅ FIXED: Import theme context
import { DARK_THEME } from '@/constants/theme';
import { useRouter } from 'next/navigation';
import { useDeleteTeam, useUpdateTeam } from '@/hooks/teams/useTeams';
import { useUpdateProject } from '@/hooks/projects/useProjects';
import { toast } from 'react-hot-toast';
import type { ProjectStatus } from '@/types/project';


interface TitleDropdownProps {
  type: 'team' | 'project';
  currentTitle: string;
  currentIcon?: React.ReactNode;
  currentId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onManageMembers?: () => void;
  onSettings?: () => void;
  className?: string;
}

const TitleDropdown: React.FC<TitleDropdownProps> = ({
  type,
  currentTitle,
  currentIcon,
  currentId,
  onEdit,
  onDelete: customOnDelete,
  onShare,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  // ✅ FIXED: Add theme context
  const { theme } = useThemeContext();

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: currentTitle,
    description: '',
    startDate: '',
    endDate: '',
    status: 'IN_PROGRESS' as ProjectStatus
  });

  const router = useRouter();

  // 🔥 NEW: Use delete team hook
  const { deleteTeam, isDeleting, error: deleteError } = useDeleteTeam();

  // 🔥 NEW: Use update team hook
  const { updateTeam, isUpdating: isTeamUpdating, error: teamUpdateError } = useUpdateTeam();

  // 🔥 NEW: Use update project hook
  const { trigger: updateProject, isMutating: isProjectUpdating, error: projectUpdateError } = useUpdateProject();

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setIsOpen(false);
  };

  const handleDeleteConfirm = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (confirmationText !== currentTitle) {
      return; // Không cho phép xóa nếu tên không khớp
    }

    try {
      if (customOnDelete) {
        // Use custom delete handler if provided
        await customOnDelete();
      } else if (type === 'team' && currentId) {
        // 🔥 NEW: Use team delete hook
        await deleteTeam(Number(currentId));

        // Show success message
        toast.success(`Team "${currentTitle}" has been deleted successfully`);

        // Navigate back to teams list
        router.push('/home');
      } else if (type === 'project' && currentId) {
        // For projects, use custom logic or project hook when available
        console.log(`Deleting project:`, currentId);
        toast.success('Project deletion will be implemented soon');
      }

      setShowDeleteDialog(false);
      setConfirmationText('');
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);

      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${type}`;
      toast.error(errorMessage);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setConfirmationText('');
  };

  // Edit handlers
  const handleEditClick = () => {
    setShowEditDialog(true);
    setIsOpen(false);
  };

  const handleEditConfirm = async () => {
    // Validate dates
    if (editForm.startDate && editForm.endDate) {
      const startDate = new Date(editForm.startDate);
      const endDate = new Date(editForm.endDate);
      if (startDate >= endDate) {
        toast.error('Ngày bắt đầu không được sau ngày kết thúc');
        return;
      }
    }

    try {
      if (type === 'project' && currentId) {
        // 🔥 FIXED: Use SWR mutation pattern with { id, data } structure
        await updateProject({ id: Number(currentId), data: editForm });
        setShowEditDialog(false);
        // No need to manually refresh - the hook handles cache updates
      } else if (type === 'team' && currentId) {
        // 🔥 NEW: Update team logic with name and description
        await updateTeam(Number(currentId), {
          name: editForm.name,
          description: editForm.description
        });
        setShowEditDialog(false);
        // No need to manually refresh - the hook handles cache updates
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      // Error handling is done by the hook
    }
  };

  const handleEditCancel = () => {
    setShowEditDialog(false);
    setEditForm({
      name: currentTitle,
      description: '',
      startDate: '',
      endDate: '',
      status: 'IN_PROGRESS' as ProjectStatus
    });
  };

  const isDeleteDisabled = confirmationText !== currentTitle || isDeleting;

  const triggerContent = (
    <div className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
      {currentIcon && (
        <div className="flex-shrink-0">
          {currentIcon}
        </div>
      )}
      <h1
        className="text-2xl font-semibold"
        style={{ color: theme.text.primary }} // ✅ FIXED: Use dynamic theme instead of DARK_THEME
      >
        {currentTitle}
      </h1>
      <ChevronDown
        className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        style={{ color: theme.text.primary }} // ✅ FIXED: Use dynamic theme instead of DARK_THEME
      />
    </div>
  );

  return (
    <>
      <Dropdown
        trigger={triggerContent}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-left"
        contentClassName="min-w-56"
        usePortal={true} // 🔥 FIXED: Enable portal rendering to avoid stacking context issues
      >
        <div className="py-2">
          {/* Edit Action */}
          <DropdownItem
            onClick={() => handleAction(handleEditClick)}
            icon={<Edit className="w-4 h-4" />}
          >
            Edit {type === 'team' ? 'Team' : 'Project'}
          </DropdownItem>

          <DropdownSeparator />

          {/* Share Action */}
          {onShare && (
            <>
              <DropdownItem
                onClick={() => handleAction(onShare)}
                icon={<Share className="w-4 h-4" />}
              >
                Share {type === 'team' ? 'Team' : 'Project'}
              </DropdownItem>
              <DropdownSeparator />
            </>
          )}

          {/* Delete Action */}
          <DropdownItem
            onClick={handleDeleteClick}
            icon={<Trash2 className="w-4 h-4" />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
          >
            Delete {type === 'team' ? 'Team' : 'Project'}
          </DropdownItem>
        </div>
      </Dropdown>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {type === 'team' ? 'Team' : 'Project'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                This action cannot be undone. This {type === 'team' ? 'team' : 'project'} will be permanently deleted
                {type === 'project' ? ' along with all tasks and related data' : ' along with all member data'}.
              </div>
              <div className="font-medium">
                To confirm, please type the {type === 'team' ? 'team' : 'project'} name: <span className="font-bold text-foreground">{currentTitle}</span>
              </div>
              <Input
                placeholder={`Type "${currentTitle}" to confirm`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="mt-2"
                disabled={isDeleting}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleteDisabled}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : `Delete ${type === 'team' ? 'Team' : 'Project'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Project Dialog */}
      {type === 'project' && (
        <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Project</AlertDialogTitle>
              <AlertDialogDescription>
                Update project information
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Project name"
                  disabled={isProjectUpdating}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Project description"
                  disabled={isProjectUpdating}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                    disabled={isProjectUpdating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                    disabled={isProjectUpdating}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as ProjectStatus})}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={isProjectUpdating}
                >
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleEditCancel} disabled={isProjectUpdating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEditConfirm}
                disabled={isProjectUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProjectUpdating ? 'Updating...' : 'Update Project'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit Team Dialog - Reused for both team and project editing */}
      {type === 'team' && (
        <AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Team</AlertDialogTitle>
              <AlertDialogDescription>
                Update team information
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Team name"
                  disabled={isTeamUpdating}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Team description"
                  disabled={isTeamUpdating}
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleEditCancel} disabled={isTeamUpdating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEditConfirm}
                disabled={isTeamUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isTeamUpdating ? 'Updating...' : 'Update Team'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default TitleDropdown;
