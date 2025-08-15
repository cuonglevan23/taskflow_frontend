"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { ChevronDown, ArrowLeft, X, Sparkles } from "lucide-react";
import { BaseModal } from "@/components/ui";
import Image from "next/image";

/* ===================== Types ===================== */
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (projectData: ProjectFormData) => void;
}

interface ProjectFormData {
  name: string;
  privacy: string;
}

interface PrivacyOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

/* ===================== Privacy Options ===================== */
const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    id: "workspace",
    label: "My workspace",
    description: "Visible to workspace members",
    icon: "🏢"
  },
  {
    id: "private",
    label: "Private to me",
    description: "Only visible to you",
    icon: "🔒"
  },
  {
    id: "team",
    label: "Team project", 
    description: "Visible to team members",
    icon: "👥"
  }
];

/* ===================== Main Component ===================== */
export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject
}: CreateProjectModalProps) {
  const { theme } = useTheme();
  
  // Form state
  const [projectName, setProjectName] = useState("");
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyOption>(PRIVACY_OPTIONS[0]);
  const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  
  // Validation
  const validateForm = () => {
    if (!projectName.trim()) {
      setNameError("Project name is required.");
      return false;
    }
    setNameError("");
    return true;
  };
  
  // Handlers
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    if (nameError) {
      setNameError("");
    }
  };
  
  const handlePrivacySelect = (privacy: PrivacyOption) => {
    setSelectedPrivacy(privacy);
    setIsPrivacyDropdownOpen(false);
  };
  
  const handleSetupWithAI = () => {
    if (validateForm()) {
      console.log("Setting up with Asana AI:", { projectName, privacy: selectedPrivacy });
      // Handle AI setup logic
    }
  };
  
  const handleContinue = () => {
    if (validateForm()) {
      const projectData: ProjectFormData = {
        name: projectName,
        privacy: selectedPrivacy.id
      };
      
      if (onCreateProject) {
        onCreateProject(projectData);
      }
      
      // Reset form
      setProjectName("");
      setSelectedPrivacy(PRIVACY_OPTIONS[0]);
      setNameError("");
      onClose();
    }
  };
  
  const handleClose = () => {
    // Reset form on close
    setProjectName("");
    setSelectedPrivacy(PRIVACY_OPTIONS[0]);
    setNameError("");
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="7xl"
      height="screen"
      showHeader={false}
      className="m-0 max-w-none w-screen h-screen rounded-none overflow-hidden"
    >
      <div 
        className="flex h-screen"
        style={{ backgroundColor: theme.background.primary }}
      >
        {/* Left Panel - Form */}
        <div 
          className="w-1/2 flex flex-col px-16 py-12 relative"
          style={{ backgroundColor: theme.background.primary }}
        >
          {/* Header - Within left panel only */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  color: theme.text.secondary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 
                className="text-3xl font-semibold"
                style={{ color: theme.text.primary }}
              >
                New project
              </h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-md mx-auto flex-1 flex flex-col justify-center">

            {/* Project Name */}
            <div className="mb-8">
              <label 
                className="block text-base font-medium mb-3"
                style={{ color: theme.text.primary }}
              >
                Project name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={handleProjectNameChange}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-base ${
                  nameError ? 'border-red-500 bg-red-50' : ''
                }`}
                style={{
                  backgroundColor: nameError ? 'rgba(239, 68, 68, 0.1)' : theme.background.secondary,
                  color: theme.text.primary,
                  borderColor: nameError ? '#ef4444' : 'transparent',
                  outline: 'none'
                }}
                placeholder=""
                onFocus={(e) => {
                  if (!nameError) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!nameError) {
                    e.target.style.borderColor = 'transparent';
                  }
                }}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-2 font-medium">{nameError}</p>
              )}
            </div>

            {/* Privacy */}
            <div className="mb-12">
              <label 
                className="block text-base font-medium mb-3"
                style={{ color: theme.text.primary }}
              >
                Privacy
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
                  className="w-full p-4 rounded-lg border flex items-center justify-between transition-all duration-200 text-base"
                  style={{
                    backgroundColor: theme.background.secondary,
                    borderColor: 'transparent',
                    color: theme.text.primary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'transparent';
                  }}
                >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{selectedPrivacy.icon}</span>
                  <span>{selectedPrivacy.label}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isPrivacyDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50"
                  style={{
                    backgroundColor: theme.background.primary,
                    borderColor: theme.border.default,
                  }}
                >
                  {PRIVACY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePrivacySelect(option)}
                      className="w-full p-3 text-left hover:bg-opacity-80 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      style={{
                        backgroundColor: selectedPrivacy.id === option.id 
                          ? theme.background.secondary 
                          : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPrivacy.id !== option.id) {
                          e.currentTarget.style.backgroundColor = theme.background.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPrivacy.id !== option.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div 
                            className="font-medium"
                            style={{ color: theme.text.primary }}
                          >
                            {option.label}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: theme.text.secondary }}
                          >
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="max-w-md mx-auto w-full space-y-4 mt-8">
            <button
              onClick={handleSetupWithAI}
              className="w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center space-x-3 text-base font-medium"
              style={{
                borderColor: theme.text.secondary,
                backgroundColor: 'transparent',
                color: theme.text.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.secondary;
                e.currentTarget.style.borderColor = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = theme.text.secondary;
              }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Set up with Asana AI</span>
            </button>
            
            <button
              onClick={handleContinue}
              className="w-full p-4 rounded-lg transition-all duration-200 text-base font-medium"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div 
          className="w-1/2 flex flex-col px-16 py-12 border-l relative"
          style={{ 
            backgroundColor: theme.background.secondary,
            borderLeftColor: theme.border.default
          }}
        >
          {/* Close button in top right */}
          <div className="absolute top-6 right-6">
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: theme.text.secondary,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.background.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview Content - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md mx-auto">
              <div 
                className="w-full h-[480px] rounded-xl overflow-hidden shadow-2xl border"
                style={{ borderColor: theme.border.default }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/backgrounds/Updated_Dark_List.png"
                    alt="Project template preview"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

/* ===================== Export Types ===================== */
export type { CreateProjectModalProps, ProjectFormData };