"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Folder,
  MessageSquare,
  Briefcase,
  Target,
  Users,
  Plus,
  UserPlus,
} from "lucide-react";
import Dropdown, {
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/Dropdown/Dropdown";
import { CreateProjectModal, CreateTeamModal, InviteModal } from "@/components/modals";
import { useDisclosure } from "@/layouts/hooks/ui/useDisclosure";

/* ===================== Types ===================== */
export interface CreateAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
}

interface CreateButtonProps {
  /** Custom create actions */
  actions?: CreateAction[];
  /** Whether to show default actions */
  showDefaultActions?: boolean;
  /** Custom button className */
  className?: string;
  /** Custom button style */
  style?: React.CSSProperties;
  /** Callback when any action is clicked */
  onActionClick?: (actionId: string) => void;
}

/* ===================== Default Actions ===================== */
const getDefaultActions = (
  createProjectModal: any,
  createTeamModal: any,
  inviteModal: any,
  onActionClick?: (actionId: string) => void
): CreateAction[] => [
  {
    id: "task",
    label: "Task",
    icon: <CheckSquare className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("task");
      console.log("Create Task clicked");
    },
  },
  {
    id: "project",
    label: "Project",
    icon: <Folder className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("project");
      createProjectModal.onOpen();
    },
  },
  {
    id: "Teams",
    label: "Teams",
    icon: <UserPlus className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("Teams");
      createTeamModal.onOpen();
    },
  },
  {
    id: "message",
    label: "Message",
    icon: <MessageSquare className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("message");
      console.log("Create Message clicked");
    },
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: <Briefcase className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("portfolio");
      console.log("Create Portfolio clicked");
    },
  },
  {
    id: "goal",
    label: "Goal",
    icon: <Target className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("goal");
      console.log("Create Goal clicked");
    },
  },
  {
    id: "separator",
    label: "",
    icon: null,
    onClick: () => {},
    separator: true,
  },
  {
    id: "invite",
    label: "Invite People",
    icon: <Users className="w-4 h-4" />,
    onClick: () => {
      onActionClick?.("invite");
      inviteModal.onOpen();
    },
  },
];

/* ===================== Main Component ===================== */
export default function CreateButton({
  actions,
  showDefaultActions = true,
  className = "",
  style,
  onActionClick,
}: CreateButtonProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Modal states
  const createProjectModal = useDisclosure(false);
  const createTeamModal = useDisclosure(false);
  const inviteModal = useDisclosure(false);

  // Determine which actions to show
  const displayActions = actions || (showDefaultActions 
    ? getDefaultActions(createProjectModal, createTeamModal, inviteModal, onActionClick)
    : []
  );

  const handleActionClick = (action: CreateAction) => {
    setIsCreateOpen(false);
    action.onClick();
  };

  return (
    <>
      {/* Create Button with Dropdown */}
      <Dropdown
        trigger={
          <button 
            className={`flex items-center space-x-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors text-sm font-medium ${className}`}
            style={style}
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        }
        placement="right"
        usePortal={false}
        contentClassName="w-48"
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      >
        <div className="py-2">
          {displayActions.map((action) => {
            if (action.separator) {
              return <DropdownSeparator key={action.id} />;
            }
            
            return (
              <DropdownItem
                key={action.id}
                icon={action.icon}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </DropdownItem>
            );
          })}
        </div>
      </Dropdown>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectModal.isOpen}
        onClose={createProjectModal.onClose}
        onCreateProject={(projectData) => {
          console.log('Creating project:', projectData);
          // Handle project creation logic here
        }}
      />
      
      <CreateTeamModal
        isOpen={createTeamModal.isOpen}
        onClose={createTeamModal.onClose}
        onSuccess={(team) => {
          console.log('✅ Team created successfully:', team);
          
          // Show success feedback
          alert(`🎉 Team "${team.name}" created successfully!`);
          
          // Navigate to teams page to see the new team
          router.push('/manager/teams');
        }}
      />
      
      <InviteModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.onClose}
      />
    </>
  );
}

/* ===================== Convenience Hooks ===================== */
export function useCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = () => setIsOpen(true);
  const closeCreate = () => setIsOpen(false);

  return {
    isOpen,
    openCreate,
    closeCreate,
  };
}

/* ===================== Export Types ===================== */
export type { CreateAction };