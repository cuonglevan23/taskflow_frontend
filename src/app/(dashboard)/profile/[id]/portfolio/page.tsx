"use client";

import React from "react";
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { DARK_THEME } from "@/constants/theme";
import { Briefcase, Plus } from "lucide-react";
import Button from "@/components/ui/Button/Button";

export default function UserPortfolioPage() {
  const { id: userId } = useParams();
  const { user } = useAuth();

  // Check if viewing own profile
  const isOwnProfile = !userId || userId === "me" || (user && userId === user.id?.toString());

  return (
    <div className="p-6">
      <div
        className="text-center py-12 rounded-lg"
        style={{ backgroundColor: DARK_THEME.background.secondary }}
      >
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.primary }}>
          Portfolio
        </h3>
        <p style={{ color: DARK_THEME.text.secondary }} className="mb-4">
          {isOwnProfile
            ? "Your portfolio projects will be displayed here"
            : "Portfolio projects will be displayed here"
          }
        </p>

        {/* Show Add Project button only for own profile */}
        {isOwnProfile && (
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => console.log("Add project")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>
    </div>
  );
}
