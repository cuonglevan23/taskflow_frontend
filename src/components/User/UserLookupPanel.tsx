// UserLookupPanel Component - Comprehensive user lookup interface
// Combines all user lookup functionalities in one component
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React, { useState } from 'react';
import { Users, Mail, Search, Upload } from 'lucide-react';
import { UserLookupDto } from '@/types/user-lookup';
import { UserSearchDropdown } from './UserSearchDropdown';
import { InviteInput } from './InviteInput';
import { BulkUserLookup } from './BulkUserLookup';
import { UserValidationInput } from './UserValidationInput';
import { UserChip } from './UserChip';
import { EmailInviteChip } from './EmailInviteChip';
import { DARK_THEME } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

interface UserLookupPanelProps {
  mode?: 'search' | 'invite' | 'bulk' | 'validate' | 'all';
  onUserSelect?: (user: UserLookupDto) => void;
  onUsersSelect?: (users: UserLookupDto[]) => void;
  onEmailsAdd?: (emails: string[]) => void;
  onSelectionChange?: (users: UserLookupDto[], emails: string[]) => void;
  onValidationResult?: (isValid: boolean, email: string, exists: boolean) => void;
  className?: string;
  title?: string;
  allowMultipleSelection?: boolean;
  allowEmailInvites?: boolean;
  maxSelections?: number;
  showModeSelector?: boolean;
}

type LookupMode = 'search' | 'invite' | 'bulk' | 'validate';

export const UserLookupPanel: React.FC<UserLookupPanelProps> = ({
  mode = 'all',
  onUserSelect,
  onUsersSelect,
  onEmailsAdd,
  onSelectionChange,
  onValidationResult,
  className = "",
  title = "User Lookup",
  allowMultipleSelection = true,
  allowEmailInvites = true,
  maxSelections,
  showModeSelector = true
}) => {
  const [activeMode, setActiveMode] = useState<LookupMode>(
    mode === 'all' ? 'search' : mode as LookupMode
  );
  const [selectedUsers, setSelectedUsers] = useState<UserLookupDto[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const availableModes = mode === 'all'
    ? (['search', 'invite', 'bulk', 'validate'] as LookupMode[])
    : [mode as LookupMode];

  const modeConfig = {
    search: {
      icon: Search,
      label: 'Search Users',
      description: 'Find users by name or email'
    },
    invite: {
      icon: Users,
      label: 'Invite Input',
      description: 'Advanced input for user selection and email invites'
    },
    bulk: {
      icon: Upload,
      label: 'Bulk Lookup',
      description: 'Lookup multiple emails at once'
    },
    validate: {
      icon: Mail,
      label: 'Email Validation',
      description: 'Validate email for registration'
    }
  };

  const handleUserSelect = (user: UserLookupDto) => {
    if (allowMultipleSelection) {
      const newUsers = [...selectedUsers, user];
      setSelectedUsers(newUsers);
      if (onSelectionChange) {
        onSelectionChange(newUsers, selectedEmails);
      }
    } else {
      setSelectedUsers([user]);
      if (onSelectionChange) {
        onSelectionChange([user], selectedEmails);
      }
    }

    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleEmailAdd = (email: string) => {
    if (allowEmailInvites) {
      const newEmails = [...selectedEmails, email];
      setSelectedEmails(newEmails);
      if (onSelectionChange) {
        onSelectionChange(selectedUsers, newEmails);
      }
    }

    if (onEmailsAdd) {
      onEmailsAdd([email]);
    }
  };

  const handleInviteSelectionChange = (users: UserLookupDto[], emails: string[]) => {
    setSelectedUsers(users);
    setSelectedEmails(emails);
    if (onSelectionChange) {
      onSelectionChange(users, emails);
    }
  };

  const handleBulkUsersFound = (users: UserLookupDto[]) => {
    if (onUsersSelect) {
      onUsersSelect(users);
    }
  };

  const handleBulkEmailsNotFound = (emails: string[]) => {
    if (onEmailsAdd) {
      onEmailsAdd(emails);
    }
  };

  // Fix: Create wrapper function that accepts UserLookupDto and extracts userId
  const handleRemoveUser = (user: UserLookupDto) => {
    const newUsers = selectedUsers.filter(u => u.userId !== user.userId);
    setSelectedUsers(newUsers);
    if (onSelectionChange) {
      onSelectionChange(newUsers, selectedEmails);
    }
  };

  const handleRemoveEmail = (email: string) => {
    const newEmails = selectedEmails.filter(e => e !== email);
    setSelectedEmails(newEmails);
    if (onSelectionChange) {
      onSelectionChange(selectedUsers, newEmails);
    }
  };

  const clearAll = () => {
    setSelectedUsers([]);
    setSelectedEmails([]);
    if (onSelectionChange) {
      onSelectionChange([], []);
    }
  };

  const totalSelections = selectedUsers.length + selectedEmails.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: DARK_THEME.text.primary }}>
            {title}
          </h2>
          {totalSelections > 0 && (
            <p className="text-sm mt-1" style={{ color: DARK_THEME.text.secondary }}>
              {selectedUsers.length} users, {selectedEmails.length} email invites selected
            </p>
          )}
        </div>

        {totalSelections > 0 && (
          <Button onClick={clearAll} variant="outline" size="sm">
            Clear All
          </Button>
        )}
      </div>

      {/* Mode Selector */}
      {showModeSelector && availableModes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {availableModes.map((modeOption) => {
            const config = modeConfig[modeOption];
            const Icon = config.icon;
            const isActive = activeMode === modeOption;

            return (
              <button
                key={modeOption}
                onClick={() => setActiveMode(modeOption)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive ? 'shadow-md' : 'hover:shadow-sm'}
                `}
                style={{
                  backgroundColor: isActive ? '#3b82f6' : DARK_THEME.background.secondary,
                  color: isActive ? 'white' : DARK_THEME.text.primary,
                  borderColor: DARK_THEME.border.default
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{config.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode Description */}
      {showModeSelector && (
        <div className="text-sm" style={{ color: DARK_THEME.text.secondary }}>
          {modeConfig[activeMode].description}
        </div>
      )}

      {/* Selected Items Display (for non-invite modes) */}
      {activeMode !== 'invite' && totalSelections > 0 && (
        <div className="p-4 border rounded-lg space-y-3"
             style={{
               backgroundColor: DARK_THEME.background.secondary,
               borderColor: DARK_THEME.border.default
             }}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium" style={{ color: DARK_THEME.text.primary }}>
              Selected Items ({totalSelections})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <UserChip
                key={user.userId}
                user={user}
                onRemove={handleRemoveUser}
                size="sm"
              />
            ))}
            {selectedEmails.map((email) => (
              <EmailInviteChip
                key={email}
                email={email}
                onRemove={handleRemoveEmail}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Mode Content */}
      <div className="space-y-4">
        {/* Search Mode */}
        {activeMode === 'search' && (
          <UserSearchDropdown
            onSelect={handleUserSelect}
            placeholder="Search users by name or email..."
            limit={10}
          />
        )}

        {/* Invite Mode */}
        {activeMode === 'invite' && (
          <InviteInput
            onUserSelect={onUserSelect}
            onEmailAdd={handleEmailAdd}
            onSelectionChange={handleInviteSelectionChange}
            placeholder="Enter email or search users..."
            maxSelections={maxSelections}
            allowEmailInvites={allowEmailInvites}
          />
        )}

        {/* Bulk Mode */}
        {activeMode === 'bulk' && (
          <BulkUserLookup
            onUsersFound={handleBulkUsersFound}
            onEmailsNotFound={handleBulkEmailsNotFound}
            placeholder="Enter emails separated by commas or line breaks&#10;Example: john@company.com, jane@company.com"
            maxEmails={50}
          />
        )}

        {/* Validate Mode */}
        {activeMode === 'validate' && (
          <UserValidationInput
            onValidationChange={onValidationResult}
            placeholder="Enter email to validate..."
            label="Email Validation"
            showValidationIcon={true}
            debounceMs={500}
          />
        )}
      </div>

      {/* Usage Instructions */}
      <div className="text-xs p-3 rounded-lg"
           style={{
             backgroundColor: DARK_THEME.background.secondary,
             color: DARK_THEME.text.secondary
           }}>
        <div className="font-medium mb-1">Usage Tips:</div>
        <ul className="space-y-1 list-disc list-inside">
          {activeMode === 'search' && (
            <>
              <li>Type at least 2 characters to start searching</li>
              <li>Use arrow keys to navigate, Enter to select</li>
            </>
          )}
          {activeMode === 'invite' && (
            <>
              <li>Type names or emails, press Enter/Tab/Comma to add</li>
              <li>Existing users will be added directly, emails will be invited</li>
            </>
          )}
          {activeMode === 'bulk' && (
            <>
              <li>Paste multiple emails separated by commas or line breaks</li>
              <li>Results will show existing users vs emails to invite</li>
            </>
          )}
          {activeMode === 'validate' && (
            <>
              <li>Real-time validation shows if email is available for registration</li>
              <li>Green check means available, red X means already taken</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserLookupPanel;
