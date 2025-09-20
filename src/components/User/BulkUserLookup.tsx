// BulkUserLookup Component - Handle bulk email lookup and display results
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React, { useState } from 'react';
import { Upload, Users, Mail, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useBulkUserLookup } from '@/hooks/lookup';
import { UserLookupDto, BulkLookupResponse } from '@/types/user-lookup';
import { UserChip } from './UserChip';
import { EmailInviteChip } from './EmailInviteChip';
import { useTheme } from '@/layouts/hooks/useTheme';
import { Button } from '@/components/ui/Button';

interface BulkUserLookupProps {
  onUsersFound?: (users: UserLookupDto[]) => void;
  onEmailsNotFound?: (emails: string[]) => void;
  onResultsChange?: (result: BulkLookupResponse | null) => void;
  className?: string;
  placeholder?: string;
  maxEmails?: number;
}

export const BulkUserLookup: React.FC<BulkUserLookupProps> = ({
  onUsersFound,
  onEmailsNotFound,
  onResultsChange,
  className = "",
  placeholder = "Enter emails separated by commas or line breaks\nExample: john@company.com, jane@company.com",
  maxEmails = 50
}) => {
  const { theme } = useTheme();
  const { bulkLookup, result, loading, error, clearResult } = useBulkUserLookup();

  const [emailsText, setEmailsText] = useState("");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [inputError, setInputError] = useState("");

  // Parse emails from text input
  const parseEmails = (text: string): string[] => {
    if (!text.trim()) return [];

    return text
      .split(/[,\n\r]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleTextChange = (text: string) => {
    setEmailsText(text);
    setInputError("");

    const emails = parseEmails(text);
    setParsedEmails(emails);

    if (emails.length > maxEmails) {
      setInputError(`Maximum ${maxEmails} emails allowed. Found ${emails.length}.`);
    }
  };

  const handleLookup = async () => {
    if (!parsedEmails.length) {
      setInputError("Please enter at least one email address");
      return;
    }

    if (parsedEmails.length > maxEmails) {
      setInputError(`Maximum ${maxEmails} emails allowed`);
      return;
    }

    // Validate email formats
    const invalidEmails = parsedEmails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      setInputError(`Invalid email format: ${invalidEmails.join(', ')}`);
      return;
    }

    const lookupResult = await bulkLookup(parsedEmails);

    if (lookupResult) {
      // Call callbacks
      if (onUsersFound && lookupResult.existingUsers.length > 0) {
        onUsersFound(lookupResult.existingUsers);
      }
      if (onEmailsNotFound && lookupResult.nonExistentEmails.length > 0) {
        onEmailsNotFound(lookupResult.nonExistentEmails);
      }
      if (onResultsChange) {
        onResultsChange(lookupResult);
      }
    }
  };

  const handleClear = () => {
    setEmailsText("");
    setParsedEmails([]);
    setInputError("");
    clearResult();
    if (onResultsChange) {
      onResultsChange(null);
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const newText = emailsText
      .split(/[,\n\r]+/)
      .map(email => email.trim())
      .filter(email => email !== emailToRemove)
      .join(', ');

    handleTextChange(newText);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
          Bulk Email Lookup
        </label>

        <textarea
          value={emailsText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          rows={6}
          disabled={loading}
          className={`
            w-full px-3 py-2 border rounded-lg resize-none transition-colors
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${inputError ? 'border-red-500' : ''}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: theme.background.secondary,
            borderColor: inputError ? '#ef4444' : theme.border.default,
            color: theme.text.primary,
          }}
        />

        {/* Email count and validation */}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: theme.text.secondary }}>
            {parsedEmails.length} email{parsedEmails.length !== 1 ? 's' : ''} entered
            {maxEmails && ` (max ${maxEmails})`}
          </span>

          {parsedEmails.length > 0 && (
            <span className="text-xs">
              {parsedEmails.filter(isValidEmail).length} valid, {' '}
              {parsedEmails.filter(email => !isValidEmail(email)).length} invalid
            </span>
          )}
        </div>

        {/* Error message */}
        {(inputError || error) && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{inputError || error}</span>
          </div>
        )}
      </div>

      {/* Parsed emails preview */}
      {parsedEmails.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
            Emails to lookup ({parsedEmails.length})
          </label>

          <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto"
               style={{
                 backgroundColor: theme.background.secondary,
                 borderColor: theme.border.default
               }}>
            {parsedEmails.map((email, index) => (
              <div
                key={index}
                className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                  ${isValidEmail(email) ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}
                `}
              >
                <span>{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleLookup}
          disabled={loading || parsedEmails.length === 0 || !!inputError}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Looking up...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Lookup Users
            </>
          )}
        </Button>

        {(parsedEmails.length > 0 || result) && (
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={loading}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4 p-4 border rounded-lg"
             style={{
               backgroundColor: theme.background.secondary,
               borderColor: theme.border.default
             }}>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2" style={{ color: theme.text.primary }}>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Lookup Complete</span>
            </div>

            <div style={{ color: theme.text.secondary }}>
              {result.foundCount} found, {result.notFoundCount} not found of {result.totalRequested} total
            </div>
          </div>

          {/* Existing Users */}
          {result.existingUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <h3 className="font-medium" style={{ color: theme.text.primary }}>
                  Existing Users ({result.foundCount})
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.existingUsers.map((user) => (
                  <UserChip
                    key={user.userId}
                    user={user}
                    size="sm"
                    showOnlineStatus={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Non-existent Emails */}
          {result.nonExistentEmails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-500" />
                <h3 className="font-medium" style={{ color: theme.text.primary }}>
                  Email Invitations ({result.notFoundCount})
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.nonExistentEmails.map((email) => (
                  <EmailInviteChip
                    key={email}
                    email={email}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUserLookup;
