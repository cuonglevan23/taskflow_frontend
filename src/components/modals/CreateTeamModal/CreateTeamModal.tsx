"use client";

import { Users, X, Mail, Plus, Trash2 } from "lucide-react";
import { BaseModal } from "@/components/ui";
import { DARK_THEME, THEME_COLORS } from "@/constants/theme";
import { useCreateTeamModal } from "./hooks/useCreateTeamModal";
import type { CreateTeamModalProps } from "./types";

export default function CreateTeamModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateTeamModalProps) {
  const {
    formState,
    errors,
    isSubmitting,
    handleTeamNameChange,
    handleEmailChange,
    handleCurrentEmailChange,
    handleAddEmail,
    handleRemoveEmail,
    handleCreateTeam,
    handleClose,
    isFormValid
  } = useCreateTeamModal({ onClose, onSuccess });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      showHeader={false}
      className="overflow-hidden"
    >
      {/* Modal Header */}
      <div 
        className="flex items-center justify-between p-6 border-b" 
        style={{ 
          backgroundColor: DARK_THEME.background.primary,
          borderBottomColor: DARK_THEME.border.default
        }}
      >
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" 
            style={{ 
              background: `linear-gradient(to bottom right, ${THEME_COLORS.info[500]}, ${THEME_COLORS.secondary[600]})`
            }}
          >
            <Users className="w-6 h-6" style={{ color: DARK_THEME.text.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DARK_THEME.text.primary }}>
              Create New Team
            </h1>
            <p className="text-sm" style={{ color: DARK_THEME.text.muted }}>
              Create a team and invite members
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            color: DARK_THEME.text.muted,
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = DARK_THEME.text.primary;
            e.currentTarget.style.backgroundColor = DARK_THEME.background.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = DARK_THEME.text.muted;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          type="button"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-6" style={{ backgroundColor: DARK_THEME.background.primary }}>
        
        {/* Team Name Input */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold" style={{ color: DARK_THEME.text.primary }}>
            Team Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={formState.teamName}
              onChange={handleTeamNameChange}
              className="w-full p-5 pl-14 rounded-xl border-2 transition-all duration-300 text-lg backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: `${DARK_THEME.background.secondary}99`,
                color: DARK_THEME.text.primary,
                borderColor: errors.teamNameError ? THEME_COLORS.error[500] : DARK_THEME.border.default,
                boxShadow: errors.teamNameError 
                  ? `0 0 0 4px ${THEME_COLORS.error[500]}33` 
                  : `0 0 0 4px ${THEME_COLORS.info[500]}33`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.teamNameError ? THEME_COLORS.error[400] : THEME_COLORS.info[500];
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.teamNameError ? THEME_COLORS.error[500] : DARK_THEME.border.default;
              }}
              placeholder="Enter team name..."
            />
            
            {/* Team Icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center border" 
                style={{ 
                  background: `linear-gradient(to bottom right, ${THEME_COLORS.info[500]}33, ${THEME_COLORS.secondary[600]}33)`,
                  borderColor: `${THEME_COLORS.info[500]}4D`
                }}
              >
                <Users className="w-5 h-5" style={{ color: THEME_COLORS.info[400] }} />
              </div>
            </div>

            {/* Success Indicator */}
            {formState.teamName && !errors.teamNameError && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse shadow-lg" 
                  style={{ 
                    backgroundColor: THEME_COLORS.success[500],
                    boxShadow: `0 0 10px ${THEME_COLORS.success[500]}80`
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Team Name Error */}
          {errors.teamNameError && (
            <div className="text-sm mt-3 font-medium flex items-center space-x-2" 
                 style={{ color: THEME_COLORS.error[400] }}>
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: THEME_COLORS.error[500] }}
              />
              <span>{errors.teamNameError}</span>
            </div>
          )}
        </div>

        {/* Member Emails Input */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold" style={{ color: DARK_THEME.text.primary }}>
            Team Members (Optional)
          </label>
          
          {/* Email Input with Add Button */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="email"
                value={formState.currentEmail}
                onChange={handleCurrentEmailChange}
                className="w-full p-4 pl-12 rounded-xl border-2 transition-all duration-300 text-base backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: `${DARK_THEME.background.secondary}99`,
                  color: DARK_THEME.text.primary,
                  borderColor: errors.emailError ? THEME_COLORS.error[500] : DARK_THEME.border.default,
                }}
                placeholder="Enter member email..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              
              {/* Email Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Mail className="w-5 h-5" style={{ color: THEME_COLORS.secondary[400] }} />
              </div>
            </div>
            
            <button
              onClick={handleAddEmail}
              className="px-4 py-4 rounded-xl transition-all duration-200 flex items-center justify-center"
              style={{
                backgroundColor: THEME_COLORS.info[600],
                color: DARK_THEME.text.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = THEME_COLORS.info[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME_COLORS.info[600];
              }}
              type="button"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Bulk Email Textarea */}
          <div className="relative">
            <textarea
              value={formState.memberEmails}
              onChange={handleEmailChange}
              rows={4}
              className="w-full p-4 rounded-xl border-2 transition-all duration-300 text-base backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: `${DARK_THEME.background.secondary}99`,
                color: DARK_THEME.text.primary,
                borderColor: DARK_THEME.border.default,
              }}
              placeholder="Or paste multiple emails separated by commas, spaces, or new lines..."
            />
          </div>

          {/* Email List Display */}
          {formState.emailList.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: DARK_THEME.text.secondary }}>
                Members to invite ({formState.emailList.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {formState.emailList.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: `${THEME_COLORS.info[500]}20`,
                      borderColor: `${THEME_COLORS.info[500]}40`,
                      color: DARK_THEME.text.primary
                    }}
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(index)}
                      className="p-1 rounded transition-colors"
                      style={{ color: THEME_COLORS.error[400] }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = THEME_COLORS.error[300];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = THEME_COLORS.error[400];
                      }}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Error */}
          {errors.emailError && (
            <div className="text-sm font-medium flex items-center space-x-2" 
                 style={{ color: THEME_COLORS.error[400] }}>
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: THEME_COLORS.error[500] }}
              />
              <span>{errors.emailError}</span>
            </div>
          )}
        </div>

        {/* General Error */}
        {errors.generalError && (
          <div className="text-sm font-medium flex items-center space-x-2" 
               style={{ color: THEME_COLORS.error[400] }}>
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0" 
              style={{ backgroundColor: THEME_COLORS.error[500] }}
            />
            <span>{errors.generalError}</span>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div 
        className="flex items-center justify-end space-x-3 p-6 border-t" 
        style={{ 
          backgroundColor: DARK_THEME.background.secondary,
          borderTopColor: DARK_THEME.border.default
        }}
      >
        <button
          onClick={handleClose}
          className="px-6 py-3 rounded-lg transition-all duration-200 text-base font-medium"
          style={{
            backgroundColor: 'transparent',
            color: DARK_THEME.text.secondary,
            border: `1px solid ${DARK_THEME.border.default}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DARK_THEME.background.tertiary;
            e.currentTarget.style.color = DARK_THEME.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = DARK_THEME.text.secondary;
          }}
          type="button"
        >
          Cancel
        </button>
        
        <button
          onClick={handleCreateTeam}
          disabled={!isFormValid || isSubmitting}
          className="px-6 py-3 rounded-lg transition-all duration-200 text-base font-medium hover:transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            backgroundColor: THEME_COLORS.info[600],
            color: DARK_THEME.text.primary,
          }}
          onMouseEnter={(e) => {
            if (isFormValid && !isSubmitting) {
              e.currentTarget.style.backgroundColor = THEME_COLORS.info[700];
            }
          }}
          onMouseLeave={(e) => {
            if (isFormValid && !isSubmitting) {
              e.currentTarget.style.backgroundColor = THEME_COLORS.info[600];
            }
          }}
          type="button"
        >
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </button>
      </div>
    </BaseModal>
  );
}