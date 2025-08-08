"use client";

import React, { useState } from "react";
import { useTheme } from "@/layouts/hooks/useTheme";
import { X, Upload, Mic } from "lucide-react";
import { Button } from "@/components/ui";
import { Z_INDEX } from "@/styles/z-index";

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Settings Tab Types
type SettingsTab = 'profile' | 'notifications' | 'email-forwarding' | 'account' | 'display' | 'apps' | 'hacks';

// SettingsModal Props
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  backdropColor?: 'black' | 'white';
  backdropOpacity?: number;
  customBackdrop?: string;
}

// SettingsModal Component
const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  backdropColor = 'white',
  backdropOpacity = 0.8,
  customBackdrop
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Form state for Profile tab
  const [profileData, setProfileData] = useState({
    fullName: user.name || 'Văn Lê',
    pronouns: '',
    jobTitle: '',
    department: '',
    email: user.email || 'cuongvanle101@gmail.com',
    role: user.role || 'Manager',
    aboutMe: "I usually work from 9am-5pm PST. Feel free to assign me a task with a due date anytime. Also, I love dogs!",
    photo: null as File | null,
  });

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'email-forwarding', label: 'Email Forwarding' },
    { id: 'account', label: 'Account' },
    { id: 'display', label: 'Display' },
    { id: 'apps', label: 'Apps' },
    { id: 'hacks', label: 'Hacks' },
  ] as const;

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = () => {
    console.log('Upload photo');
    // In real app: open file picker
  };

  const handleRecordAudio = () => {
    console.log('Record pronunciation');
    // In real app: start audio recording
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
          style={{backgroundColor: 'rgba(66, 66, 68, 0.4)'}}
          onClick={onClose}
      />

      {/* Modal */}
      <div
          className="relative w-full max-w-6xl h-[90vh] mx-4 rounded-xl shadow-2xl flex overflow-hidden"
        style={{ 
          backgroundColor: theme.background.primary,
          zIndex: Z_INDEX.popover
        }}
      >
        {/* Header */}
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 border-b"
          style={{ zIndex: 10 }}
          style={{ 
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.default 
          }}
        >
          <h1 
            className="text-xl font-semibold"
            style={{ color: theme.text.primary }}
          >
            Settings
          </h1>
          <button
            onClick={onClose}
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
        <div className="flex w-full pt-20">
          {/* Navigation Tabs */}
          <div 
            className="w-64 border-r p-6 overflow-y-auto"
            style={{ borderRightColor: theme.border.default }}
          >
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? theme.background.secondary : 'transparent',
                    color: activeTab === tab.id ? theme.text.primary : theme.text.secondary,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'profile' && (
                <div className="max-w-2xl space-y-8">
                  {/* Photo Section */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-4"
                      style={{ color: theme.text.primary }}
                    >
                      Your photo
                    </label>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: theme.border.default }}
                      >
                        <div 
                          className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center"
                          style={{ backgroundColor: theme.background.secondary }}
                        >
                          <Upload 
                            className="w-8 h-8"
                            style={{ color: theme.text.secondary }}
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={handlePhotoUpload}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Upload your photo
                        </button>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: theme.text.secondary }}
                        >
                          Photos help your teammates recognize you in Asana
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Your full name *
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        }}
                      />
                    </div>

                    {/* Pronouns */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Pronouns
                      </label>
                      <input
                        type="text"
                        placeholder="Third-person pronouns (e.g. she/her/hers)"
                        value={profileData.pronouns}
                        onChange={(e) => handleInputChange('pronouns', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        }}
                      />
                    </div>

                    {/* Name Pronunciation */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Name pronunciation
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRecordAudio}
                        leftIcon={<Mic className="w-4 h-4" />}
                      >
                        Record audio clip
                      </Button>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Job title
                      </label>
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        }}
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Department or team
                      </label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: theme.text.primary }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        }}
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      Role
                    </label>
                    <select
                      value={profileData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      style={{
                        backgroundColor: theme.background.primary,
                        borderColor: theme.border.default,
                        color: theme.text.primary,
                      }}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Product Manager">Product Manager</option>
                    </select>
                    <p 
                      className="text-xs mt-2"
                      style={{ color: theme.text.secondary }}
                    >
                      This helps us tailor Asana for you, and we may reach out to find the right products for you.
                    </p>
                  </div>

                  {/* About Me */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      About me
                    </label>
                    <textarea
                      rows={4}
                      value={profileData.aboutMe}
                      onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      style={{
                        backgroundColor: theme.background.primary,
                        borderColor: theme.border.default,
                        color: theme.text.primary,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== 'profile' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: theme.text.primary }}
                    >
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      This section will be implemented soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div 
              className="w-80 border-l p-6 overflow-y-auto"
              style={{ borderLeftColor: theme.border.default }}
            >
              {/* Frequent collaborators */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-sm font-medium"
                    style={{ color: theme.text.primary }}
                  >
                    Frequent collaborators
                  </h3>
                  <span 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    ⓘ
                  </span>
                </div>
                <button
                  className="w-full py-2 px-3 border border-dashed rounded-lg text-center transition-colors"
                  style={{
                    borderColor: theme.border.default,
                    color: theme.text.secondary,
                  }}
                >
                  + Invite teammates
                </button>
                <p 
                  className="text-xs mt-4 text-center"
                  style={{ color: theme.text.secondary }}
                >
                  This space is for your frequent collaborators.
                </p>
              </div>

              {/* My goals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-sm font-medium"
                    style={{ color: theme.text.primary }}
                  >
                    My goals
                  </h3>
                  <span 
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                  >
                    ⓘ
                  </span>
                  <button className="text-blue-600 text-sm">
                    Create goal
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div 
                    className="p-3 border rounded-lg"
                    style={{ borderColor: theme.border.default }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: theme.text.primary }}
                      >
                        Objective
                      </span>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: theme.text.secondary }}
                    >
                      demo
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: theme.text.secondary }}>
                      <span>🔄 No status (0%)</span>
                      <span>📅 Q3 FY25</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SettingsModal };
export default SettingsModal;