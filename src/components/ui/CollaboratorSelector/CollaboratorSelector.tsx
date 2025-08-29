"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiClient } from '@/lib/auth-backend';
import Input from '../Input/Input';
import { UserAvatar } from '../UserAvatar';
import { useTheme } from '@/layouts/hooks/useTheme';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CollaboratorSelectorProps {
  selectedCollaborators: Collaborator[];
  onCollaboratorsChange: (collaborators: Collaborator[]) => void;
  onClose?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelection?: number;
  excludeIds?: string[];
}

const CollaboratorSelector = ({
  selectedCollaborators = [],
  onCollaboratorsChange,
  onClose,
  placeholder = "Add collaborators",
  disabled = false,
  className = "",
  maxSelection = 10,
  excludeIds = []
}: CollaboratorSelectorProps) => {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<Collaborator[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim()) {
        setAvailableUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        // Sử dụng API client mới
        const response = await ApiClient.request(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const users = await response?.json() || [];

        // Filter out selected users and excluded IDs
        const filtered = users.filter((user: Collaborator) =>
          !selectedCollaborators.some(selected => selected.id === user.id) &&
          !excludeIds.includes(user.id) &&
          user.id !== currentUser?.id
        );

        setAvailableUsers(filtered);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAvailableUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCollaborators, excludeIds, currentUser?.id]);

  // Filter available users based on search and exclude already selected
  useEffect(() => {
    const selectedIds = selectedCollaborators.map(c => c.id);
    
    let filtered = availableUsers.filter(user => !selectedIds.includes(user.id));

    if (searchQuery.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, selectedCollaborators.length, availableUsers]);

  // Memoized click outside handler to prevent re-renders - following Dropdown pattern
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchQuery('');
      onClose?.();
    }
  }, [onClose]);

  // Proper event listener management - following Dropdown pattern
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleAddCollaborator = (user: Collaborator) => {
    if (selectedCollaborators.length < maxSelection) {
      onCollaboratorsChange([...selectedCollaborators, user]);
      setSearchQuery('');
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    onCollaboratorsChange(selectedCollaborators.filter(c => c.id !== userId));
  };

  const handleOnlyMe = () => {
    // Clear all collaborators - "Only me" mode
    onCollaboratorsChange([]);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Enhanced Input Field with Selected Users */}
      <div className="relative">
        {/* Custom Input Container */}
        <div 
          className="flex items-center gap-2 w-full min-h-[40px] px-3 py-2 border rounded-lg cursor-text transition-all duration-200"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: isOpen ? '#3b82f6' : theme.border.default,
            boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none'
          }}
          onClick={handleInputFocus}
        >
          {/* Left Icon */}
          <Users size={16} className="text-gray-400 flex-shrink-0" />
          
          {/* Selected Users Display */}
          {selectedCollaborators.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-200 group hover:bg-blue-100 transition-colors"
                >
                  <UserAvatar
                    name={collaborator.name}
                    avatar={collaborator.avatar}
                    size="xs"
                    className="w-5 h-5"
                  />
                  <span 
                    className="text-xs font-medium text-blue-700 max-w-[80px] truncate"
                  >
                    {collaborator.name}
                  </span>
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCollaborator(collaborator.id);
                      }}
                      className="flex-shrink-0 p-0.5 hover:bg-blue-200 rounded-full transition-colors opacity-60 group-hover:opacity-100"
                    >
                      <X size={10} className="text-blue-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Search Input */}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onClick={(e) => {
              e.stopPropagation();
              handleInputFocus();
            }}
            placeholder={selectedCollaborators.length > 0 ? "Add more..." : placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm"
            style={{ color: theme.text.primary }}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: theme.background.primary,
            borderColor: theme.border.default,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            minWidth: '320px',
            maxWidth: '400px'
          }}
        >
          {/* Only Me Option */}
          <button
            onClick={handleOnlyMe}
            className="w-full flex items-center gap-3 p-4 text-left transition-all duration-200 border-b group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
            style={{ 
              borderColor: theme.border.default,
              backgroundColor: selectedCollaborators.length === 0 ? 'rgba(59, 130, 246, 0.08)' : 'transparent'
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110"
              style={{ 
                backgroundColor: selectedCollaborators.length === 0 ? '#3b82f6' : theme.background.secondary,
                color: selectedCollaborators.length === 0 ? 'white' : 'inherit'
              }}
            >
              🔒
            </div>
            <div className="flex-1">
              <div 
                className="text-sm font-semibold transition-colors duration-200"
                style={{ 
                  color: selectedCollaborators.length === 0 ? '#3b82f6' : theme.text.primary 
                }}
              >
                Only me
              </div>
              <div 
                className="text-xs transition-colors duration-200"
                style={{ color: theme.text.secondary }}
              >
                Private to you
              </div>
            </div>
            {selectedCollaborators.length === 0 && (
              <div className="text-blue-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Available Users */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => handleAddCollaborator(user)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-all duration-200 group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderTop: index === 0 ? 'none' : `1px solid ${theme.border.default}20`
                  }}
                >
                  <div className="relative">
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      size="sm"
                      className="transition-transform duration-200 group-hover:scale-110"
                    />
                    {user.id === currentUser?.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm font-semibold truncate transition-colors duration-200 group-hover:text-blue-700"
                        style={{ color: theme.text.primary }}
                      >
                        {user.name}
                      </span>
                      {user.id === currentUser?.id && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <span 
                      className="text-xs truncate transition-colors duration-200"
                      style={{ color: theme.text.secondary }}
                    >
                      {user.email}
                    </span>
                  </div>
                  <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div 
                  className="text-sm font-medium mb-1"
                  style={{ color: theme.text.primary }}
                >
                  {searchQuery ? 'No users found' : 'No available users'}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: theme.text.secondary }}
                >
                  {searchQuery ? 'Try a different search term' : 'All users are already assigned'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorSelector;