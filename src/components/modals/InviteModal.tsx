// InviteModal - Backend JWT Authentication Only
"use client";

import React, { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import { useTheme } from "@/layouts/hooks/useTheme";
import { Z_INDEX } from "@/styles/z-index";

/* ===================== Types ===================== */
export interface InviteFormData {
  emails: string;
  projectIds?: string[];
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
  showProjectSelection?: boolean; // New prop to control project selection visibility
  modalTitle?: string; // Custom title for the modal
  requireSameDomain?: boolean; // New prop to control domain validation
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
  showProjectSelection = true, // Default to true for backward compatibility
  modalTitle = "Invite people to My workspace", // Default title
  requireSameDomain = true, // Default to true for backward compatibility
}: Props) {
  const { theme } = useTheme();
  const { user } = useAuth(); // Get user from AuthProvider

  const [emails, setEmails] = useState("");
  const [emailError, setEmailError] = useState("");
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

  const validateEmails = (emailInput: string): { isValid: boolean; error: string; validEmails: string[] } => {
    if (!emailInput.trim()) {
      return {
        isValid: false,
        error: "Please enter at least one email address",
        validEmails: [],
      };
    }

    // Split emails by comma and clean them
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
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        invalidEmails.push(email);
        continue;
      }

      // Check if email domain matches user's domain (only if required)
      if (requireSameDomain && userDomain) {
        const emailDomain = email.split("@")[1];
        if (emailDomain !== userDomain) {
          wrongDomainEmails.push(email);
          continue;
        }
      }

      validEmails.push(email);
    }

    // Generate error messages
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
    // Validate emails
    const validation = validateEmails(emails);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const inviteData = {
        emails: emails.trim(),
        projectIds: selectedProjects.map(p => p.id),
      };

      if (onSubmit) {
        await onSubmit(inviteData);
      } else {
        console.log("Sending invites to:", validation.validEmails);
        console.log("Adding to projects:", selectedProjects.map(p => p.name));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Reset form and close modal
      handleClear();
      onClose();
    } catch (error) {
      console.error("Failed to send invites:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setEmails("");
    setEmailError("");
    setSelectedProjects([]);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  const selectProject = (project: Project) => {
    // Check if project is already selected
    if (!selectedProjects.find(p => p.id === project.id)) {
      setSelectedProjects(prev => [...prev, project]);
    }
    setIsProjectDropdownOpen(false);
  };

  const removeProject = (projectId: string) => {
    setSelectedProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Get available projects (not already selected)
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
        className="relative w-full max-w-lg mx-4 rounded-xl shadow-2xl"
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
          <h1 
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            {modalTitle}
          </h1>
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
        <div className="p-6 space-y-6">
          {/* Email Textarea */}
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

          {/* Add to projects - Only show if showProjectSelection is true */}
          {showProjectSelection && (
            <div>
              <label 
                className="flex items-center gap-1 text-sm font-medium mb-2"
                style={{ color: theme.text.primary }}
              >
                Add to projects
                <Info className="w-4 h-4 text-gray-400" />
              </label>
            
            {/* Selected Projects - Tag Style */}
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm"
                    style={{
                      backgroundColor: theme.background.secondary,
                      borderColor: theme.border.default,
                      color: theme.text.primary,
                    }}
                  >
                    <span>{project.icon}</span>
                    <span>{project.name}</span>
                    <button
                      onClick={() => removeProject(project.id)}
                      className="ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Project Button */}
            {availableProjects.length > 0 && (
              <Dropdown
                trigger={
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-dashed rounded-lg text-center transition-colors"
                    style={{
                      borderColor: theme.border.default,
                      color: theme.text.secondary,
                    }}
                  >
                    + Add to project
                  </button>
                }
                isOpen={isProjectDropdownOpen}
                onOpenChange={setIsProjectDropdownOpen}
                className="w-full"
              >
                <div className="py-1">
                  {availableProjects.map((project) => (
                    <DropdownItem
                      key={project.id}
                      onClick={() => selectProject(project)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{project.icon}</span>
                        {project.name}
                      </div>
                    </DropdownItem>
                  ))}
                </div>
              </Dropdown>
            )}

            {/* All projects selected message */}
            {availableProjects.length === 0 && selectedProjects.length > 0 && (
              <div 
                className="w-full px-3 py-2 border border-dashed rounded-lg text-center text-sm"
                style={{
                  borderColor: theme.border.default,
                  color: theme.text.secondary,
                }}
              >
                All projects added
              </div>
            )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ 
            backgroundColor: theme.background.primary,
            borderTopColor: theme.border.default,
          }}
        >
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={isSubmitting}
          >
            Clear
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !emails.trim() || !!emailError}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}