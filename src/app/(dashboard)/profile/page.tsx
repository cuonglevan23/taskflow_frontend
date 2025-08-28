"use client";

import React from "react";
import { DARK_THEME } from "@/constants/theme";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";
import { Users, FileText, Briefcase } from "lucide-react";

const tabs = [
  { id: 'friends', label: 'Friends',href: '/profile/friends' },
  { id: 'posts', label: 'Posts', href: '/profile/posts' },
  { id: 'portfolio', label: 'Portfolio',  href: '/profile/portfolio' },
];

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400 mb-4">Choose a tab above to view your content</p>
        <div className="flex gap-3 justify-center">
          {tabs.map((tab) => (
            <Link key={tab.id} href={tab.href}>
              <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
               
                {tab.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
