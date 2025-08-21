"use client";

import React, { useState, useMemo } from "react";
import ProfileLayout from "@/components/layouts/ProfileLayout";
import Button from "@/components/ui/Button/Button";
import BaseCard from "@/components/ui/BaseCard/BaseCard";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { DARK_THEME, THEME_COLORS } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";
import { 
  Edit3, 
  Target, 
  Folder, 
  Plus, 
  Camera,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

// Mock data - replace with real data from API
const profileData = {
  name: "cuonglv.21ad@vku.udn.vn",
  initials: "c2",
  roles: ["coder", "hr"],
  about: "demo test about me",
  avatar: null, // Will use initials if no avatar
};

const myTasks = [
  { id: "1", title: "demo", dueDate: "29 - 31 Jul", completed: false },
  { id: "2", title: "", dueDate: null, completed: false },
  { id: "3", title: "d", dueDate: null, completed: false },
  { id: "4", title: "d", dueDate: null, completed: false },
  { id: "5", title: "d", dueDate: null, completed: false },
  { id: "6", title: "d", dueDate: null, completed: false },
  { id: "7", title: "d", dueDate: null, completed: false },
];

const collaborators = [
  { id: "1", name: "cuongvanle1011@gmail.com", initials: "cu", avatar: null },
  { id: "2", name: "le van cuong", initials: "lc", avatar: null },
];

const recentProjects = [
  { id: "1", name: "d", members: [{ initials: "c2" }, { initials: "cu" }] },
  { id: "2", name: "d", members: [{ initials: "lc" }, { initials: "cu" }] },
];

const ProfilePage = () => {
  const { user, isLoading } = useUser();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Memoized user data with fallbacks
  const userData = useMemo(() => ({
    name: user?.name || profileData.name,
    email: user?.email || profileData.name,
    avatar: user?.avatar,
    roles: profileData.roles, // This should come from user data in real implementation
    about: profileData.about, // This should come from user data in real implementation
  }), [user]);

  // Custom Avatar Component with edit functionality
  const ProfileAvatarWithEdit = () => (
    <div className="relative">
      <UserAvatar 
        user={userData}
        size="2xl"
        variant="circle"
        className="shadow-lg"
        fallbackColor="#f8a5c2"
      />
      <Button
        variant="ghost"
        size="sm"
        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 border-2"
        style={{
          backgroundColor: DARK_THEME.background.secondary,
          borderColor: DARK_THEME.border.default,
        }}
        onClick={() => console.log("Change avatar")}
      >
        <Camera className="w-4 h-4" />
      </Button>
    </div>
  );

  // Edit Profile Button using standardized Button component
  const EditProfileButton = () => (
    <Button
      variant="button_text"

      onClick={() => setIsEditingProfile(true)}
    >
      Edit profile
    </Button>
  );

  // Loading state
  if (isLoading) {
    return (
      <ProfileLayout user={user} title="Loading...">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout
      user={userData}
      customAvatar={<ProfileAvatarWithEdit />}
      title={userData.name}
      subtitle={
        <div className="mt-2">
          {/* Roles */}
          <div className="flex items-center gap-2 mb-2">
            {userData.roles.map((role, index) => (
              <span
                key={role}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: DARK_THEME.background.tertiary,
                  color: DARK_THEME.text.secondary,
                }}
              >
                {role}
              </span>
            ))}
          </div>
          {/* About Me */}
          <p
            className="text-base"
            style={{ color: DARK_THEME.text.secondary }}
          >
            {userData.about}
          </p>
        </div>
      }
      headerActions={<EditProfileButton />}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tasks */}
            <BaseCard
              title="My tasks"
              showMoreButton={{
                show: true,
                onClick: () => console.log("Show more tasks")
              }}
              onMenuClick={() => console.log("Task menu")}
            >
              <div className="space-y-3">
                {myTasks.slice(0, 7).map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle2 
                          className="w-4 h-4"
                          style={{ color: THEME_COLORS.success[500] }}
                        />
                      ) : (
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{
                            borderColor: DARK_THEME.text.muted,
                            backgroundColor: 'transparent',
                          }}
                        />
                      )}
                      <span
                        className="text-sm"
                        style={{ color: DARK_THEME.text.primary }}
                      >
                        {task.title || "Untitled"}
                      </span>
                    </div>
                    {task.dueDate && (
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          color: "#ff6b6b",
                          backgroundColor: "rgba(255, 107, 107, 0.1)",
                        }}
                      >
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* View All Tasks Button */}
                <div className="pt-2 border-t" style={{ borderColor: DARK_THEME.border.default }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => console.log("View all tasks")}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View all tasks
                  </Button>
                </div>
              </div>
            </BaseCard>

            {/* Recent Projects */}
            <BaseCard 
              title="My recent projects"
              icon={<Folder className="w-5 h-5" style={{ color: THEME_COLORS.info[500] }} />}
              onMenuClick={() => console.log("Projects menu")}
            >
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: THEME_COLORS.info[600] }}
                      >
                        <Folder className="w-4 h-4 text-white" />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: DARK_THEME.text.primary }}
                      >
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center -space-x-2">
                      {project.members.map((member, index) => (
                        <UserAvatar
                          key={index}
                          name={member.initials}
                          size="xs"
                          variant="circle"
                          className="border-2"
                          style={{
                            borderColor: DARK_THEME.background.secondary,
                          }}
                          fallbackColor={index === 0 ? "#f8a5c2" : index === 1 ? "#fbbf24" : "#8b5cf6"}
                        />
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 rounded-full border-2 border-dashed p-0 text-xs"
                        style={{ 
                          borderColor: DARK_THEME.text.muted, 
                          color: DARK_THEME.text.muted,
                          minHeight: "24px",
                          minWidth: "24px"
                        }}
                        onClick={() => console.log("Add member")}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </BaseCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Frequent Collaborators */}
            <BaseCard 
              title="Frequent collaborators"
              createAction={{
                icon: Plus,
                label: "Invite teammates",
                onClick: () => console.log("Invite teammates")
              }}
              onMenuClick={() => console.log("Collaborators menu")}
            >
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3">
                    <UserAvatar
                      name={collaborator.name}
                      size="sm"
                      variant="circle"
                      fallbackColor={collaborator.id === "1" ? "#fbbf24" : "#f8a5c2"}
                    />
                    <span
                      className="text-sm"
                      style={{ color: DARK_THEME.text.primary }}
                    >
                      {collaborator.name}
                    </span>
                  </div>
                ))}
              </div>
            </BaseCard>

            {/* My Goals */}
            <BaseCard
              title="My goals"
              icon={<Target className="w-5 h-5" style={{ color: THEME_COLORS.success[500] }} />}
              onMenuClick={() => console.log("Goals menu")}
            >
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4
                  className="text-base font-medium mb-2"
                  style={{ color: DARK_THEME.text.primary }}
                >
                  You don't own any goals yet
                </h4>
                <p
                  className="text-sm mb-6"
                  style={{ color: DARK_THEME.text.muted }}
                >
                  Add a goal so the team can see what you hope to achieve.
                </p>
                
                {/* Create Goal Button */}
                <div className="mb-6">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => console.log("Create goal")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create goal
                  </Button>
                </div>
                
                {/* Progress bars */}
                <div className="space-y-3 text-left">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: THEME_COLORS.success[400] }}>● On track (85%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: THEME_COLORS.success[500],
                          width: "85%"
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: THEME_COLORS.warning[400] }}>● At risk (43%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: THEME_COLORS.warning[500],
                          width: "43%"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;