"use client";

import { useState } from "react";
import { X, Info, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown/Dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useTheme } from "@/layouts/hooks/useTheme";
import { useAuth } from "@/hooks/use-auth";

/* ===================== Types ===================== */
export type InviteFormData = {
  emails: string;
  teamId: string;
  projectId: string;
};

interface Team {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  icon?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teams?: Team[];
  projects?: Project[];
}

/* ===================== Mock Data ===================== */
const MOCK_TEAMS: Team[] = [
  { id: "1", name: "LÊ's first team" },
  { id: "2", name: "Development Team" },
  { id: "3", name: "Design Team" },
  { id: "4", name: "Marketing Team" },
];

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "Cross-functional project plan" },
  { id: "2", name: "Website Redesign" },
  { id: "3", name: "Mobile App Development" },
  { id: "4", name: "Marketing Campaign" },
];

/* ===================== Main Component ===================== */
export default function InviteModal({
  isOpen,
  onClose,
  teams = MOCK_TEAMS,
  projects = MOCK_PROJECTS,
}: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [emails, setEmails] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get domain from current user's email
  const getDomain = () => {
    if (user?.email) {
      const domain = user.email.split("@")[1];
      return domain || "vku.udn.vn";
    }
    return "vku.udn.vn";
  };

  const domain = getDomain();

  const handleEmailSubmit = async () => {
    // Validate emails first
    const validation = validateEmails(emails);
    if (!validation.isValid) {
      setEmailError(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API here
      console.log("Sending invites:", {
        emails: validation.validEmails,
        teamId: selectedTeam?.id,
        projectId: selectedProject?.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form
      setEmails("");
      setEmailError("");
      setSelectedProject(null);
      onClose();
    } catch (error) {
      console.error("Failed to send invites:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDropdownOpen(false);
  };

  const removeProject = () => {
    setSelectedProject(null);
  };

  const handleSubmit = () => {
    handleEmailSubmit();
  };

  const handleClear = () => {
    setEmails("");
    setEmailError("");
    setSelectedTeam(null);
    setSelectedProject(null);
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  // Email validation function
  const validateEmails = (
    emailInput: string
  ): { isValid: boolean; error: string; validEmails: string[] } => {
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

      // Check if email domain matches user's domain
      const emailDomain = email.split("@")[1];
      if (emailDomain !== domain) {
        wrongDomainEmails.push(email);
        continue;
      }

      validEmails.push(email);
    }

    // Generate error messages
    let errorMessage = "";
    if (invalidEmails.length > 0) {
      errorMessage += `Invalid email format: ${invalidEmails.join(", ")}. `;
    }
    if (wrongDomainEmails.length > 0) {
      errorMessage += `Emails must be from ${domain} domain: ${wrongDomainEmails.join(
        ", "
      )}. `;
    }
    if (validEmails.length === 0) {
      errorMessage += "No valid emails found. ";
    }

    return {
      isValid:
        validEmails.length > 0 &&
        invalidEmails.length === 0 &&
        wrongDomainEmails.length === 0,
      error: errorMessage.trim(),
      validEmails,
    };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEmails(value);

    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[600px] border"
        style={{
          borderColor: theme.border.default,
          color: theme.text.primary,
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invite people to {domain}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Content */}

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email addresses
              </label>

              <textarea
                value={emails}
                onChange={handleEmailChange}
                placeholder={`${user?.email}, name@${domain}, ...`}
                className={`w-full h-24 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 ${
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
            <div className="grid grid-cols-2 gap-4">
              {/* Team Assignment */}
              <div className="w-full">
                <label className="flex items-center gap-1 text-sm font-medium mb-2 min-w-[120px] pl-2">
                  Add to team
                  <Info className="w-4 h-4 text-gray-400" />
                </label>
                <Dropdown
                  className="w-[260px] ml-2"
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between min-w-[200px]"
                      style={{
                        borderColor: theme.border.default,
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary,
                      }}
                    >
                      <span>{selectedTeam?.name || "Select team"}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  }
                  isOpen={isTeamDropdownOpen}
                  onOpenChange={setIsTeamDropdownOpen}
                >
                  <div className="py-1">
                    {teams.map((team) => (
                      <DropdownItem
                        key={team.id}
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsTeamDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {team.name}
                        </div>
                      </DropdownItem>
                    ))}
                  </div>
                </Dropdown>
              </div>

              {/* Project Assignment */}
              <div className="w-full">
                <label className="flex items-center gap-1 text-sm font-medium mb-2 min-w-[120px] pl-2">
                  Add to project
                  <Info className="w-4 h-4 text-gray-400" />
                </label>

                <Dropdown
                  className="w-[260px] ml-2"
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full justify-between min-w-[200px]"
                      style={{
                        borderColor: theme.border.default,
                        backgroundColor: theme.background.secondary,
                        color: theme.text.primary,
                      }}
                    >
                      <span>{selectedProject?.name || "Select project"}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  }
                  isOpen={isProjectDropdownOpen}
                  onOpenChange={setIsProjectDropdownOpen}
                >
                  <div className="py-1">
                    {projects.map((project) => (
                      <DropdownItem
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsProjectDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{project.icon}</span>
                          {project.name}
                        </div>
                      </DropdownItem>
                    ))}
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button onClick={handleClear} variant="outline" size="lg">
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !emails.trim() || !!emailError}
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
