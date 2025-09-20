// UserValidationInput Component - Real-time email validation for registration forms
// Based on USER_LOOKUP_API_DOCUMENTATION.md

"use client";

import React from 'react';
import { Check, X, Loader2, AlertCircle, Mail } from 'lucide-react';
import { useEmailValidation } from '@/hooks/lookup';
import { DARK_THEME } from '@/constants/theme';

interface UserValidationInputProps {
  onValidationChange?: (isValid: boolean, email: string, exists: boolean) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  showValidationIcon?: boolean;
  debounceMs?: number;
  className?: string;
}

export const UserValidationInput: React.FC<UserValidationInputProps> = ({
  onValidationChange,
  placeholder = "Enter email address",
  label = "Email",
  disabled = false,
  required = false,
  showValidationIcon = true,
  debounceMs = 500,
  className = ""
}) => {
  const {
    email,
    setEmail,
    validation,
    validating,
    error,
    isAvailable,
    exists
  } = useEmailValidation(debounceMs);

  // Call callback when validation changes
  React.useEffect(() => {
    if (onValidationChange) {
      const isValid = email.length > 0 && !error && validation !== null && isAvailable;
      onValidationChange(isValid, email, exists);
    }
  }, [email, error, validation, isAvailable, exists, onValidationChange]);

  const getValidationStatus = () => {
    if (!email) return null;
    if (validating) return 'validating';
    if (error) return 'error';
    if (validation) {
      if (validation.exists && !validation.available) return 'taken';
      if (!validation.exists && validation.available) return 'available';
    }
    return null;
  };

  const getValidationMessage = () => {
    if (!email) return null;
    if (validating) return 'Checking email...';
    if (error) return error;
    if (validation) {
      return validation.message;
    }
    return null;
  };

  const getValidationIcon = () => {
    const status = getValidationStatus();

    switch (status) {
      case 'validating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'taken':
        return <X className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4" style={{ color: DARK_THEME.text.secondary }} />;
    }
  };

  const getInputBorderColor = () => {
    const status = getValidationStatus();

    switch (status) {
      case 'available':
        return '#10b981'; // green
      case 'taken':
      case 'error':
        return '#ef4444'; // red
      case 'validating':
        return DARK_THEME.background.primary;
      default:
        return DARK_THEME.border.default;
    }
  };

  const getMessageColor = () => {
    const status = getValidationStatus();

    switch (status) {
      case 'available':
        return '#10b981';
      case 'taken':
      case 'error':
        return '#ef4444';
      case 'validating':
        return DARK_THEME.text.secondary;
      default:
        return DARK_THEME.text.secondary;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium" style={{ color: DARK_THEME.text.primary }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input with validation icon */}
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${showValidationIcon ? 'pr-10' : 'pr-3'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            backgroundColor: DARK_THEME.background.secondary,
            borderColor: getInputBorderColor(),
            color: DARK_THEME.text.primary,
          }}
        />

        {/* Validation Icon */}
        {showValidationIcon && email && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {email && getValidationMessage() && (
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: getMessageColor() }}
        >
          {!showValidationIcon && getValidationIcon()}
          <span>{getValidationMessage()}</span>
        </div>
      )}

      {/* Additional Info */}
      {email && validation && (
        <div className="space-y-1">
          {/* Available Email */}
          {isAvailable && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>Email is available for registration</span>
            </div>
          )}

          {/* Existing User Info */}
          {exists && validation.exists && (
            <div className="p-3 rounded-lg border"
                 style={{
                   backgroundColor:  '#fef3c7',
                   borderColor:  '#f59e0b',
                   color: '#92400e'
                 }}>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">This email is already registered</span>
              </div>
              <div className="text-xs mt-1">
                If this is your account, try logging in instead.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Format Help */}
      {!email && (
        <div className="text-xs" style={{ color: DARK_THEME.text.secondary }}>
          Enter a valid email address (e.g., user@example.com)
        </div>
      )}
    </div>
  );
};

export default UserValidationInput;
