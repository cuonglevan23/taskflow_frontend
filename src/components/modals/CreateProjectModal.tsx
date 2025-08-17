"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowLeft, X, Sparkles, Circle, MessageCircle } from "lucide-react";
import { BaseModal } from "@/components/ui";

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
        if (nameError) setNameError("");
    };

    const handlePrivacySelect = (privacy: PrivacyOption) => {
        setSelectedPrivacy(privacy);
        setIsPrivacyDropdownOpen(false);
    };

    const handleSetupWithAI = () => {
        if (validateForm()) {
            console.log("Setting up with Asana AI:", { projectName, privacy: selectedPrivacy });
            // TODO: implement AI setup logic
        }
    };

    const handleContinue = () => {
        if (validateForm()) {
            const projectData: ProjectFormData = {
                name: projectName,
                privacy: selectedPrivacy.id
            };
            if (onCreateProject) onCreateProject(projectData);

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
            <div className="flex h-screen bg-gray-900">
                {/* Left Panel */}
                <div className="w-1/2 flex flex-col px-16 py-12 relative bg-gray-900">
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-gray-800"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <h1 className="text-3xl font-semibold text-white">
                                New project
                            </h1>
                        </div>
                    </div>

                    <div className="max-w-md flex-1 flex flex-col justify-center">
                        {/* Project Name */}
                        <div className="mb-8">
                            <label className="block text-base font-medium mb-3 text-white">
                                Project name
                            </label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={handleProjectNameChange}
                                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-base bg-gray-800 text-white ${
                                    nameError ? 'border-red-500' : 'border-transparent focus:border-blue-500'
                                }`}
                                placeholder=""
                            />
                            {nameError && (
                                <p className="text-red-500 text-sm mt-2 font-medium">{nameError}</p>
                            )}
                        </div>

                        {/* Privacy */}
                        <div className="mb-12">
                            <label className="block text-base font-medium mb-3 text-white">
                                Privacy
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen)}
                                    className="w-full p-4 rounded-lg border bg-gray-800 border-transparent flex items-center justify-between transition-all duration-200 text-base text-white focus:border-blue-500"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{selectedPrivacy.icon}</span>
                                        <span>{selectedPrivacy.label}</span>
                                    </div>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {isPrivacyDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 bg-gray-900 border-gray-700">
                                        {PRIVACY_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handlePrivacySelect(option)}
                                                className={`w-full p-3 text-left hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                    selectedPrivacy.id === option.id ? 'bg-gray-800' : ''
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg">{option.icon}</span>
                                                    <div>
                                                        <div className="font-medium text-white">{option.label}</div>
                                                        <div className="text-xs text-gray-400">{option.description}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="max-w-md w-full space-y-4 mt-8">
                            <button
                                onClick={handleSetupWithAI}
                                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-600 bg-transparent text-white transition-all duration-200 flex items-center justify-center space-x-3 text-base font-medium hover:bg-gray-800 hover:border-gray-500"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Set up with Asana AI</span>
                            </button>

                            <button
                                onClick={handleContinue}
                                className="w-full p-4 rounded-lg transition-all duration-200 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 hover:transform hover:-translate-y-0.5"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-1/2 flex flex-col px-16 py-12 border-l bg-gray-800 border-gray-700 relative">
                    <div className="absolute top-6 right-6">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-full max-w-2xl">
                            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 p-6">
                                {/* Dummy preview content */}
                                <div className="mb-6">
                                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                </div>
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Circle className="w-5 h-5 text-gray-500" />
                                                <div className="h-3 bg-gray-600 rounded w-32"></div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                                <MessageCircle className="w-4 h-4 text-gray-500" />
                                                <div className="w-12 h-4 bg-red-500 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}

export type { CreateProjectModalProps, ProjectFormData };
