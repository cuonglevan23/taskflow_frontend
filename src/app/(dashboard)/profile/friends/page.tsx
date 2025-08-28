"use client";

import React, { useState } from "react";
import { DARK_THEME } from "@/constants/theme";
import Button from "@/components/ui/Button/Button";
import UserAvatar from "@/components/ui/UserAvatar/UserAvatar";
import { Users, Search, UserPlus, MoreHorizontal } from "lucide-react";

// Mock friends data
const mockFriends = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    role: "Developer",
    mutualFriends: 5,
    status: "online"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: null,
    role: "Designer",
    mutualFriends: 3,
    status: "offline"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: null,
    role: "Manager",
    mutualFriends: 7,
    status: "online"
  }
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  const filteredFriends = mockFriends.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         friend.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || friend.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
            Friends
          </h1>
          <Button
            variant="primary"
            size="md"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-0 text-white placeholder-gray-400"
              style={{
                backgroundColor: DARK_THEME.background.secondary,
                borderColor: DARK_THEME.border.default
              }}
            />
          </div>
          
          <div className="flex gap-2">
            {["all", "online", "offline"].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterOption as typeof filter)}
                className={filter === filterOption ? "bg-blue-600" : ""}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm" style={{ color: DARK_THEME.text.secondary }}>
          <span><strong>{mockFriends.length}</strong> total friends</span>
          <span><strong>{mockFriends.filter(f => f.status === "online").length}</strong> online</span>
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-4">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2" style={{ color: DARK_THEME.text.primary }}>
              No friends found
            </h3>
            <p className="text-gray-400">
              {searchQuery ? "Try adjusting your search" : "Start connecting with people"}
            </p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="p-4 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: DARK_THEME.background.secondary }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar
                    name={friend.name}
                    size="md"
                    variant="circle"
                    fallbackColor="#f8a5c2"
                  />
                  {/* Online status indicator */}
                  {friend.status === "online" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2"
                         style={{ borderColor: DARK_THEME.background.secondary }}
                    />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium" style={{ color: DARK_THEME.text.primary }}>
                    {friend.name}
                  </h3>
                  <p className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
                    {friend.role}
                  </p>
                  <p className="text-xs text-gray-400">
                    {friend.mutualFriends} mutual friends
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  Message
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
