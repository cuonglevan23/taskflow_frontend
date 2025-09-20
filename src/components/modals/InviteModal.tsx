// InviteModal - Enhanced with User Lookup System
"use client";

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { X, Info } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Z_INDEX } from "@/styles/z-index";
import { UserLookupPanel } from "@/components/User/UserLookupPanel";
import { UserLookupDto } from '@/types/user-lookup';

/* ===================== Types ===================== */
export interface InviteFormData {
  emails: string;
  projectIds?: string[];
  selectedUsers?: UserLookupDto[];
  emailInvites?: string[];
}

interface Project {
  id: string;
  name: string;
  icon?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: InviteFormData) => Promise<void>;
  projects?: Project[];
  showProjectSelection?: boolean;
  modalTitle?: string;
  requireSameDomain?: boolean;
  // New props for enhanced user lookup
  enableUserLookup?: boolean;
  maxInvites?: number;
}

/* ===================== Mock Data ===================== */
const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Cross-functional project plan", icon: "📋" },
  { id: "2", name: "Website Redesign", icon: "🎨" },
  { id: "3", name: "Mobile App Development", icon: "📱" },
  { id: "4", name: "Marketing Campaign", icon: "📢" },
];

/* ===================== Main Component ===================== */
export default function InviteModal({
  isOpen,
  onClose,
  onSubmit,
  projects = MOCK_PROJECTS,
  showProjectSelection = true,
  modalTitle = "Invite people to My workspace",
  requireSameDomain = true,
  enableUserLookup = true, // Enable the new user lookup by default
  maxInvites = 50,
}: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Legacy email input state (for fallback)
  const [emails, setEmails] = useState("");
  const [emailError, setEmailError] = useState("");

  // New user lookup state
  const [selectedUsers, setSelectedUsers] = useState<UserLookupDto[]>([]);
  const [emailInvites, setEmailInvites] = useState<string[]>([]);

  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's domain for email validation
  const getUserDomain = (): string | undefined => {
    if (user?.email) {
      return user.email.split("@")[1];
    }
    return undefined;
  };

  const userDomain = getUserDomain();

  // Handle user lookup selection changes
  const handleUserLookupChange = useCallback((users: UserLookupDto[], emails: string[]) => {
    setSelectedUsers(users);
    setEmailInvites(emails);
    setEmailError(""); // Clear any previous errors
  }, []);

  // Enhanced validation for user lookup mode
  const validateInviteData = (): { isValid: boolean; error: string } => {
    if (enableUserLookup) {
      const totalInvites = selectedUsers.length + emailInvites.length;

      if (totalInvites === 0) {
        return {
          isValid: false,
          error: "Please select at least one user or enter an email address to invite"
        };
      }

      if (totalInvites > maxInvites) {
        return {
          isValid: false,
          error: `Maximum ${maxInvites} invites allowed. Currently selected: ${totalInvites}`
        };
      }

      // Validate email domains if required
      if (requireSameDomain && userDomain) {
        const wrongDomainEmails = emailInvites.filter(email => {
          const emailDomain = email.split("@")[1];
          return emailDomain !== userDomain;
        });

        if (wrongDomainEmails.length > 0) {
          return {
            isValid: false,
            error: `Emails must be from ${userDomain} domain: ${wrongDomainEmails.join(", ")}`
          };
        }
      }

      return { isValid: true, error: "" };
    }

    // Fallback to legacy validation
    return validateEmails(emails);
  };

  // Legacy email validation (for fallback mode)
  const validateEmails = (emailInput: string): { isValid: boolean; error: string; validEmails: string[] } => {
    if (!emailInput.trim()) {
      return {
        isValid: false,
        error: "Please enter at least one email address",
        validEmails: [],
      };
    }

    const emailList = emailInput
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      return {
        isValid: false,
        error: "Please enter at least one email address",
        validEmails: [],
      };
    }

    const validEmails: string[] = [];
    const invalidEmails: string[] = [];
    const wrongDomainEmails: string[] = [];

    for (const email of emailList) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        invalidEmails.push(email);
        continue;
      }

      if (requireSameDomain && userDomain) {
        const emailDomain = email.split("@")[1];
        if (emailDomain !== userDomain) {
          wrongDomainEmails.push(email);
          continue;
        }
      }

      validEmails.push(email);
    }

    let errorMessage = "";
    if (invalidEmails.length > 0) {
      errorMessage += `Invalid email format: ${invalidEmails.join(", ")}. `;
    }
    if (wrongDomainEmails.length > 0) {
      errorMessage += `Emails must be from ${userDomain} domain: ${wrongDomainEmails.join(", ")}. `;
    }
    if (validEmails.length === 0) {
      errorMessage += "No valid emails found. ";
    }

    return {
      isValid: validEmails.length > 0 && invalidEmails.length === 0 && wrongDomainEmails.length === 0,
      error: errorMessage.trim(),
      validEmails,
    };
  };

  const handleSubmit = async () => {
    // Validate invite data
    const validation = validateInviteData();
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const inviteData: InviteFormData = enableUserLookup ? {
        emails: emailInvites.join(", "), // Convert email invites array to comma-separated string
        projectIds: selectedProjects.map(p => p.id),
        selectedUsers: selectedUsers,
        emailInvites: emailInvites,
      } : {
        emails: emails.trim(),
        projectIds: selectedProjects.map(p => p.id),
      };

      if (onSubmit) {
        await onSubmit(inviteData);
      } else {
        // Fallback logging
        if (enableUserLookup) {
          console.log("Sending invites to existing users:", selectedUsers);
          console.log("Sending email invites to:", emailInvites);
        } else {
          console.log("Sending invites to:", emails);
        }
        console.log("Adding to projects:", selectedProjects.map(p => p.name));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Reset form and close modal
      handleClear();
      onClose();
    } catch (error) {
      console.error("Failed to send invites:", error);
      setEmailError("Failed to send invites. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setEmails("");
    setEmailError("");
    setSelectedUsers([]);
    setEmailInvites([]);
    setSelectedProjects([]);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const selectProject = (project: Project) => {
    if (!selectedProjects.find(p => p.id === project.id)) {
      setSelectedProjects(prev => [...prev, project]);
    }
    setIsProjectDropdownOpen(false);
  };

  const removeProject = (projectId: string) => {
    setSelectedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const availableProjects = projects.filter(
    project => !selectedProjects.find(selected => selected.id === project.id)
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmails(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  if (!isOpen) {
    return null;
  }

  // Calculate total selected for display
  const totalSelected = enableUserLookup ?
    selectedUsers.length + emailInvites.length :
    emails.split(",").filter(e => e.trim()).length;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: Z_INDEX.modal }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(66, 66, 68, 0.4)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: theme.background.primary,
          zIndex: Z_INDEX.popover
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.default,
          }}
        >
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: theme.text.primary }}
            >
              {modalTitle}
            </h1>
            {enableUserLookup && totalSelected > 0 && (
              <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                {totalSelected} {totalSelected === 1 ? 'person' : 'people'} selected
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.text.secondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Enhanced User Lookup or Legacy Email Input */}
          {enableUserLookup ? (
            <div>
              <UserLookupPanel
                mode="invite"
                onSelectionChange={handleUserLookupChange}
                title="Add people"
                allowMultipleSelection={true}
                allowEmailInvites={!requireSameDomain || !userDomain}
                maxSelections={maxInvites}
                showModeSelector={false}
                className="border rounded-lg"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2">{emailError}</p>
              )}
            </div>
          ) : (
            // Legacy email textarea (fallback)
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.text.primary }}
              >
                Email addresses
              </label>
              <textarea
                value={emails}
                onChange={handleEmailChange}
                placeholder={
                  requireSameDomain
                    ? `${user?.email}, name@${userDomain || "company.com"}, ...`
                    : `user@example.com, another@domain.com, ...`
                }
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  emailError ? "border-red-500" : ""
                }`}
                style={{
                  backgroundColor: theme.background.secondary,
                  borderColor: emailError ? "#ef4444" : theme.border.default,
                  color: theme.text.primary,
                }}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
          )}

          {/* Add to projects */}
          {showProjectSelection && (
            <div>
              <label 
                className="flex items-center gap-1 text-sm font-medium mb-2"
                style={{ color: theme.text.primary }}
              >
                Add to projects
                <Info className="w-4 h-4 text-gray-400" />
              </label>

              {/* Selected Projects */}
              {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary
                      }}
                    >
                      <span>{project.icon}</span>
                      <span>{project.name}</span>
                      <button
                        onClick={() => removeProject(project.id)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Project Dropdown */}
              {availableProjects.length > 0 && (
                <Dropdown
                  isOpen={isProjectDropdownOpen}
                  onOpenChange={setIsProjectDropdownOpen}
                  trigger={
                    <button
                      className="w-full text-left px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: theme.background.secondary,
                        borderColor: theme.border.default,
                        color: theme.text.secondary,
                      }}
                    >
                      {selectedProjects.length === 0
                        ? "Choose projects..."
                        : "Add more projects..."
                      }
                    </button>
                  }
                >
                  {availableProjects.map((project) => (
                    <DropdownItem
                      key={project.id}
                      onClick={() => selectProject(project)}
                    >
                      {`${project.icon} ${project.name}`}
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex justify-end gap-3 p-6 border-t"
          style={{
            backgroundColor: theme.background.primary,
            borderTopColor: theme.border.default,
          }}
        >
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || totalSelected === 0}
            loading={isSubmitting}
          >
            {isSubmitting
              ? "Sending..."
              : `Send ${totalSelected > 0 ? `${totalSelected} ` : ""}invite${totalSelected !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </div>
    </div>
  );
}