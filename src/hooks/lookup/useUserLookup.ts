// User Lookup Hooks - Custom hooks for managing user lookup logic
// Based on USER_LOOKUP_API_DOCUMENTATION.md

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLookupService } from '@/services/lookup';
import {
  UserLookupDto,
  BulkLookupResponse,
  EmailValidationResponse,
  SingleLookupResult
} from '@/types/user-lookup';

/**
 * Hook for single email lookup
 * Use Cases: Invite team members, share permissions, form validation
 */
export const useUserLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupUser = useCallback(async (email: string): Promise<SingleLookupResult | null> => {
    if (!email || !UserLookupService.isValidEmail(email)) {
      setError('Invalid email format');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      return await UserLookupService.lookupUser(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lookup failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookupUser, loading, error };
};

/**
 * Hook for user search with autocomplete
 * Use Cases: Assign task, mention user, find team members
 */
export const useUserSearch = (debounceMs: number = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserLookupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(async (searchQuery: string, limit: number = 10) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await UserLookupService.searchUsers(searchQuery, limit);
      setResults(users);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchUsers, debounceMs]);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    searchUsers,
    clearResults
  };
};

/**
 * Hook for bulk email lookup
 * Use Cases: Team invitations, share with multiple users
 */
export const useBulkUserLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkLookupResponse | null>(null);

  const bulkLookup = useCallback(async (emails: string[]) => {
    if (!emails || emails.length === 0) {
      setError('No emails provided');
      return null;
    }

    // Validate all emails
    const invalidEmails = emails.filter(email => !UserLookupService.isValidEmail(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email formats: ${invalidEmails.join(', ')}`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const lookupResult = await UserLookupService.bulkLookupUsers(emails);
      setResult(lookupResult);
      return lookupResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk lookup failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    bulkLookup,
    result,
    loading,
    error,
    clearResult
  };
};

/**
 * Hook for email validation
 * Use Cases: Registration form, forgot password validation
 */
export const useEmailValidation = (debounceMs: number = 500) => {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState<EmailValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validateEmail = useCallback(async (emailToValidate: string) => {
    if (!emailToValidate || !UserLookupService.isValidEmail(emailToValidate)) {
      setValidation(null);
      setError('Invalid email format');
      return null;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await UserLookupService.validateEmail(emailToValidate);
      setValidation(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  // Debounced validation effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (email) {
      debounceRef.current = setTimeout(() => {
        validateEmail(email);
      }, debounceMs);
    } else {
      setValidation(null);
      setError(null);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [email, validateEmail, debounceMs]);

  const clearValidation = useCallback(() => {
    setEmail('');
    setValidation(null);
    setError(null);
  }, []);

  return {
    email,
    setEmail,
    validation,
    validating,
    error,
    validateEmail,
    clearValidation,
    isAvailable: validation?.available || false,
    exists: validation?.exists || false
  };
};

/**
 * Hook for managing invite input with both users and email invites
 * Use Cases: Team invitation forms, sharing permissions
 */
export const useInviteInput = () => {
  const [selectedUsers, setSelectedUsers] = useState<UserLookupDto[]>([]);
  const [emailInvites, setEmailInvites] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { query, setQuery, results, loading, clearResults } = useUserSearch();
  const { lookupUser } = useUserLookup();

  const handleUserSelect = useCallback((user: UserLookupDto) => {
    // Avoid duplicates
    if (!selectedUsers.find(u => u.userId === user.userId)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setInputValue('');
    setQuery('');
    clearResults();
  }, [selectedUsers, setQuery, clearResults]);

  const handleEmailAdd = useCallback((email: string) => {
    if (UserLookupService.isValidEmail(email) && !emailInvites.includes(email)) {
      setEmailInvites(prev => [...prev, email]);
    }
    setInputValue('');
    setQuery('');
    clearResults();
  }, [emailInvites, setQuery, clearResults]);

  const handleInputSubmit = useCallback(async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (UserLookupService.isValidEmail(trimmedInput)) {
      const result = await lookupUser(trimmedInput);
      if (result?.exists && result.user) {
        handleUserSelect(result.user);
      } else {
        handleEmailAdd(trimmedInput);
      }
    }
  }, [lookupUser, handleUserSelect, handleEmailAdd]);

  const removeUser = useCallback((userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.userId !== userId));
  }, []);

  const removeEmail = useCallback((email: string) => {
    setEmailInvites(prev => prev.filter(e => e !== email));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedUsers([]);
    setEmailInvites([]);
    setInputValue('');
    setQuery('');
    clearResults();
  }, [setQuery, clearResults]);

  const totalSelected = selectedUsers.length + emailInvites.length;

  return {
    // Input state
    inputValue,
    setInputValue,
    query,
    setQuery,

    // Search results
    suggestions: results,
    loading,

    // Selected items
    selectedUsers,
    emailInvites,
    totalSelected,

    // Actions
    handleUserSelect,
    handleEmailAdd,
    handleInputSubmit,
    removeUser,
    removeEmail,
    clearAll
  };
};

/**
 * Hook for managing user selection state
 * Use Cases: Task assignment, permission management
 */
export const useUserSelection = (allowMultiple: boolean = true) => {
  const [selectedUsers, setSelectedUsers] = useState<UserLookupDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLookupDto | null>(null);

  const selectUser = useCallback((user: UserLookupDto) => {
    if (allowMultiple) {
      setSelectedUsers(prev => {
        const exists = prev.find(u => u.userId === user.userId);
        if (exists) return prev; // Avoid duplicates
        return [...prev, user];
      });
    } else {
      setSelectedUser(user);
    }
  }, [allowMultiple]);

  const deselectUser = useCallback((userId: number) => {
    if (allowMultiple) {
      setSelectedUsers(prev => prev.filter(u => u.userId !== userId));
    } else {
      setSelectedUser(null);
    }
  }, [allowMultiple]);

  const clearSelection = useCallback(() => {
    if (allowMultiple) {
      setSelectedUsers([]);
    } else {
      setSelectedUser(null);
    }
  }, [allowMultiple]);

  const isSelected = useCallback((userId: number) => {
    if (allowMultiple) {
      return selectedUsers.some(u => u.userId === userId);
    } else {
      return selectedUser?.userId === userId;
    }
  }, [allowMultiple, selectedUsers, selectedUser]);

  return {
    selectedUsers: allowMultiple ? selectedUsers : (selectedUser ? [selectedUser] : []),
    selectedUser: allowMultiple ? null : selectedUser,
    selectUser,
    deselectUser,
    clearSelection,
    isSelected,
    hasSelection: allowMultiple ? selectedUsers.length > 0 : selectedUser !== null
  };
};
