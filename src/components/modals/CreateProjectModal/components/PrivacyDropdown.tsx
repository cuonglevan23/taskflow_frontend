import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PrivacyOption } from '../types';
import { PRIVACY_OPTIONS } from '../constants';
import { DARK_THEME, THEME_COLORS } from '@/constants/theme';

interface PrivacyDropdownProps {
    selectedPrivacy: PrivacyOption;
    isOpen: boolean;
    onSelect: (privacy: PrivacyOption) => void;
    onToggle: (open: boolean) => void;
}

export const PrivacyDropdown: React.FC<PrivacyDropdownProps> = ({
    selectedPrivacy,
    isOpen,
    onSelect,
    onToggle
}) => {
    return (
        <div className="relative">
            <button
                onClick={() => onToggle(!isOpen)}
                className="w-full p-5 rounded-xl border-2 backdrop-blur-sm flex items-center justify-between transition-all duration-300 text-lg shadow-lg focus:outline-none focus:ring-2"
                style={{
                    backgroundColor: `${DARK_THEME.background.secondary}99`,
                    borderColor: DARK_THEME.border.default,
                    color: DARK_THEME.text.primary,
                    boxShadow: `0 0 0 4px ${THEME_COLORS.info[500]}33`,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = DARK_THEME.border.muted;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = DARK_THEME.border.default;
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = THEME_COLORS.info[500];
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = DARK_THEME.border.default;
                }}
                type="button"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border" 
                         style={{ 
                             background: `linear-gradient(to bottom right, ${THEME_COLORS.info[500]}33, ${THEME_COLORS.secondary[600]}33)`,
                             borderColor: `${THEME_COLORS.info[500]}4D`
                         }}>
                        <span className="text-2xl">{selectedPrivacy.icon}</span>
                    </div>
                    <div className="text-left">
                        <div className="font-semibold" style={{ color: DARK_THEME.text.primary }}>{selectedPrivacy.label}</div>
                        <div className="text-sm" style={{ color: DARK_THEME.text.muted }}>{selectedPrivacy.description}</div>
                    </div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 border-2 rounded-xl shadow-2xl z-50 backdrop-blur-sm overflow-hidden"
                     style={{
                         backgroundColor: `${DARK_THEME.background.primary}F2`,
                         borderColor: `${DARK_THEME.border.default}80`
                     }}>
                    {PRIVACY_OPTIONS.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option)}
                            className="w-full p-4 text-left transition-all duration-200"
                            style={{
                                backgroundColor: selectedPrivacy.id === option.id 
                                    ? `${THEME_COLORS.info[500]}33` 
                                    : 'transparent',
                                borderLeft: selectedPrivacy.id === option.id 
                                    ? `4px solid ${THEME_COLORS.info[500]}` 
                                    : 'none',
                                borderBottom: index !== PRIVACY_OPTIONS.length - 1 
                                    ? `1px solid ${DARK_THEME.border.default}80` 
                                    : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedPrivacy.id !== option.id) {
                                    e.currentTarget.style.backgroundColor = `${DARK_THEME.background.secondary}CC`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedPrivacy.id !== option.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                            type="button"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center border" 
                                     style={{ 
                                         background: `linear-gradient(to bottom right, ${THEME_COLORS.info[500]}33, ${THEME_COLORS.secondary[600]}33)`,
                                         borderColor: `${THEME_COLORS.info[500]}4D`
                                     }}>
                                    <span className="text-xl">{option.icon}</span>
                                </div>
                                <div>
                                    <div className="font-semibold" style={{ color: DARK_THEME.text.primary }}>{option.label}</div>
                                    <div className="text-sm" style={{ color: DARK_THEME.text.muted }}>{option.description}</div>
                                </div>
                                {selectedPrivacy.id === option.id && (
                                    <div className="ml-auto">
                                        <div className="w-3 h-3 rounded-full" 
                                             style={{ backgroundColor: THEME_COLORS.info[500] }}></div>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};